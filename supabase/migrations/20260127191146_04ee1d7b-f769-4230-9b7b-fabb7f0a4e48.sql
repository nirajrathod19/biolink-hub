-- Create admin_sessions table for magic link verification
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view their own sessions
CREATE POLICY "Admins can view their sessions"
ON public.admin_sessions
FOR SELECT
USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));

-- Create index for token lookup
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(token);
CREATE INDEX idx_admin_sessions_user_id ON public.admin_sessions(user_id);

-- Create admin_settings table for AdSense and other settings
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.admin_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read certain settings (like adsense config)
CREATE POLICY "Public can read active settings"
ON public.admin_settings
FOR SELECT
USING (setting_key IN ('adsense_publisher_id', 'adsense_enabled'));

-- Insert default AdSense settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES 
('adsense_publisher_id', ''),
('adsense_enabled', 'false')
ON CONFLICT (setting_key) DO NOTHING;