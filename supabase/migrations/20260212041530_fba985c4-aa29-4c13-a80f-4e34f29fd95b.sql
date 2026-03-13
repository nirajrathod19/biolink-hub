
-- Add email_verified column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Add email_verification_token and expiry
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_token text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_token_expires_at timestamp with time zone;

-- Add password_reset_token columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reset_token text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reset_token_expires_at timestamp with time zone;
