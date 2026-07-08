import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "brioo_consent_v1";

export type ConsentState = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const applyConsent = (state: ConsentState) => {
  const value = state === "granted" ? "granted" : "denied";
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: any[]) => window.dataLayer.push(args);
  window.gtag = window.gtag || gtag;
  window.gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
};

export const readConsent = (): ConsentState | null => {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      // Show banner after a brief delay to avoid layout shift
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (state: ConsentState) => {
    try {
      localStorage.setItem(CONSENT_KEY, state);
    } catch {
      /* ignore */
    }
    applyConsent(state);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-[100]"
        >
          <div className="rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Your privacy choices
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies for essential features and — with your consent —
                  to serve personalized ads (Google AdSense) and analytics.
                  You can change this any time.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs"
                    onClick={() => decide("denied")}
                  >
                    Reject non-essential
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs"
                    onClick={() => decide("granted")}
                  >
                    Accept all
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
