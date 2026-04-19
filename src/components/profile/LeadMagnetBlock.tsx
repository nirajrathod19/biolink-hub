import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { BioTheme } from "@/lib/bioThemes";

interface LeadMagnetBlockProps {
  creatorId: string;
  productId: string;
  productTitle: string;
  productDescription?: string | null;
  previewImage?: string | null;
  theme: BioTheme;
}

export const LeadMagnetBlock = ({
  creatorId, productId, productTitle, productDescription, previewImage, theme,
}: LeadMagnetBlockProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ url?: string; emailSent?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accent = theme.accent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setBusy(true);
    try {
      const { data, error: invErr } = await supabase.functions.invoke("send-digital-file", {
        body: { creator_id: creatorId, email: email.trim().toLowerCase(), name, product_id: productId },
      });
      if (invErr) throw invErr;
      setDone({ url: data?.fallback_url, emailSent: data?.email_sent });
    } catch (e: any) {
      setError(e?.message || "Could not send the file");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="my-6 p-6 rounded-2xl text-center"
        style={{
          background: theme.cardBg || `${accent}12`,
          border: `1px solid ${theme.cardBorder || `${accent}30`}`,
          backdropFilter: theme.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
        }}
      >
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${accent}25` }}>
          <CheckCircle2 className="w-6 h-6" style={{ color: accent }} />
        </div>
        <p className="font-semibold mb-1" style={{ color: accent }}>You're in! 🎉</p>
        <p className="text-sm" style={{ color: theme.bioTextColor }}>
          {done.emailSent ? "Check your inbox for the download link." : "Your download is ready below."}
        </p>
        {done.url && (
          <Button asChild className="mt-3" style={{ background: accent, color: theme.accentText }}>
            <a href={done.url} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" /> Download now
            </a>
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{
        background: theme.cardBg || `${accent}10`,
        border: `1px solid ${theme.cardBorder || `${accent}25`}`,
        backdropFilter: theme.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
      }}
    >
      <div className="flex gap-4 p-5">
        {previewImage && (
          <img src={previewImage} alt={productTitle} className="w-20 h-20 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${accent}25`, color: accent }}>Free</span>
            <span className="text-[10px] uppercase font-medium" style={{ color: theme.bioTextColor }}>Lead magnet</span>
          </div>
          <h3 className="font-semibold text-base leading-tight" style={{ color: theme.textColor }}>{productTitle}</h3>
          {productDescription && <p className="text-xs mt-1 line-clamp-2" style={{ color: theme.bioTextColor }}>{productDescription}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-2">
        <Input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={60}
          style={{ background: `${accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
        />
        <Input
          type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
          placeholder="your@email.com" required
          style={{ background: `${accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
        />
        <Button type="submit" disabled={busy} className="w-full font-semibold gap-2" style={{ background: accent, color: theme.accentText }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {busy ? "Sending…" : "Email me the file"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>
    </motion.div>
  );
};
