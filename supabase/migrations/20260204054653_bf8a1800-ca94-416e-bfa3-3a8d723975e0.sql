-- Add public select policy for social_links (for public bio pages)
CREATE POLICY "Public can view active social links" 
ON public.social_links 
FOR SELECT 
USING (is_active = true);

-- Add public select policy for links (for public bio pages)
DROP POLICY IF EXISTS "Public links are viewable by everyone" ON public.links;
CREATE POLICY "Public links are viewable by everyone" 
ON public.links 
FOR SELECT 
USING (is_active = true);