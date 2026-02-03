-- Fix Security Issue #1: AdSense Publisher ID exposed publicly
-- Remove the public read policy for sensitive admin settings

DROP POLICY IF EXISTS "Public can read active settings" ON public.admin_settings;

-- Create a more restrictive policy - only authenticated users can read non-sensitive settings
-- AdSense settings should only be readable by admins or the system
CREATE POLICY "Authenticated users can read public settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (setting_key IN ('adsense_enabled'));

-- Fix Security Issue #2: Social links exposing user_id
-- Create a public view that hides user_id

CREATE VIEW public.social_links_public
WITH (security_invoker = on) AS
SELECT 
  id,
  platform,
  url,
  is_active,
  position,
  created_at
  -- Excludes: user_id
FROM public.social_links
WHERE is_active = true;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public social links are viewable by everyone" ON public.social_links;