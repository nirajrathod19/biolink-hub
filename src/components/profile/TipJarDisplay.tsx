import { motion } from "framer-motion";
import { Heart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicTipJar } from "@/hooks/useTipJar";
import type { BioTheme } from "@/lib/bioThemes";

interface TipJarDisplayProps {
  userId: string;
  themeColor?: string;
  theme?: BioTheme;
}

export const TipJarDisplay = ({ userId, themeColor = "#8B5CF6", theme }: TipJarDisplayProps) => {
  const { data: tipJar, isLoading } = usePublicTipJar(userId);

  const accent = theme?.accent || themeColor;

  if (isLoading || !tipJar) return null;

  const hasPaymentMethod = tipJar.paypal_email || tipJar.venmo_username || tipJar.cashapp_tag;
  if (!hasPaymentMethod) return null;

  const paymentOptions: { label: string; url: string; icon: string }[] = [];
  if (tipJar.paypal_email) {
    paymentOptions.push({ label: "PayPal", url: `https://paypal.me/${tipJar.paypal_email}`, icon: "💳" });
  }
  if (tipJar.venmo_username) {
    paymentOptions.push({ label: "Venmo", url: `https://venmo.com/${tipJar.venmo_username}`, icon: "💙" });
  }
  if (tipJar.cashapp_tag) {
    paymentOptions.push({ label: "Cash App", url: `https://cash.app/${tipJar.cashapp_tag}`, icon: "💚" });
  }

  const suggestedAmounts = Array.isArray(tipJar.suggested_amounts) ? tipJar.suggested_amounts : [3, 5, 10];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}20` }}
        >
          <Heart className="w-4 h-4" style={{ color: accent }} />
        </div>
        <h2 className="font-semibold text-lg" style={{ color: theme?.textColor }}>Support Me</h2>
      </div>

      <div
        className="rounded-xl p-5"
        style={{
          background: theme?.cardBg,
          border: theme ? `1px solid ${theme.cardBorder}` : undefined,
          backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
        }}
      >
        {tipJar.message && (
          <p className="text-sm mb-4 text-center" style={{ color: theme?.cardText }}>{tipJar.message}</p>
        )}

        <div className="flex justify-center gap-2 mb-4">
          {suggestedAmounts.map((amount: number) => (
            <span
              key={amount}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                borderColor: `${accent}30`,
                color: accent,
                backgroundColor: `${accent}10`,
                border: `1px solid ${accent}30`,
              }}
            >
              ${amount}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {paymentOptions.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              className="w-full gap-2"
              style={{ borderColor: `${accent}30`, color: theme?.cardText }}
              asChild
            >
              <a href={option.url} target="_blank" rel="noopener noreferrer">
                <span>{option.icon}</span>
                <span>Tip via {option.label}</span>
              </a>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
