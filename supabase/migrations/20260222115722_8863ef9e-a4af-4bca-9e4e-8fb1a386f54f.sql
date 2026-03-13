
-- Table to track wallet-paid subscriptions for auto-renewal
CREATE TABLE public.wallet_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  price NUMERIC NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_renewal_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet subscriptions
CREATE POLICY "Users can view their own wallet subscriptions"
ON public.wallet_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all wallet subscriptions
CREATE POLICY "Admins can view all wallet subscriptions"
ON public.wallet_subscriptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role inserts/updates (edge functions)
CREATE POLICY "System can manage wallet subscriptions"
ON public.wallet_subscriptions FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_wallet_subscriptions_updated_at
BEFORE UPDATE ON public.wallet_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
