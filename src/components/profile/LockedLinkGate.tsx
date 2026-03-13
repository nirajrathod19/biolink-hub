import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, Mail, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddSubscriber } from "@/hooks/useSubscribers";
import type { BioTheme } from "@/lib/bioThemes";

interface LockedLinkGateProps {
  linkId: string;
  linkTitle: string | null;
  lockType: "password" | "newsletter";
  lockPassword?: string | null;
  creatorId: string;
  creatorName?: string;
  theme: BioTheme;
  onUnlock: () => void;
}

export const LockedLinkGate = ({
  linkId,
  linkTitle,
  lockType,
  lockPassword,
  creatorId,
  creatorName,
  theme,
  onUnlock,
}: LockedLinkGateProps) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const addSubscriber = useAddSubscriber();

  const accent = theme.accent;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password === lockPassword) {
      onUnlock();
    } else {
      setError("Incorrect password");
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    try {
      await addSubscriber.mutateAsync({ creatorId, email: email.trim().toLowerCase() });
      onUnlock();
    } catch (err: any) {
      if (err.message?.includes("duplicate") || err.message?.includes("unique")) {
        // Already subscribed — unlock anyway
        onUnlock();
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-5 text-center"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        backdropFilter: theme.cardBg.includes("rgba") ? "blur(12px)" : undefined,
      }}
    >
      <div
        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
        style={{ background: `${accent}20` }}
      >
        <Lock className="w-5 h-5" style={{ color: accent }} />
      </div>
      <p className="font-semibold text-sm mb-1" style={{ color: theme.cardText }}>
        {linkTitle || "Locked Content"}
      </p>
      <p className="text-xs mb-4" style={{ color: theme.bioTextColor }}>
        {lockType === "password"
          ? "Enter the password to access this link"
          : `Subscribe to ${creatorName || "this creator"}'s newsletter to unlock`}
      </p>

      {lockType === "password" ? (
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.bioTextColor }} />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Enter password"
              className="pl-9 pr-9"
              style={{ background: `${accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" style={{ color: theme.bioTextColor }} />
              ) : (
                <Eye className="w-4 h-4" style={{ color: theme.bioTextColor }} />
              )}
            </button>
          </div>
          <Button
            type="submit"
            size="sm"
            className="w-full"
            style={{ background: accent, color: theme.accentText || "#fff" }}
          >
            Unlock
          </Button>
        </form>
      ) : (
        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.bioTextColor }} />
            <Input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="your@email.com"
              className="pl-9"
              style={{ background: `${accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={addSubscriber.isPending}
            style={{ background: accent, color: theme.accentText || "#fff" }}
          >
            {addSubscriber.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe & Unlock"}
          </Button>
        </form>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};