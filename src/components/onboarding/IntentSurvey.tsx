import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ShoppingBag, Store, Link2, MessageSquare, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface IntentSurveyProps {
  open: boolean;
  onComplete: () => void;
}

const intentOptions = [
  {
    id: "sell_products",
    label: "For selling my products",
    labelHi: "अपने प्रोडक्ट्स बेचने के लिए",
    icon: ShoppingBag,
    tier: "pro" as const,
  },
  {
    id: "connect_store",
    label: "Connect my store",
    labelHi: "अपनी दुकान जोड़ने के लिए",
    icon: Store,
    tier: "pro" as const,
  },
  {
    id: "add_links",
    label: "Add links",
    labelHi: "लिंक जोड़ने के लिए",
    icon: Link2,
    tier: "free" as const,
  },
  {
    id: "add_prompts",
    label: "Add prompts",
    labelHi: "प्रॉम्प्ट्स जोड़ने के लिए",
    icon: MessageSquare,
    tier: "free" as const,
  },
  {
    id: "add_pdfs",
    label: "Add PDFs",
    labelHi: "PDF जोड़ने के लिए",
    icon: FileText,
    tier: "pro" as const,
  },
];

export { intentOptions };

export const IntentSurvey = ({ open, onComplete }: IntentSurveyProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || !user) return;
    setSaving(true);
    try {
      // Save content_track as comma-separated and user_intent as JSON
      const contentTrack = selected.join(",");
      const userIntent = {
        selections: selected,
        completed_at: new Date().toISOString(),
      };

      await supabase
        .from("profiles")
        .update({
          content_track: contentTrack,
          user_intent: userIntent,
        } as any)
        .eq("user_id", user.id);

      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      toast({ title: "Preferences saved! 🎉", description: "Your dashboard is now personalized." });
      setTimeout(onComplete, 800);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden border-0 bg-background/95 backdrop-blur-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-display font-bold mb-1">
            What are you using Brioo for?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            आप Brioo का उपयोग किस लिए कर रहे हैं? · Select all that apply
          </DialogDescription>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {intentOptions.map((opt, i) => {
            const isSelected = selected.includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggle(opt.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <opt.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.labelHi}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {opt.tier === "pro" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground font-semibold uppercase">
                      Pro
                    </span>
                  )}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}

          <Button
            onClick={handleSubmit}
            disabled={selected.length === 0 || saving}
            className="w-full mt-4 gap-2"
          >
            {saving ? "Saving..." : <>Continue <Sparkles className="w-4 h-4" /></>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};