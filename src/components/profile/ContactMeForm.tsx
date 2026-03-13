import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { BioTheme } from "@/lib/bioThemes";

interface ContactMeFormProps {
  creatorId: string;
  creatorName?: string;
  theme: BioTheme;
}

export const ContactMeForm = ({ creatorId, creatorName, theme }: ContactMeFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("leads")
        .insert({
          creator_id: creatorId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim() || null,
        });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="my-6 p-6 rounded-2xl text-center"
        style={{
          background: theme.cardBg || `${theme.accent}15`,
          border: `1px solid ${theme.cardBorder || `${theme.accent}30`}`,
        }}
      >
        <div
          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: `${theme.accent}25` }}
        >
          <Check className="w-6 h-6" style={{ color: theme.accent }} />
        </div>
        <p className="font-semibold" style={{ color: theme.accent }}>Message sent! ✉️</p>
        <p className="text-sm mt-1" style={{ color: theme.bioTextColor }}>
          {creatorName || "The creator"} will get back to you soon.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{
        background: theme.cardBg || `${theme.accent}10`,
        border: `1px solid ${theme.cardBorder || `${theme.accent}20`}`,
      }}
    >
      {/* Collapsed header – always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" style={{ color: theme.accent }} />
          <h3 className="font-semibold text-sm" style={{ color: theme.accent }}>
            Contact Me
          </h3>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs"
          style={{ color: theme.accent }}
        >
          ▼
        </motion.span>
      </button>

      {/* Expandable form */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="contact-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                maxLength={100}
                style={{ background: `${theme.accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
              />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                maxLength={255}
                style={{ background: `${theme.accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
              />
              <Textarea
                placeholder="Your message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={3}
                style={{ background: `${theme.accent}08`, color: theme.cardText, borderColor: theme.cardBorder }}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                style={{ background: theme.accent, color: theme.accentText || "#fff" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};