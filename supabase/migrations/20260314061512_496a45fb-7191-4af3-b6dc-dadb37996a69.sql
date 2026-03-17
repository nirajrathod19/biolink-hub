
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_id text,
  ADD COLUMN IF NOT EXISTS courier_partner text,
  ADD COLUMN IF NOT EXISTS package_weight_kg numeric,
  ADD COLUMN IF NOT EXISTS base_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_charges numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_payout_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending';
