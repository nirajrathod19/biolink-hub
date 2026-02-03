-- Add fraud_flags column to withdrawals table for storing detected fraud indicators
ALTER TABLE public.withdrawals
ADD COLUMN fraud_flags jsonb DEFAULT NULL,
ADD COLUMN fraud_score integer DEFAULT 0,
ADD COLUMN is_flagged boolean DEFAULT false;

-- Create index for faster flagged withdrawal queries
CREATE INDEX idx_withdrawals_is_flagged ON public.withdrawals(is_flagged) WHERE is_flagged = true;