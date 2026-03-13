
-- Add ads_balance and total_withdrawn to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ads_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_withdrawn numeric DEFAULT 0.00;

-- Create ad_earnings_logs table for transparency
CREATE TABLE public.ad_earnings_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  impressions integer DEFAULT 0,
  gross_revenue numeric DEFAULT 0,
  creator_share numeric DEFAULT 0,
  platform_share numeric DEFAULT 0,
  revenue_share_pct numeric DEFAULT 50,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.ad_earnings_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own earnings logs"
ON public.ad_earnings_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all earnings logs"
ON public.ad_earnings_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert earnings logs"
ON public.ad_earnings_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update earnings logs"
ON public.ad_earnings_logs FOR UPDATE
USING (true);

-- Add admin settings for ad slot controls
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES 
  ('ad_slot_header', 'true'),
  ('ad_slot_mid', 'true'),
  ('ad_slot_footer', 'true')
ON CONFLICT (setting_key) DO NOTHING;
