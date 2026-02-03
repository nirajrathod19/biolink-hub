import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Loader2, AlertTriangle, CheckCircle, Eye, EyeOff, Fingerprint, Smartphone } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useToast } from "@/hooks/use-toast";

const ADMIN_SESSION_KEY = "admin_verified_session";

const AdminVerify = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isVerified, hasPassword, isCheckingPassword, setupPassword, verifyPassword } = useAdminAuth();
  const { 
    isBiometricAvailable, 
    isBiometricEnabled, 
    isMobile,
    isLoading: biometricLoading,
    enableBiometric, 
    verifyBiometric,
    checkBiometricSession,
    disableBiometric 
  } = useBiometricAuth(user?.id);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [biometricFailed, setBiometricFailed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set mode based on password setup status
  useEffect(() => {
    if (!isCheckingPassword) {
      setIsSetupMode(!hasPassword);
    }
  }, [hasPassword, isCheckingPassword]);

  // Check if biometric session is already valid (auto-login)
  useEffect(() => {
    if (!authLoading && user && isAdmin && !isVerified && checkBiometricSession()) {
      // Biometric session is valid, store admin session and redirect
      const sessionData = {
        user_id: user.id,
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      navigate("/admin", { replace: true });
    }
  }, [authLoading, user, isAdmin, isVerified, checkBiometricSession, navigate]);

  // Redirect if already verified
  useEffect(() => {
    if (isVerified) {
      navigate("/admin", { replace: true });
    }
  }, [isVerified, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Auto-trigger biometric on mobile if enabled
  useEffect(() => {
    if (!isSetupMode && isMobile && isBiometricEnabled && !isCheckingPassword && !isVerified && !biometricFailed) {
      handleBiometricLogin();
    }
  }, [isBiometricEnabled, isSetupMode, isCheckingPassword, isVerified, isMobile, biometricFailed]);

  const handleSetupPassword = async () => {
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      await setupPassword.mutateAsync(password);
      toast({
        title: "Password set",
        description: "Admin password has been configured successfully.",
      });
      setIsSetupMode(false);
      setPassword("");
      setConfirmPassword("");
      
      // Show biometric setup option if on mobile and available
      if (isMobile && isBiometricAvailable) {
        setShowBiometricSetup(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter your admin password",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyPassword.mutateAsync(password);
      toast({
        title: "Verified!",
        description: "Access granted to admin panel.",
      });
      navigate("/admin", { replace: true });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleBiometricLogin = async () => {
    const success = await verifyBiometric();
    if (success) {
      // Biometric verified - store admin session and redirect
      const sessionData = {
        user_id: user?.id,
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      
      toast({
        title: "Verified!",
        description: "Biometric authentication successful.",
      });
      navigate("/admin", { replace: true });
    } else {
      // Biometric failed - show password fallback
      setBiometricFailed(true);
      toast({
        title: "Biometric Failed",
        description: "Please use your admin password to login.",
        variant: "destructive",
      });
    }
  };

  const handleEnableBiometric = async () => {
    const success = await enableBiometric();
    if (success) {
      setShowBiometricSetup(false);
      navigate("/admin", { replace: true });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isSetupMode) {
        handleSetupPassword();
      } else {
        handleVerify();
      }
    }
  };

  if (authLoading || isCheckingPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Biometric setup dialog after password setup (mobile only)
  if (showBiometricSetup && isMobile && isBiometricAvailable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">Enable Biometric Login</h1>
              <p className="text-muted-foreground">
                Use fingerprint or Face ID for faster admin access on mobile
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <Smartphone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Mobile Only</p>
                  <p className="text-muted-foreground mt-1">
                    This feature works on mobile devices. Desktop/tablet will always use admin password.
                  </p>
                </div>
              </div>

              <GradientButton
                onClick={handleEnableBiometric}
                disabled={biometricLoading}
                className="w-full"
                size="lg"
              >
                {biometricLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Enable Biometric Login
                  </>
                )}
              </GradientButton>

              <button
                onClick={() => {
                  setShowBiometricSetup(false);
                  navigate("/admin", { replace: true });
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">
              {isSetupMode ? "Set Admin Password" : "Admin Login"}
            </h1>
            <p className="text-muted-foreground">
              {isSetupMode 
                ? "Create a secure password for admin access" 
                : isMobile && isBiometricEnabled && !biometricFailed
                  ? "Use biometric or password to continue"
                  : "Enter your admin password to continue"
              }
            </p>
          </div>

          {isSetupMode ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">First Time Setup</p>
                  <p className="text-muted-foreground mt-1">
                    Set a strong password. You'll need this to access the admin panel.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Admin Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter password (min 6 characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirm Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <GradientButton
                onClick={handleSetupPassword}
                disabled={setupPassword.isPending || password.length < 6}
                className="w-full"
                size="lg"
              >
                {setupPassword.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Set Password & Continue
                  </>
                )}
              </GradientButton>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Biometric Login Button - Mobile Only */}
              {isMobile && isBiometricEnabled && !biometricFailed && (
                <div className="space-y-4">
                  <GradientButton
                    onClick={handleBiometricLogin}
                    disabled={biometricLoading}
                    className="w-full"
                    size="lg"
                  >
                    {biometricLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Login with Fingerprint / Face ID
                      </>
                    )}
                  </GradientButton>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or use password</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Admin Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your admin password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <GradientButton
                onClick={handleVerify}
                disabled={verifyPassword.isPending || !password.trim()}
                className="w-full"
                size="lg"
              >
                {verifyPassword.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Login to Admin Panel
                  </>
                )}
              </GradientButton>

              {/* Enable Biometric Toggle - Mobile Only */}
              {isMobile && isBiometricAvailable && !isBiometricEnabled && (
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Enable Biometric</p>
                      <p className="text-xs text-muted-foreground">Use fingerprint/Face ID</p>
                    </div>
                  </div>
                  <button
                    onClick={handleEnableBiometric}
                    disabled={biometricLoading}
                    className="text-sm text-primary hover:underline"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Disable Biometric Option - Mobile Only */}
              {isMobile && isBiometricEnabled && (
                <button
                  onClick={disableBiometric}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Disable biometric login
                </button>
              )}

              {/* Show device info for non-mobile */}
              {!isMobile && (
                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground">Desktop/Tablet Login</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Biometric login is only available on mobile devices. Use admin password on this device.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            This verification is required each session for enhanced security.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AdminVerify;
