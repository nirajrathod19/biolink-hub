
-- Auto-verify Full Pro users via trigger
CREATE OR REPLACE FUNCTION public.auto_verify_full_pro()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plan = 'full' AND NEW.status = 'active' THEN
    UPDATE profiles SET is_verified = true WHERE user_id = NEW.user_id;
  END IF;
  -- If subscription cancelled or downgraded, remove auto-verify
  IF (NEW.status = 'cancelled' OR NEW.plan != 'full') AND OLD.plan = 'full' AND OLD.status = 'active' THEN
    UPDATE profiles SET is_verified = false WHERE user_id = NEW.user_id AND is_verified = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_verify_full_pro
  AFTER INSERT OR UPDATE ON public.wallet_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_full_pro();
