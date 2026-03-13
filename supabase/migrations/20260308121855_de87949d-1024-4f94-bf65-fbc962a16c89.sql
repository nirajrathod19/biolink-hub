
-- Step 1: Add columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement_text text DEFAULT NULL;
