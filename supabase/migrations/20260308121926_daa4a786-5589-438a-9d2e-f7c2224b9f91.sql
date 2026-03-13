
-- Recreate profiles_public view with new columns
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT 
  id, user_id, username, display_name, bio, avatar_url, 
  theme_color, template, interests, is_pro,
  is_verified, announcement_text,
  created_at, updated_at
FROM public.profiles;

-- Create leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can view their leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
