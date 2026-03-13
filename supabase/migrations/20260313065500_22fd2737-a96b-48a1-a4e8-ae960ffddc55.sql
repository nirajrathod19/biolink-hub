
-- Add bank_details to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_details jsonb DEFAULT NULL;

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  code text NOT NULL,
  type text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(creator_id, code)
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Creators can manage their own coupons
CREATE POLICY "Creators can manage their coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Public can view active coupons (for validation)
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT TO anon, authenticated
  USING (is_active = true);
