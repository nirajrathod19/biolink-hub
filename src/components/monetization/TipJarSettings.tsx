import { useState, useEffect } from "react";
import { DollarSign, Heart, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTipJar, useCreateOrUpdateTipJar } from "@/hooks/useTipJar";
import { toast } from "sonner";

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

  if (isLoading) {
    return (
      <GlassCard>
        <div className="animate-pulse h-48 bg-secondary/50 rounded" />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold">Tip Jar</h3>
          <p className="text-sm text-muted-foreground">
            Accept tips and donations from your audience
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div>
            <Label>Enable Tip Jar</Label>
            <p className="text-xs text-muted-foreground">
              Show tip button on your profile
            </p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label>Custom Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Support my work!"
            rows={2}
          />
        </div>

        {/* Suggested Amounts */}
        <div className="space-y-2">
          <Label>Suggested Amounts (comma separated)</Label>
          <Input
            value={suggestedAmounts}
            onChange={(e) => setSuggestedAmounts(e.target.value)}
            placeholder="3, 5, 10"
          />
          <p className="text-xs text-muted-foreground">
            e.g., "3, 5, 10" will show $3, $5, $10 buttons
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Payment Methods</Label>

          <div className="space-y-2">
            <Label className="text-sm">PayPal Email</Label>
            <Input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Venmo Username</Label>
            <Input
              value={venmoUsername}
              onChange={(e) => setVenmoUsername(e.target.value)}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Cash App Tag</Label>
            <Input
              value={cashappTag}
              onChange={(e) => setCashappTag(e.target.value)}
              placeholder="$cashtag"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateTipJar.isPending}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateTipJar.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </GlassCard>
  );
};
