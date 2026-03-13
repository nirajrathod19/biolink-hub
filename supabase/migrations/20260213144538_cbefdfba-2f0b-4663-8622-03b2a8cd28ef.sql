
-- Add content_track column to profiles
ALTER TABLE public.profiles 
ADD COLUMN content_track text DEFAULT 'links';

-- Update handle_new_user to store content_track from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, referral_code, content_track)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    public.generate_referral_code(),
    COALESCE(NEW.raw_user_meta_data->>'content_track', 'links')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');
  
  RETURN NEW;
END;
$$;
