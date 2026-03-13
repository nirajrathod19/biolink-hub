-- =====================================================
-- 1. STORE INTEGRATIONS TABLE (Multi-platform support)
-- =====================================================
CREATE TABLE public.store_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('shopify', 'wix', 'bigcommerce', 'ebay', 'facebook', 'etsy', 'amazon')),
  store_domain TEXT,
  store_name TEXT,
  access_token TEXT, -- Encrypted store access token
  api_key TEXT, -- Some platforms use API key
  api_secret TEXT, -- Some platforms need secret
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.store_integrations ENABLE ROW LEVEL SECURITY;

-- Policies: Only user can manage their store integrations
CREATE POLICY "Users can view their own store integrations"
ON public.store_integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own store integrations"
ON public.store_integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own store integrations"
ON public.store_integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own store integrations"
ON public.store_integrations FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_store_integrations_updated_at
BEFORE UPDATE ON public.store_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_store_integrations_user ON public.store_integrations(user_id);
CREATE INDEX idx_store_integrations_platform ON public.store_integrations(user_id, platform);

-- =====================================================
-- 2. AD IMPRESSIONS TABLE (For tracking AdSense views)
-- =====================================================
CREATE TABLE public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ad_slot TEXT,
  estimated_revenue NUMERIC DEFAULT 0,
  visitor_ip TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own ad impressions"
ON public.ad_impressions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert ad impressions"
ON public.ad_impressions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all ad impressions"
ON public.ad_impressions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for analytics
CREATE INDEX idx_ad_impressions_user ON public.ad_impressions(user_id);
CREATE INDEX idx_ad_impressions_profile ON public.ad_impressions(profile_id);
CREATE INDEX idx_ad_impressions_created ON public.ad_impressions(created_at DESC);
CREATE INDEX idx_ad_impressions_user_date ON public.ad_impressions(user_id, created_at);

-- =====================================================
-- 3. ADSENSE SETTINGS TABLE (Creator's AdSense config)
-- =====================================================
CREATE TABLE public.adsense_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_revenue_sharing_enabled BOOLEAN DEFAULT false,
  total_impressions BIGINT DEFAULT 0,
  total_estimated_revenue NUMERIC DEFAULT 0,
  creator_earnings NUMERIC DEFAULT 0, -- 50% share
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adsense_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own adsense settings"
ON public.adsense_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own adsense settings"
ON public.adsense_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all adsense settings"
ON public.adsense_settings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_adsense_settings_updated_at
BEFORE UPDATE ON public.adsense_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX idx_adsense_settings_user ON public.adsense_settings(user_id);

-- =====================================================
-- 4. ADD ADMIN ADSENSE CONFIG (Global settings)
-- =====================================================
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES 
  ('adsense_cpm_rate', '2.50'),
  ('adsense_creator_share', '0.50'),
  ('adsense_reporting_api_enabled', 'false')
ON CONFLICT (setting_key) DO NOTHING;