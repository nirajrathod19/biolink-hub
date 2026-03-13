
-- Activity logs table for global admin feed
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  action_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (true);

-- Create index for fast time-based queries
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);

-- Trigger function to auto-log profile updates
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action_type, description)
  VALUES (NEW.user_id, 'profile_update', 'Updated their profile');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_profile_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.display_name IS DISTINCT FROM NEW.display_name OR OLD.bio IS DISTINCT FROM NEW.bio OR OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
EXECUTE FUNCTION public.log_profile_update();

-- Trigger to log digital product sales
CREATE OR REPLACE FUNCTION public.log_product_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.copies_sold > OLD.copies_sold THEN
    INSERT INTO public.activity_logs (user_id, action_type, description, metadata)
    VALUES (NEW.user_id, 'product_sale', 'Sold a digital product: ' || NEW.title, jsonb_build_object('product_id', NEW.id, 'title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_product_sale
AFTER UPDATE ON public.digital_products
FOR EACH ROW
EXECUTE FUNCTION public.log_product_sale();

-- Trigger to log new signups
CREATE OR REPLACE FUNCTION public.log_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action_type, description)
  VALUES (NEW.user_id, 'signup', 'Joined the platform as @' || NEW.username);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_user_signup
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_user_signup();

-- Trigger to log ad clicks
CREATE OR REPLACE FUNCTION public.log_ad_click()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_user_id uuid;
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    SELECT user_id INTO profile_user_id FROM profiles WHERE id = NEW.profile_id LIMIT 1;
    IF profile_user_id IS NOT NULL THEN
      INSERT INTO public.activity_logs (user_id, action_type, description, metadata)
      VALUES (profile_user_id, 'link_click', 'Link clicked on profile', jsonb_build_object('link_id', NEW.link_id));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_ad_click
AFTER INSERT ON public.click_logs
FOR EACH ROW
EXECUTE FUNCTION public.log_ad_click();
