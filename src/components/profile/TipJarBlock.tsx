import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coffee, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePublicTipJar } from "@/hooks/useTipJar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BioTheme } from "@/lib/bioThemes";

interface TipJarBlockProps {
  userId: string;
  creatorName?: string;
  theme: BioTheme;
}

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export const TipJarBlock = ({ userId, creatorName, theme }: TipJarBlockProps) => {
  const { data: tipJar, isLoading } = usePublicTipJar(userId);
  const [selected, setSelected] = useState<number>(100);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading || !tipJar || !(tipJar as any).razorpay_enabled) return null;

  const presets = [100, 500, 1000];
  const accent = theme.accent;
  const amount = custom ? Number(custom) : selected;

  const handleTip = async () => {
    if (!amount || amount < 1) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Couldn't load payment SDK");

      const { data, error } = await supabase.functions.invoke("create-tip-order", {
        body: {
          creator_id: userId,
          amount,
          supporter_name: name || "Anonymous",
          message: message || null,
        },
      });
      if (error) throw error;

      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: creatorName || "Brioo Creator",
        description: "Tip via Brioo",
        order_id: data.order_id,
        prefill: { name: name || "" },
        theme: { color: accent },
        handler: async (resp: any) => {
          try {
            const { error: vErr } = await supabase.functions.invoke("verify-tip-payment", {
              body: {
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                tip_id: data.tip_id,
              },
            });
            if (vErr) throw vErr;
            toast.success("Thanks for your support! 💜");
            setCustom("");
            setMessage("");
            setName("");
          } catch (e: any) {
            toast.error(e?.message || "Verification failed");
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", () => toast.error("Payment failed"));
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message || "Could not start payment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="my-6 rounded-2xl p-5"
      style={{
        background: theme.cardBg || `${accent}10`,
        border: `1px solid ${theme.cardBorder || `${accent}25`}`,
        backdropFilter: theme.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
          <Coffee className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div>
          <h3 className="font-semibold text-base" style={{ color: theme.textColor }}>Send a tip</h3>
          {tipJar.message && <p className="text-xs" style={{ color: theme.bioTextColor }}>{tipJar.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => { setSelected(p); setCustom(""); }}
            className="py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: selected === p && !custom ? accent : `${accent}12`,
              color: selected === p && !custom ? theme.accentText : accent,
              border: `1px solid ${accent}30`,
            }}
          >
            ₹{p}
          </button>
        ))}
      </div>

      <Input
        type="number"
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder="Or enter custom amount (₹)"
        min={1}
        className="mb-2 text-sm"
        style={{ background: `${accent}06`, color: theme.cardText, borderColor: theme.cardBorder }}
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        maxLength={60}
        className="mb-2 text-sm"
        style={{ background: `${accent}06`, color: theme.cardText, borderColor: theme.cardBorder }}
      />
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Leave a message (optional)"
        maxLength={200}
        className="mb-3 text-sm min-h-[60px]"
        style={{ background: `${accent}06`, color: theme.cardText, borderColor: theme.cardBorder }}
      />

      <Button
        onClick={handleTip}
        disabled={busy}
        className="w-full font-semibold gap-2"
        style={{ background: accent, color: theme.accentText }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
        {busy ? "Processing…" : `Tip ₹${amount || 0}`}
      </Button>
    </motion.div>
  );
};
