-- 1. Duplicate protection on the revenue ledger
CREATE UNIQUE INDEX IF NOT EXISTS creator_revenue_reference_unique
  ON public.creator_revenue (reference_id)
  WHERE reference_id IS NOT NULL;

-- 2. Immutability: ledger rows cannot be updated except status transitions by service_role
CREATE OR REPLACE FUNCTION public.prevent_ledger_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('role', true) IS DISTINCT FROM 'service_role'
     AND auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Revenue ledger entries are immutable; use a reversal entry';
  END IF;
  IF NEW.gross_amount IS DISTINCT FROM OLD.gross_amount
     OR NEW.deductions IS DISTINCT FROM OLD.deductions
     OR NEW.eligible_amount IS DISTINCT FROM OLD.eligible_amount
     OR NEW.creator_share IS DISTINCT FROM OLD.creator_share
     OR NEW.platform_share IS DISTINCT FROM OLD.platform_share
     OR NEW.creator_id IS DISTINCT FROM OLD.creator_id
     OR NEW.source IS DISTINCT FROM OLD.source THEN
    RAISE EXCEPTION 'Revenue amounts are immutable; use a reversal entry';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_creator_revenue_update ON public.creator_revenue;
CREATE TRIGGER trg_prevent_creator_revenue_update
BEFORE UPDATE ON public.creator_revenue
FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_update();

-- 3. Monetization lifecycle notifications + audit
CREATE OR REPLACE FUNCTION public.notify_monetization_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_title text;
  v_body text;
  v_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'PENDING_REVIEW' THEN
      v_type := 'monetization_submitted';
      v_title := 'Monetization application submitted';
      v_body := 'We received your application. You will be notified once it is reviewed.';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
      RETURN NEW;
    END IF;
    CASE NEW.status
      WHEN 'APPROVED' THEN
        v_type := 'monetization_approved';
        v_title := 'Monetization approved';
        v_body := 'You are approved for revenue sharing at ' || NEW.revenue_share_pct || '% of eligible net revenue.';
      WHEN 'REJECTED' THEN
        v_type := 'monetization_rejected';
        v_title := 'Monetization application rejected';
        v_body := COALESCE(NEW.review_notes, 'Your application did not meet the monetization requirements.');
      WHEN 'SUSPENDED' THEN
        v_type := 'monetization_suspended';
        v_title := 'Monetization suspended';
        v_body := COALESCE(NEW.review_notes, 'Your monetization has been suspended. Contact support for details.');
      WHEN 'PENDING_REVIEW' THEN
        v_type := 'monetization_submitted';
        v_title := 'Monetization application under review';
        v_body := 'Your application is being reviewed.';
      ELSE
        v_type := 'monetization_update';
        v_title := 'Monetization status updated';
        v_body := 'Your monetization status is now ' || NEW.status || '.';
    END CASE;

    INSERT INTO public.security_audit_log (user_id, event_type, event_data, success)
    VALUES (
      NEW.reviewed_by,
      'monetization_status_change',
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'monetization_id', NEW.id,
        'from_status', OLD.status,
        'to_status', NEW.status,
        'revenue_share_pct', NEW.revenue_share_pct,
        'notes', NEW.review_notes
      ),
      true
    );
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  VALUES (NEW.user_id, v_type, v_title, v_body, '/dashboard/revenue',
          jsonb_build_object('monetization_id', NEW.id, 'status', NEW.status));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_monetization_change ON public.creator_monetization;
CREATE TRIGGER trg_notify_monetization_change
AFTER INSERT OR UPDATE ON public.creator_monetization
FOR EACH ROW EXECUTE FUNCTION public.notify_monetization_change();

-- 4. Payout notifications
CREATE OR REPLACE FUNCTION public.notify_withdrawal_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('completed', 'paid', 'approved') THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
      VALUES (NEW.user_id, 'payout_completed', 'Payout completed',
              'Your payout of ' || NEW.amount || ' has been processed.',
              '/dashboard/wallet', jsonb_build_object('withdrawal_id', NEW.id));
    ELSIF NEW.status IN ('failed', 'rejected') THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
      VALUES (NEW.user_id, 'payout_failed', 'Payout failed',
              'Your payout of ' || NEW.amount || ' could not be processed and was returned to your wallet.',
              '/dashboard/wallet', jsonb_build_object('withdrawal_id', NEW.id));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_withdrawal_status ON public.withdrawals;
CREATE TRIGGER trg_notify_withdrawal_status
AFTER UPDATE ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.notify_withdrawal_status();

-- 5. Tip notifications
CREATE OR REPLACE FUNCTION public.notify_tip_received()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'paid' OR NEW.status = 'completed' OR NEW.status = 'success' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
    VALUES (NEW.creator_id, 'tip_received', 'You received a tip',
            COALESCE(NEW.supporter_name, 'Someone') || ' sent you ' || NEW.amount || ' ' || COALESCE(NEW.currency, 'USD') || '.',
            '/dashboard/revenue', jsonb_build_object('tip_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_tip_received ON public.tip_transactions;
CREATE TRIGGER trg_notify_tip_received
AFTER INSERT ON public.tip_transactions
FOR EACH ROW EXECUTE FUNCTION public.notify_tip_received();

-- 6. Product sale notification (extends existing sale logging)
CREATE OR REPLACE FUNCTION public.notify_product_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.copies_sold > OLD.copies_sold THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
    VALUES (NEW.user_id, 'product_sale', 'New product sale',
            'You sold "' || NEW.title || '".',
            '/dashboard/revenue', jsonb_build_object('product_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_product_sale ON public.digital_products;
CREATE TRIGGER trg_notify_product_sale
AFTER UPDATE ON public.digital_products
FOR EACH ROW EXECUTE FUNCTION public.notify_product_sale();