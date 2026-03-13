import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddSubscriber } from "@/hooks/useSubscribers";
import type { BioTheme } from "@/lib/bioThemes";

interface EmailCaptureBlockProps {
  creatorId: string;
  creatorName?: string;
  themeColor?: string;
  theme?: BioTheme;
}

export const EmailCaptureBlock = ({ creatorId, creatorName, themeColor = "#8B5CF6", theme }: EmailCaptureBlockProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addSubscriber = useAddSubscriber();

  const accent = theme?.accent || themeColor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    try {
      await addSubscriber.mutateAsync({ creatorId, email: email.trim().toLowerCase() });
      setSubscribed(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="my-6 p-6 rounded-2xl text-center"
        style={{
          background: theme?.cardBg || `${accent}15`,
          border: `1px solid ${theme?.cardBorder || `${accent}30`}`,
          backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
        }}
      >
        <div
          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: `${accent}25` }}
        >
          <Check className="w-6 h-6" style={{ color: accent }} />
        </div>
        <p className="font-semibold" style={{ color: accent }}>You're subscribed! 🎉</p>
        <p className="text-sm mt-1" style={{ color: theme?.bioTextColor }}>You'll hear from {creatorName || "this creator"} soon.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="my-6 p-5 rounded-2xl"
      style={{
        background: theme?.cardBg || `${accent}10`,
        border: `1px solid ${theme?.cardBorder || `${accent}20`}`,
        backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5" style={{ color: accent }} />
        <h3 className="font-semibold text-sm" style={{ color: accent }}>
          Stay updated
        </h3>
      </div>
      <p className="text-sm mb-3" style={{ color: theme?.bioTextColor }}>
        Get updates from {creatorName || "this creator"} directly in your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          placeholder="your@email.com"
          className="flex-1"
          style={{ background: theme ? `${accent}08` : undefined, color: theme?.cardText, borderColor: theme?.cardBorder }}
        />
        <Button
          type="submit"
          size="sm"
          disabled={addSubscriber.isPending}
          style={{ background: accent, color: theme?.accentText || "#fff" }}
          className="shrink-0"
        >
          {addSubscriber.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </motion.div>
  );
};
