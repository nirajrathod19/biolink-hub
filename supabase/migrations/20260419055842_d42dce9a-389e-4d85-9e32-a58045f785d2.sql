-- 1. Profiles: video background
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS video_background_url text,
  ADD COLUMN IF NOT EXISTS video_overlay_opacity integer DEFAULT 40;

-- 2. Tip jar: Razorpay support
ALTER TABLE public.tip_jar
  ADD COLUMN IF NOT EXISTS razorpay_enabled boolean DEFAULT false;

-- 3. Digital products: upsell suggestions
ALTER TABLE public.digital_products
  ADD COLUMN IF NOT EXISTS upsell_product_ids uuid[] DEFAULT '{}'::uuid[];

-- 4. Leads: link to a requested lead-magnet product
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS digital_product_id uuid;

-- 5. Tip transactions log
CREATE TABLE IF NOT EXISTS public.tip_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  supporter_name text,
  supporter_email text,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  message text,
  payment_id text,
  order_id text,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tip_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tips"
  ON public.tip_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can view their tips"
  ON public.tip_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all tips"
  ON public.tip_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can update tips"
  ON public.tip_transactions FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tip_transactions_creator ON public.tip_transactions(creator_id, created_at DESC);