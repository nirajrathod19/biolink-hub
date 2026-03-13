import { motion } from "framer-motion";
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Loader2, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const COOLDOWN_SECONDS = 60;

const VerifyEmailPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const token = searchParams.get("token");
  const userId = searchParams.get("user_id");

  // Recover email from URL param, auth context, or getUser()
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // Fallback: try to get from current session
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          setEmail(data.user.email);
        }
      });
    }
  }, [user, searchParams]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-verify if token is present
  useEffect(() => {
    if (token && userId && !verified && !isVerifying) {
      verifyToken();
    }
  }, [token, userId]);

  const verifyToken = async () => {
    setIsVerifying(true);
    setVerifyError(null);

    try {
      const response = await supabase.functions.invoke("verify-email-token", {
        body: { token, user_id: userId },
      });

      if (response.error) {
        const errorMsg = response.error.message || "Verification failed";
        setVerifyError(
          errorMsg.includes("non-2xx")
            ? "Verification link has expired or is invalid. Please request a new one."
            : errorMsg
        );
      } else if (response.data?.success) {
        setVerified(true);
        toast({
          title: "Email Verified! ✅",
          description: "Your email has been verified. You can now sign in.",
        });
      } else {
        setVerifyError(response.data?.error || "Verification failed");
      }
    } catch (err: any) {
      setVerifyError(err.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = useCallback(async () => {
    if (cooldown > 0) return;

    if (!email) {
      toast({
        title: "Error",
        description: "No email address found. Please try signing up again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await supabase.functions.invoke("send-verification-email", {
        body: { email, type: "verification" },
      });

      if (response.error) {
        const errorMsg = response.error.message || "";
        if (errorMsg.includes("non-2xx")) {
          throw new Error("Email service is temporarily busy. Please wait a moment and try again.");
        }
        throw response.error;
      }

      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link.",
      });
      setCooldown(COOLDOWN_SECONDS);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  }, [email, cooldown, toast]);

  const resendButtonContent = () => {
    if (isResending) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sending...
        </>
      );
    }
    if (cooldown > 0) {
      return <>Resend available in {cooldown}s</>;
    }
    return (
      <>
        <RefreshCw className="w-4 h-4 mr-2" />
        Resend Verification Email
      </>
    );
  };

  // Verifying state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Verified success
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Email Verified! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Your email has been successfully verified. You can now sign in to your Brioo account.
            </p>
            <Link to="/login">
              <Button className="w-full" size="lg">
                Continue to Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Verification error
  if (verifyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{verifyError}</p>
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || cooldown > 0}
                variant="outline"
                className="w-full"
              >
                {resendButtonContent()}
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default: waiting for verification (no token in URL)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to{" "}
              {email && <span className="font-medium text-foreground">{email}</span>}
              . Please check your inbox and click the link to verify your account.
            </p>

            <div className="w-full bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What to do:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your inbox (and spam folder)</li>
                    <li>Click the verification link (expires in 15 minutes)</li>
                    <li>You'll be redirected to login</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || cooldown > 0}
                className="w-full"
                variant="outline"
              >
                {resendButtonContent()}
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Didn't receive the email? Check your spam folder or{" "}
          <button
            onClick={handleResendEmail}
            disabled={cooldown > 0}
            className="text-primary hover:underline disabled:opacity-50"
          >
            {cooldown > 0 ? `wait ${cooldown}s` : "click here to resend"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;