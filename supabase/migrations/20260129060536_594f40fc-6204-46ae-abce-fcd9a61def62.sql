-- Fix Security Issue #1: Profiles table exposing sensitive financial data
-- Create a public view that only exposes non-sensitive profile fields

CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  bio,
  avatar_url,
  theme_color,
  template,
  interests,
  created_at,
  updated_at
  -- Excludes: wallet_balance, pending_revenue, referral_code, referred_by, is_pro, total_clicks, unique_clicks
FROM public.profiles;

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new restricted policies for profiles
-- Users can view their own full profile (including financial data)
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix Security Issue #2: Tip jar exposing payment account details
-- Create a public view that hides payment details

CREATE VIEW public.tip_jar_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  is_enabled,
  message,
  minimum_amount,
  suggested_amounts,
  created_at,
  updated_at
  -- Excludes: paypal_email, venmo_username, cashapp_tag
FROM public.tip_jar
WHERE is_enabled = true;

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view enabled tip jars" ON public.tip_jar;

-- Public can only access tip jar through the secure view (no direct table access for non-owners)
-- The existing "Users can manage their own tip jar" policy handles owner access