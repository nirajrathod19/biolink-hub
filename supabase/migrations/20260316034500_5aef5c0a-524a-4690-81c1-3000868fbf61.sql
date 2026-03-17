
-- Add structured address fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pincode text;

-- Add pickup address fields to profiles for sellers
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pickup_address_line1 text,
  ADD COLUMN IF NOT EXISTS pickup_address_line2 text,
  ADD COLUMN IF NOT EXISTS pickup_city text,
  ADD COLUMN IF NOT EXISTS pickup_state text,
  ADD COLUMN IF NOT EXISTS pickup_pincode text,
  ADD COLUMN IF NOT EXISTS pickup_phone text;
