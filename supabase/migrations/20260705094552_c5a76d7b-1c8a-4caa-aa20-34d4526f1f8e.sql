
-- Booking slots for embedded consultations
CREATE TABLE public.booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_booked BOOLEAN NOT NULL DEFAULT false,
  booked_by_email TEXT,
  booked_by_name TEXT,
  order_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.booking_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_slots TO authenticated;
GRANT ALL ON public.booking_slots TO service_role;

ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- Public can read active, unbooked (or booked) slots for display
CREATE POLICY "Public can view active slots"
ON public.booking_slots FOR SELECT
USING (is_active = true);

-- Creators can manage their own slots
CREATE POLICY "Creators manage own slots"
ON public.booking_slots FOR ALL
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Service role (edge functions) can update on payment success
CREATE POLICY "Service role full access"
ON public.booking_slots FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_booking_slots_creator ON public.booking_slots(creator_id, slot_date);
CREATE INDEX idx_booking_slots_active ON public.booking_slots(is_active, is_booked);

CREATE TRIGGER update_booking_slots_updated_at
BEFORE UPDATE ON public.booking_slots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
