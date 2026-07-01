ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS enable_global_redirect boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS global_redirect_url text;