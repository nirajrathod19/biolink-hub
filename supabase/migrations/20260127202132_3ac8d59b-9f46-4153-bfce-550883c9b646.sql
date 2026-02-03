-- Create security audit log table
CREATE TABLE public.security_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create login attempts tracking table
CREATE TABLE public.login_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account lockouts table
CREATE TABLE public.account_lockouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create active sessions table for tracking
CREATE TABLE public.active_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_security_audit_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_event_type ON public.security_audit_log(event_type);
CREATE INDEX idx_security_audit_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);
CREATE INDEX idx_account_lockouts_email ON public.account_lockouts(email);
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_audit_log
CREATE POLICY "Admins can view all audit logs" ON public.security_audit_log
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- RLS Policies for login_attempts
CREATE POLICY "Admins can view login attempts" ON public.login_attempts
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert login attempts" ON public.login_attempts
FOR INSERT WITH CHECK (true);

-- RLS Policies for account_lockouts
CREATE POLICY "Admins can manage lockouts" ON public.account_lockouts
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage lockouts" ON public.account_lockouts
FOR ALL WITH CHECK (true);

-- RLS Policies for active_sessions
CREATE POLICY "Users can view their own sessions" ON public.active_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.active_sessions
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own sessions" ON public.active_sessions
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.active_sessions
FOR ALL WITH CHECK (true);

-- Add trigger for updated_at on account_lockouts
CREATE TRIGGER update_account_lockouts_updated_at
BEFORE UPDATE ON public.account_lockouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();