
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS lock_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lock_password text DEFAULT NULL;

COMMENT ON COLUMN public.links.lock_type IS 'null=open, password=password-gated, newsletter=subscribe-to-unlock';
COMMENT ON COLUMN public.links.lock_password IS 'Password hash for password-gated links';
