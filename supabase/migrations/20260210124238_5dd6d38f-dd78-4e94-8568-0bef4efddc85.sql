
-- Update profiles_public view to include is_pro
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
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
    is_pro,
    created_at,
    updated_at
  FROM public.profiles;

-- Create username availability check function
CREATE OR REPLACE FUNCTION public.check_username_available(desired_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = lower(desired_username)
  );
$$;
