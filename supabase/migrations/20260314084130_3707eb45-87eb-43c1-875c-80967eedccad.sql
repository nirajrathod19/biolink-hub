
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_intent jsonb DEFAULT '{}';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
  ADD COLUMN IF NOT EXISTS pickup_scheduled_at timestamp with time zone;
