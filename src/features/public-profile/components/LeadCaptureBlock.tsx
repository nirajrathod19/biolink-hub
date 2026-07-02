import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BioTheme } from "@/lib/bioThemes";

const LeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().max(1000).optional(),
});

interface LeadCaptureBlockProps {
  creatorId: string;
  title?: string | null;
  subtitle?: string | null;
  successUrl?: string | null;
  showMessage?: boolean;
  theme: BioTheme;
}

/**
 * Public-facing lead capture form. Writes to `public.leads` (RLS allows
 * anonymous INSERT, only the creator can read).
 */
export const LeadCaptureBlock = ({
  creatorId,
  title,
  subtitle,
  successUrl,
  showMessage = true,
  theme,
}: LeadCaptureBlockProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = LeadSchema.safeParse({ name, email, message: message || undefined });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      toast.error(first || "Please check the form");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        creator_id: creatorId,
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message ?? null,
      });
      if (error) throw error;
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
      if (successUrl) {
        try {
          const u = new URL(successUrl);
          if (u.protocol === "http:" || u.protocol === "https:") {
            setTimeout(() => window.location.assign(u.toString()), 900);
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  const isGlass = theme.cardBg.includes("rgba");

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Get in touch"
      className="my-6 rounded-2xl p-5 md:p-6"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.accent}25`,
        backdropFilter: isGlass ? "blur(16px)" : undefined,
        WebkitBackdropFilter: isGlass ? "blur(16px)" : undefined,
        boxShadow: `0 8px 32px ${theme.accent}12`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${theme.accent}18`, color: theme.accent }}
        >
          <Mail className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3
            className="font-display font-semibold text-base leading-tight"
            style={{ color: theme.cardText }}
          >
            {title || "Get in touch"}
          </h3>
          {subtitle && (
            <p className="text-xs opacity-70" style={{ color: theme.cardText }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {done ? (
        <div
          className="flex items-center gap-2 p-4 rounded-xl text-sm"
          style={{ background: `${theme.accent}12`, color: theme.cardText }}
        >
          <Check className="w-4 h-4" style={{ color: theme.accent }} />
          Thanks — we'll be in touch shortly.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-2.5">
          <input
            type="text"
            required
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full h-11 px-3.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: isGlass ? "rgba(255,255,255,0.06)" : `${theme.cardText}0A`,
              border: `1px solid ${theme.cardText}20`,
              color: theme.cardText,
            }}
          />
          <input
            type="email"
            required
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full h-11 px-3.5 rounded-xl text-sm outline-none"
            style={{
              background: isGlass ? "rgba(255,255,255,0.06)" : `${theme.cardText}0A`,
              border: `1px solid ${theme.cardText}20`,
              color: theme.cardText,
            }}
          />
          {showMessage && (
            <textarea
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me a bit about what you need (optional)"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{
                background: isGlass ? "rgba(255,255,255,0.06)" : `${theme.cardText}0A`,
                border: `1px solid ${theme.cardText}20`,
                color: theme.cardText,
              }}
            />
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{
              background: theme.accent,
              color: theme.accentText,
              boxShadow: `0 8px 24px ${theme.accent}40`,
            }}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending…
              </span>
            ) : (
              "Send"
            )}
          </button>
          <p className="text-[11px] opacity-60 text-center" style={{ color: theme.cardText }}>
            Your details are shared only with this creator.
          </p>
        </form>
      )}
    </motion.section>
  );
};
