-- Add indexes for better query performance at scale (lacs of users)

-- Profile lookups by username (public bio pages)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Links by user_id for dashboard
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_active ON public.links(user_id, is_active);

-- Social links by user
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON public.social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user_active ON public.social_links(user_id, is_active);

-- Click logs for analytics
CREATE INDEX IF NOT EXISTS idx_click_logs_link_id ON public.click_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_profile_id ON public.click_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_created_at ON public.click_logs(created_at DESC);

-- Login attempts for security
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON public.login_attempts(created_at DESC);

-- Account lockouts for security
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON public.account_lockouts(email);

-- Security audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit_log(event_type);

-- Transactions for wallet
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- User roles for auth
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- Active sessions for security
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON public.active_sessions(expires_at);

-- Affiliate clicks
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON public.affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link_id ON public.affiliate_clicks(link_id);