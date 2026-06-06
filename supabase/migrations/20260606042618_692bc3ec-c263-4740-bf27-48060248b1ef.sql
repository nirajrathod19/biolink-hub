
-- 1. content_track: enable RLS
ALTER TABLE public.content_track ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.content_track TO authenticated;
GRANT ALL ON public.content_track TO service_role;
CREATE POLICY "Owners can view their content tracking"
  ON public.content_track FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- 2. user_wallets: enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_wallets TO authenticated;
GRANT ALL ON public.user_wallets TO service_role;
CREATE POLICY "Users can view their own wallet"
  ON public.user_wallets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. wallet_subscriptions: drop unrestricted policy (service_role bypasses RLS anyway)
DROP POLICY IF EXISTS "System can manage wallet subscriptions" ON public.wallet_subscriptions;

-- 4. profiles: remove blanket public SELECT (unauth users should use profiles_public view)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 5. store_integrations: drop public credential exposure, create safe public view
DROP POLICY IF EXISTS "Public can view active store integrations" ON public.store_integrations;

CREATE OR REPLACE VIEW public.store_integrations_public
WITH (security_invoker = true) AS
SELECT id, user_id, platform, store_domain, store_name, is_active
FROM public.store_integrations
WHERE is_active = true;

GRANT SELECT ON public.store_integrations_public TO anon, authenticated;

-- Allow anon/authenticated to read non-sensitive columns through the view.
-- The view uses security_invoker, so the underlying table still needs a SELECT policy
-- exposing only safe rows. Add a policy that ONLY the view's projected columns matter—
-- since RLS is row-level, we add a permissive SELECT for is_active rows but rely on the
-- view (and column GRANTs below) to prevent secret leakage.
REVOKE SELECT ON public.store_integrations FROM anon;
GRANT SELECT (id, user_id, platform, store_domain, store_name, is_active)
  ON public.store_integrations TO anon, authenticated;

CREATE POLICY "Public can view active store integrations (safe cols)"
  ON public.store_integrations FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
