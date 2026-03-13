
-- Atomic withdrawal request function to prevent double-spend
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_user_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_details jsonb,
  p_fraud_flags jsonb DEFAULT NULL,
  p_fraud_score integer DEFAULT 0,
  p_is_flagged boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance numeric;
  new_withdrawal_id uuid;
BEGIN
  -- Acquire advisory lock to serialize withdrawals for this user
  PERFORM pg_advisory_xact_lock(hashtext('withdrawal_' || p_user_id::text));

  -- Get current balance
  SELECT wallet_balance INTO current_balance
  FROM profiles
  WHERE user_id = p_user_id;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: %, Requested: %', current_balance, p_amount;
  END IF;

  IF p_amount < 3 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $3';
  END IF;

  -- Immediately deduct from wallet to prevent double-spend
  UPDATE profiles
  SET wallet_balance = wallet_balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Insert withdrawal request
  INSERT INTO withdrawals (user_id, amount, payment_method, payment_details, status, fraud_flags, fraud_score, is_flagged)
  VALUES (p_user_id, p_amount, p_payment_method, p_payment_details, 'pending', p_fraud_flags, p_fraud_score, p_is_flagged)
  RETURNING id INTO new_withdrawal_id;

  RETURN new_withdrawal_id;
END;
$$;
