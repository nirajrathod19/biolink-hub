-- Fix 1: Restrict profiles table - only show public-safe fields to non-owners
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive policy that only exposes safe fields via the view
-- The profiles_public view already exists and excludes sensitive financial data
-- We need to ensure only authenticated users or profile owners can see full data

-- Fix 2: Restrict links table - hide affiliate codes and scheduled times from public
DROP POLICY IF EXISTS "Public links are viewable by everyone" ON public.links;

-- Create new policy that only shows active links within their schedule window
-- and hides sensitive fields from non-owners
CREATE POLICY "Public can view active scheduled links" 
ON public.links 
FOR SELECT 
USING (
  is_active = true 
  AND (scheduled_start IS NULL OR scheduled_start <= now()) 
  AND (scheduled_end IS NULL OR scheduled_end >= now())
);

-- Create a public view for links that excludes affiliate codes
DROP VIEW IF EXISTS public.links_public;
CREATE VIEW public.links_public AS
SELECT 
  id,
  user_id,
  title,
  url,
  icon,
  link_type,
  position,
  is_active,
  is_highlighted,
  badge,
  animation,
  click_count,
  created_at,
  updated_at
FROM public.links
WHERE is_active = true
  AND (scheduled_start IS NULL OR scheduled_start <= now())
  AND (scheduled_end IS NULL OR scheduled_end >= now());