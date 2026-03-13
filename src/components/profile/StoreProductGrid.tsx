import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePublicStoreIntegrations,
  getCheckoutUrl,
  getPlatformBranding,
} from "@/hooks/usePublicStoreProducts";
import type { BioTheme } from "@/lib/bioThemes";

interface StoreProductGridProps {
  userId: string;
  themeColor?: string;
  theme?: BioTheme;
}

export const StoreProductGrid = ({ userId, themeColor = "#8B5CF6", theme }: StoreProductGridProps) => {
  const { data: integrations = [], isLoading } = usePublicStoreIntegrations(userId);
  const accent = theme?.accent || themeColor;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded" style={{ background: `${accent}20` }} />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-xl" style={{ background: theme?.cardBg }} />
          ))}
        </div>
      </div>
    );
  }

  if (integrations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
          <ShoppingBag className="w-4 h-4" style={{ color: accent }} />
        </div>
        <h2 className="font-semibold text-lg" style={{ color: theme?.textColor }}>Shop</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {integrations.map((integration, index) => {
          const branding = getPlatformBranding(integration.platform);
          const storeUrl = getCheckoutUrl(integration.platform, integration.store_domain);

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              className="group rounded-xl p-4 transition-all"
              style={{
                background: theme?.cardBg,
                border: theme ? `1px solid ${theme.cardBorder}` : undefined,
                backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{branding.icon}</span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: theme?.cardText }}>
                      {integration.store_name || branding.name}
                    </p>
                    <p className="text-xs" style={{ color: theme?.bioTextColor }}>{branding.name}</p>
                  </div>
                </div>
              </div>

              {integration.store_domain && (
                <p className="text-xs truncate mb-3" style={{ color: theme?.bioTextColor }}>
                  {integration.store_domain}
                </p>
              )}

              <Button
                size="sm"
                className="w-full gap-2 font-semibold"
                style={{ backgroundColor: accent, color: "#fff" }}
                onClick={() => window.open(storeUrl, "_blank")}
              >
                <Store className="w-3 h-3" />
                Buy Now
                <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
