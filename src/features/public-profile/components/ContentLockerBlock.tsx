import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Loader2, Download } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BioTheme } from "@/lib/bioThemes";

interface ContentLockerBlockProps {
  creatorId: string;
  lockedUrl: string;
  title?: string | null;
  subtitle?: string | null;
  wallType?: "email" | "phone";
  buttonLabel?: string | null;
  theme: BioTheme;
}

const EmailSchema = z.string().trim().email().max(255);
const PhoneSchema = z
  .string()
  .trim()
  .min(6)
  .max(20)
  .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number");

/**
 * ContentLockerBlock — visitor unlocks a download/link after submitting a
 * verified email or phone into `public.leads` (RLS-scoped to creatorId).
 * The locked URL is never rendered in DOM until the wall is passed.
 */
export const ContentLockerBlock = ({
  creatorId,
  lockedUrl,
  title,
  subtitle,
  wallType = "email",
  buttonLabel,
  theme,
}: ContentLockerBlockProps) => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const isGlass = theme.cardBg.includes("rgba");

  const validate = (v: string) => {
    if (wallType === "phone") return PhoneSchema.safeParse(v);
    return EmailSchema.safeParse(v);
  };

  const openUnlocked = () => {
    try {
      const u = new URL(lockedUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("bad protocol");
      window.open(u.toString(), "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Locked link is invalid");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = validate(value);
    if (!parsed.success) {
      toast.error(wallType === "phone" ? "Enter a valid phone number" : "Enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        creator_id: creatorId,
        name: "Content unlock",
        email: wallType === "email" ? parsed.data : `locker+${Date.now()}@brioo.local`,
        message: wallType === "phone" ? `phone:${parsed.data}` : `Unlock: ${title || "content"}`,
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
      setUnlocked(true);
      // Auto-open shortly after reveal
      setTimeout(openUnlocked, 400);
    } catch (err: any) {
      toast.error(err?.message || "Could not unlock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label={title || "Locked content"}
      className="my-6 rounded-2xl p-5 md:p-6 relative overflow-hidden"
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
          {unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-base leading-tight" style={{ color: theme.cardText }}>
            {title || "Unlock free content"}
          </h3>
          <p className="text-xs opacity-70 truncate" style={{ color: theme.cardText }}>
            {subtitle || (wallType === "phone" ? "Enter your phone to unlock" : "Enter your email to unlock")}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {unlocked ? (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <button
              type="button"
              onClick={openUnlocked}
              className="w-full h-12 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] inline-flex items-center justify-center gap-2"
              style={{
                background: theme.accent,
                color: theme.accentText,
                boxShadow: `0 8px 24px ${theme.accent}40`,
                minHeight: 48,
              }}
            >
              <Download className="w-4 h-4" />
              {buttonLabel || "Open your content"}
            </button>
            <p className="text-[11px] opacity-60 text-center" style={{ color: theme.cardText }}>
              Unlocked. Didn't open? Tap the button above.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="locked"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            <input
              type={wallType === "phone" ? "tel" : "email"}
              required
              value={value}
              maxLength={wallType === "phone" ? 20 : 255}
              onChange={(e) => setValue(e.target.value)}
              placeholder={wallType === "phone" ? "+1 555 123 4567" : "you@email.com"}
              className="w-full h-12 px-3.5 rounded-xl text-sm outline-none"
              style={{
                background: isGlass ? "rgba(255,255,255,0.06)" : `${theme.cardText}0A`,
                border: `1px solid ${theme.cardText}20`,
                color: theme.cardText,
                minHeight: 48,
              }}
              inputMode={wallType === "phone" ? "tel" : "email"}
              autoComplete={wallType === "phone" ? "tel" : "email"}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              style={{
                background: theme.accent,
                color: theme.accentText,
                boxShadow: `0 8px 24px ${theme.accent}40`,
                minHeight: 48,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Unlocking…
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  {buttonLabel || "Unlock now"}
                </>
              )}
            </button>
            <p className="text-[11px] opacity-60 text-center" style={{ color: theme.cardText }}>
              Your {wallType === "phone" ? "number" : "email"} is shared only with this creator.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
