import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useAuth } from "@/contexts/AuthContext";

const BIOMETRIC_GATE_SESSION = "dashboard_biometric_session";
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

interface BiometricGateProps {
  children: React.ReactNode;
}

/**
 * On mobile, prompts the user for biometric (fingerprint / Face ID)
 * before revealing sensitive dashboard content.
 * Desktop users pass through immediately.
 */
export const BiometricGate = ({ children }: BiometricGateProps) => {
  const { user } = useAuth();
  const {
    isBiometricAvailable,
    isBiometricEnabled,
    isMobile,
    isLoading,
    verifyBiometric,
    enableBiometric,
  } = useBiometricAuth(user?.id);

  const [verified, setVerified] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check for an existing verified session
  useEffect(() => {
    if (!user?.id) return;

    // Desktop users bypass
    if (!isMobile) {
      setVerified(true);
      setChecking(false);
      return;
    }

    // If biometric not enabled, pass through
    if (!isBiometricEnabled) {
      // If available but not enabled, show setup prompt once
      if (isBiometricAvailable) {
        const dismissed = sessionStorage.getItem(`bio_setup_dismissed_${user.id}`);
        if (!dismissed) setShowSetup(true);
      }
      setVerified(true);
      setChecking(false);
      return;
    }

    // Check existing session
    try {
      const raw = localStorage.getItem(BIOMETRIC_GATE_SESSION);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.user_id === user.id && new Date(s.expires_at) > new Date()) {
          setVerified(true);
          setChecking(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    setChecking(false);
  }, [user?.id, isMobile, isBiometricEnabled, isBiometricAvailable]);

  const handleVerify = useCallback(async () => {
    const ok = await verifyBiometric();
    if (ok && user?.id) {
      localStorage.setItem(
        BIOMETRIC_GATE_SESSION,
        JSON.stringify({
          user_id: user.id,
          expires_at: new Date(Date.now() + SESSION_DURATION).toISOString(),
        })
      );
      setVerified(true);
    }
  }, [verifyBiometric, user?.id]);

  const handleSetup = useCallback(async () => {
    const ok = await enableBiometric();
    if (ok) setShowSetup(false);
  }, [enableBiometric]);

  const dismissSetup = useCallback(() => {
    setShowSetup(false);
    if (user?.id) sessionStorage.setItem(`bio_setup_dismissed_${user.id}`, "1");
  }, [user?.id]);

  // Desktop or already verified
  if (verified && !showSetup) return <>{children}</>;

  // Still checking session
  if (checking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show setup prompt (user hasn't enabled biometric yet)
  if (showSetup && verified) {
    return (
      <>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4 sm:hidden"
          >
            <div className="rounded-2xl bg-card border border-border p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Enable Biometric Lock</p>
                  <p className="text-xs text-muted-foreground">
                    Secure your dashboard with fingerprint
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={dismissSetup} className="flex-1">
                  Not Now
                </Button>
                <Button size="sm" onClick={handleSetup} disabled={isLoading} className="flex-1">
                  <Fingerprint className="w-4 h-4 mr-1" />
                  Enable
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {children}
      </>
    );
  }

  // Biometric verification screen
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 p-8"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold mb-1">Identity Check</h2>
          <p className="text-sm text-muted-foreground">
            Verify your identity to access the dashboard
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleVerify}
          disabled={isLoading}
          className="gap-2"
        >
          <Fingerprint className="w-5 h-5" />
          {isLoading ? "Verifying…" : "Verify with Biometrics"}
        </Button>
      </motion.div>
    </div>
  );
};