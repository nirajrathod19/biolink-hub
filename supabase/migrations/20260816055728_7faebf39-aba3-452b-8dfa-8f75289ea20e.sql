-- 1. Monetization eligibility
DO $$ BEGIN
  CREATE TYPE public.monetization_status AS ENUM ('NOT_ELIGIBLE','PENDING_REVIEW','APPROVED','SUSPENDED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.creator_monetization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status public.monetization_status NOT NULL DEFAULT 'NOT_ELIGIBLE',
  revenue_share_pct numeric NOT NULL DEFAULT 50,
  applied_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.creator_monetization TO authenticated;
GRANT ALL ON public.creator_monetization TO service_role;
ALTER TABLE public.creator_monetization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own monetization" ON public.creator_monetization
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users apply for monetization" ON public.creator_monetization
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'PENDING_REVIEW');
CREATE POLICY "Admins manage monetization" ON public.creator_monetization
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_creator_monetization_updated_at BEFORE UPDATE ON public.creator_monetization
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Creator revenue ledger
DO $$ BEGIN
  CREATE TYPE public.revenue_source AS ENUM ('ADS','PRODUCT','TIP','AFFILIATE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.revenue_status AS ENUM ('ESTIMATED','PENDING','CONFIRMED','AVAILABLE','PAID','REVERSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.creator_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  source public.revenue_source NOT NULL,
  gross_amount numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  eligible_amount numeric NOT NULL DEFAULT 0,
  creator_share numeric NOT NULL DEFAULT 0,
  platform_share numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  period date,
  status public.revenue_status NOT NULL DEFAULT 'ESTIMATED',
  reference_id text,
  reverses_id uuid REFERENCES public.creator_revenue(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.creator_revenue TO authenticated;
GRANT ALL ON public.creator_revenue TO service_role;
ALTER TABLE public.creator_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators view own revenue" ON public.creator_revenue
  FOR SELECT TO authenticated USING (auth.uid() = creator_id OR public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_creator_revenue_creator ON public.creator_revenue(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_revenue_created ON public.creator_revenue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_revenue_status ON public.creator_revenue(status);
CREATE INDEX IF NOT EXISTS idx_creator_revenue_source ON public.creator_revenue(source);
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_revenue_ref ON public.creator_revenue(source, reference_id) WHERE reference_id IS NOT NULL;

CREATE TRIGGER update_creator_revenue_updated_at BEFORE UPDATE ON public.creator_revenue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Block deletes on the ledger entirely
CREATE OR REPLACE FUNCTION public.prevent_ledger_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Revenue ledger entries cannot be deleted; use a reversal entry';
END;
$$;
CREATE TRIGGER trg_prevent_creator_revenue_delete BEFORE DELETE ON public.creator_revenue
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_delete();

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();