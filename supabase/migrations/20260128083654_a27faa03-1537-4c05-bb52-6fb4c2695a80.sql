-- Add link scheduling and animation columns to links table
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS scheduled_start timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS scheduled_end timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS animation text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_highlighted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS link_type text DEFAULT 'link',
ADD COLUMN IF NOT EXISTS affiliate_code text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_affiliate boolean DEFAULT false;

-- Create digital products table
CREATE TABLE IF NOT EXISTS public.digital_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  file_url text,
  preview_image text,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own products"
  ON public.digital_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active products"
  ON public.digital_products FOR SELECT
  USING (is_active = true);

-- Create tip jar / donations table
CREATE TABLE IF NOT EXISTS public.tip_jar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_enabled boolean DEFAULT false,
  paypal_email text,
  venmo_username text,
  cashapp_tag text,
  minimum_amount numeric DEFAULT 1,
  suggested_amounts jsonb DEFAULT '[3, 5, 10]'::jsonb,
  message text DEFAULT 'Support my work!',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tip_jar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tip jar"
  ON public.tip_jar FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view enabled tip jars"
  ON public.tip_jar FOR SELECT
  USING (is_enabled = true);

-- Create affiliate links tracking table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES public.links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  visitor_ip text,
  referrer text,
  user_agent text,
  country text,
  device_type text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own affiliate clicks"
  ON public.affiliate_clicks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert affiliate clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (true);

-- Enhanced analytics - add geographic and device data to click_logs
ALTER TABLE public.click_logs
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS city text;

-- Create GA settings table
CREATE TABLE IF NOT EXISTS public.analytics_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  ga_measurement_id text,
  meta_pixel_id text,
  is_ga_enabled boolean DEFAULT false,
  is_meta_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analytics settings"
  ON public.analytics_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_digital_products_updated_at
  BEFORE UPDATE ON public.digital_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tip_jar_updated_at
  BEFORE UPDATE ON public.tip_jar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_settings_updated_at
  BEFORE UPDATE ON public.analytics_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();