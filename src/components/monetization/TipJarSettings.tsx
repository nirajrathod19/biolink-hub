import { useState, useEffect } from "react";
import { Coffee, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTipJar, useCreateOrUpdateTipJar } from "@/hooks/useTipJar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const TipJarSettings = () => {
  const { data: tipJar, isLoading } = useTipJar();
  const updateTipJar = useCreateOrUpdateTipJar();

  const [isEnabled, setIsEnabled] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [venmoUsername, setVenmoUsername] = useState("");
  const [cashappTag, setCashappTag] = useState("");
  const [message, setMessage] = useState("Support my work!");
  const [suggestedAmounts, setSuggestedAmounts] = useState("3, 5, 10");

  useEffect(() => {
    if (tipJar) {
      setIsEnabled(tipJar.is_enabled);
      setPaypalEmail(tipJar.paypal_email || "");
      setVenmoUsername(tipJar.venmo_username || "");
      setCashappTag(tipJar.cashapp_tag || "");
      setMessage(tipJar.message || "Support my work!");
      setSuggestedAmounts(tipJar.suggested_amounts?.join(", ") || "3, 5, 10");
    }
  }, [tipJar]);

  const handleSave = async () => {
    try {
      const amounts = suggestedAmounts
        .split(",")
        .map((a) => parseFloat(a.trim()))
        .filter((a) => !isNaN(a) && a > 0);

      await updateTipJar.mutateAsync({
        is_enabled: isEnabled,
        paypal_email: paypalEmail || null,
        venmo_username: venmoUsername || null,
        cashapp_tag: cashappTag || null,
        message,
        suggested_amounts: amounts,
      });
      toast.success("Tip jar settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleToggle = async (val: boolean) => {
    setIsEnabled(val);
    // Auto-save the toggle immediately for quick enable/disable
    try {
      const amounts = suggestedAmounts
        .split(",")
        .map((a) => parseFloat(a.trim()))
        .filter((a) => !isNaN(a) && a > 0);
      await updateTipJar.mutateAsync({
        is_enabled: val,
        paypal_email: paypalEmail || null,
        venmo_username: venmoUsername || null,
        cashapp_tag: cashappTag || null,
        message,
        suggested_amounts: amounts,
      });
    } catch {
      // silently fail toggle auto-save
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="animate-pulse h-16" />
    );
  }

  return (
    <GlassCard className="!p-4">
      {/* Compact header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">Tip Jar</h3>
            <p className="text-xs text-muted-foreground">Accept tips on your profile</p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={handleToggle} />
      </div>

      {/* Collapsible settings */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border/40 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Custom Message</Label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Support my work!"
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">PayPal</Label>
                  <Input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="email"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Venmo</Label>
                  <Input
                    value={venmoUsername}
                    onChange={(e) => setVenmoUsername(e.target.value)}
                    placeholder="@user"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cash App</Label>
                  <Input
                    value={cashappTag}
                    onChange={(e) => setCashappTag(e.target.value)}
                    placeholder="$tag"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={updateTipJar.isPending}
                size="sm"
                className="w-full h-8 text-xs"
              >
                <Save className="w-3 h-3 mr-1.5" />
                {updateTipJar.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
