
-- Create creator_subscribers table for email capture
CREATE TABLE public.creator_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  subscriber_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creator_id, subscriber_email)
);

-- Enable RLS
ALTER TABLE public.creator_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to a creator"
ON public.creator_subscribers
FOR INSERT
WITH CHECK (true);

-- Creators can view their own subscribers
CREATE POLICY "Creators can view their subscribers"
ON public.creator_subscribers
FOR SELECT
USING (auth.uid() = creator_id);

-- Creators can delete their own subscribers
CREATE POLICY "Creators can delete their subscribers"
ON public.creator_subscribers
FOR DELETE
USING (auth.uid() = creator_id);

-- Admins can view all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.creator_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
