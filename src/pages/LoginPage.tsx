import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Link2, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCheckLockout, useRecordLoginAttempt, useLogSecurityEvent } from "@/hooks/useSecurity";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ locked: boolean; message?: string; attempts_remaining?: number } | null>(null);
  
  const { signIn, user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const checkLockout = useCheckLockout();
  const recordAttempt = useRecordLoginAttempt();
  const logSecurityEvent = useLogSecurityEvent();

  useEffect(() => {
    if (!loading && !roleLoading && user) {
      // Log successful authentication session
      logSecurityEvent.mutate({
        event_type: "SESSION_STARTED",
        user_id: user.id,
        event_data: { email: user.email },
      });
      
      // Redirect based on role
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, isAdmin, roleLoading, navigate]);

  // Check lockout status when email changes
  useEffect(() => {
    if (email && email.includes("@")) {
      const checkStatus = async () => {
        try {
          const result = await checkLockout.mutateAsync(email);
          setLockoutInfo(result);
        } catch (error) {
          // Ignore errors for lockout check
        }
      };
      const timeout = setTimeout(checkStatus, 500);
      return () => clearTimeout(timeout);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = loginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check if account is locked
    try {
      const lockoutStatus = await checkLockout.mutateAsync(email);
      if (lockoutStatus.locked) {
        toast({
          title: "Account Locked",
          description: lockoutStatus.message,
          variant: "destructive",
        });
        setLockoutInfo(lockoutStatus);
        return;
      }
    } catch (error) {
      // Continue with login if lockout check fails
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      // Record failed login attempt
      try {
        const result = await recordAttempt.mutateAsync({
          email,
          success: false,
          failure_reason: error.message,
        });
        
        if (result.locked) {
          setLockoutInfo({ locked: true, message: result.message });
          toast({
            title: "Account Locked",
            description: result.message,
            variant: "destructive",
          });
        } else {
          setLockoutInfo({ 
            locked: false, 
            attempts_remaining: result.attempts_remaining,
            message: result.message 
          });
          toast({
            title: "Login failed",
            description: error.message === "Invalid login credentials" 
              ? `Invalid email or password. ${result.attempts_remaining} attempts remaining.`
              : error.message,
            variant: "destructive",
          });
        }
      } catch (recordError) {
        toast({
          title: "Login failed",
          description: error.message === "Invalid login credentials" 
            ? "Invalid email or password. Please try again."
            : error.message,
          variant: "destructive",
        });
      }
    } else {
      // Record successful login
      try {
        await recordAttempt.mutateAsync({ email, success: true });
      } catch (error) {
        // Ignore recording errors
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setForgotLoading(false);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setForgotSent(true);
      toast({
        title: "Email sent!",
        description: "Check your inbox for the password reset link.",
      });
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Brioo</span>
          </Link>

          {showForgotPassword ? (
            // Forgot Password Form
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotSent(false);
                  setForgotEmail("");
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
              
              <h1 className="text-3xl font-display font-bold mb-2">Reset Password</h1>
              <p className="text-muted-foreground mb-8">
                {forgotSent
                  ? "We've sent you an email with a link to reset your password."
                  : "Enter your email and we'll send you a reset link."}
              </p>

              {forgotSent ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-500">Check your inbox!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We sent a password reset link to <strong>{forgotEmail}</strong>. 
                      Click the link in the email to create a new password.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10 bg-secondary/50 border-border h-12"
                      />
                    </div>
                  </div>

                  <GradientButton 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </GradientButton>
                </form>
              )}
            </motion.div>
          ) : (
            // Login Form
            <>
              <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
              <p className="text-muted-foreground mb-8">
                Sign in to your account to continue
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 bg-secondary/50 border-border h-12 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 bg-secondary/50 border-border h-12 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                {/* Lockout Warning */}
                {lockoutInfo && !lockoutInfo.locked && lockoutInfo.attempts_remaining !== undefined && lockoutInfo.attempts_remaining < 5 && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-500 font-medium">
                        {lockoutInfo.attempts_remaining} attempt{lockoutInfo.attempts_remaining !== 1 ? 's' : ''} remaining
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your account will be temporarily locked after too many failed attempts.
                      </p>
                    </div>
                  </div>
                )}

                {lockoutInfo?.locked && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                    <Lock className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-destructive font-medium">Account Temporarily Locked</p>
                      <p className="text-xs text-muted-foreground">{lockoutInfo.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <GradientButton 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </GradientButton>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Right Side - Gradient */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/30 rounded-full blur-[80px]" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold mb-4">
              Your Links,<br />
              <span className="gradient-text">Your Brand</span>
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Create a stunning bio page, share your content, and start earning from your audience today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
