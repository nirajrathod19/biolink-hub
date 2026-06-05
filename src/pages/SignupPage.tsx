import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { BriooLogo } from "@/components/brand/BriooLogo";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { checkPasswordStrength } from "@/hooks/useSecurity";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { supabase } from "@/integrations/supabase/client";

const signupSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const referralCode = searchParams.get("ref");
  const passwordStrength = checkPasswordStrength(password);
  const { isAvailable: usernameAvailable, isChecking: usernameChecking } = useUsernameCheck(username);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    const validation = signupSchema.safeParse({ username: cleanUsername, email, password });
    
    if (!validation.success) {
      const fieldErrors: { username?: string; email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === "username") fieldErrors.username = issue.message;
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!passwordStrength.isStrong) {
      setErrors({ password: "Please use a stronger password" });
      return;
    }

    if (usernameAvailable === false) {
      setErrors({ username: "This username is already taken" });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(email, password, cleanUsername);
    
    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      }
      setIsLoading(false);
      return;
    }

    // Send branded verification email via Resend
    try {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke("send-verification-email", {
        body: {
          email,
          type: "verification",
          user_id: newUser?.id,
        },
      });

      if (response.error) {
        console.error("Failed to send verification email:", response.error);
      }
    } catch (err) {
      console.error("Error sending verification email:", err);
    }

    setRegisteredEmail(email);
    setShowVerificationMessage(true);
    toast({
      title: "Verification email sent!",
      description: "Please check your inbox to verify your email address.",
    });
    
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to:
            </p>
            <p className="text-lg font-medium mb-6 break-all">{registeredEmail}</p>
            
            <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">What's next?</p>
                  <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Check your inbox (and spam folder)</li>
                    <li>Click the verification link</li>
                    <li>Start creating your Brioo page!</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6 text-left">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-500">Can't find the email?</p>
                <p className="text-muted-foreground mt-1">
                  Check your spam or promotions folder if you don't see it.
                </p>
              </div>
            </div>
            
            <Link to="/login">
              <GradientButton className="w-full">
                Continue to Login
                <ArrowRight className="w-4 h-4" />
              </GradientButton>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Gradient */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/30 rounded-full blur-[80px]" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-display font-bold mb-6">
              Your one link<br />
              <span className="gradient-text">for everything</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of creators sharing their content, selling digital products, and growing their audience with Brioo.
            </p>
            <ul className="space-y-3">
              {["Unlimited free links", "Click analytics & insights", "Sell digital products (Pro)", "Revenue sharing (Pro)"].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center mb-8" aria-label="Brioo home">
            <BriooLogo height={32} />
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-6">
            Free to start. Upgrade to Pro anytime.
          </p>

          {referralCode && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary">
                🎁 You were referred by a friend! You'll both earn bonus credits.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`pl-10 bg-secondary/50 border-border h-12 ${errors.username ? 'border-destructive' : ''}`}
                  maxLength={20}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  brioo.in/{username || "yourname"}
                </p>
                {username.length >= 3 && (
                  <span className={`text-xs flex items-center gap-1 ${
                    usernameChecking ? "text-muted-foreground" : 
                    usernameAvailable ? "text-green-500" : "text-destructive"
                  }`}>
                    {usernameChecking ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : usernameAvailable ? (
                      <><CheckCircle className="w-3 h-3" /> Available</>
                    ) : (
                      "Taken"
                    )}
                  </span>
                )}
              </div>
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
            </div>

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
                  maxLength={255}
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
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-secondary/50 border-border h-12 ${errors.password ? 'border-destructive' : ''}`}
                  maxLength={72}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 2 ? "bg-destructive"
                            : passwordStrength.score === 3 ? "bg-yellow-500"
                            : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${
                    passwordStrength.score <= 2 ? "text-destructive" :
                    passwordStrength.score === 3 ? "text-yellow-500" : "text-green-500"
                  }`}>
                    {passwordStrength.score <= 2 ? "Weak" : passwordStrength.score === 3 ? "Good" : "Strong"}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <GradientButton
              type="submit"
              variant="glow"
              className="w-full"
              size="lg"
              disabled={isLoading || !usernameAvailable || usernameChecking}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </GradientButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;