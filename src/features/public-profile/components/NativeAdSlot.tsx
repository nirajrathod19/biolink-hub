import { useEffect, useRef } from "react";
import { Megaphone, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePublicAdConfig, type AdPlacement } from "@/hooks/useAdConfigurations";

interface NativeAdSlotProps {
  creatorId?: string;
  profileId?: string;
  placement: AdPlacement;
  themeAccent?: string;
  className?: string;
}

/** Renders a creator-owned native ad. Fires one impression per mount. */
export const NativeAdSlot = ({
  creatorId,
  profileId,
  placement,
  themeAccent = "#7C3AED",
  className = "",
}: NativeAdSlotProps) => {
  const { data: cfg } = usePublicAdConfig(creatorId, placement);
  const tracked = useRef(false);

  useEffect(() => {
    if (!cfg || !profileId || !creatorId || tracked.current) return;
    tracked.current = true;
    supabase
      .from("ad_impressions")
      .insert({
        profile_id: profileId,
        user_id: creatorId,
        ad_slot: placement,
        estimated_revenue: 0,
      })
      .then(() => {});
  }, [cfg, profileId, creatorId, placement]);

  if (!cfg || !cfg.is_enabled) return null;

  const isSticky = placement === "sticky_bottom";
  const wrapperCls = isSticky
    ? "fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-3 pb-3"
    : className;

  // AdSense mode (raw script — creator-provided)
  if (cfg.ad_source_type === "adsense" && cfg.adsense_script) {
    return (
      <div className={wrapperCls} aria-label="Sponsored">
        <div className="relative rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm overflow-hidden">
          <span className="absolute top-1 left-2 text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wider">
            Ad
          </span>
          <div
            className="p-2"
            // AdSense provides sanitized <ins> markup; creator-scoped.
            dangerouslySetInnerHTML={{ __html: cfg.adsense_script }}
          />
        </div>
      </div>
    );
  }

  // Custom banner mode
  const href = cfg.custom_target_url || "#";
  const banner = cfg.custom_banner_url;
  const alt = cfg.custom_alt_text || "Sponsored";

  const Card = (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored noreferrer"
      className="block group"
    >
      <div
        className="relative overflow-hidden rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
        style={{ boxShadow: `0 0 0 1px ${themeAccent}10` }}
      >
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur text-[10px] font-medium text-muted-foreground">
          <Megaphone className="w-2.5 h-2.5" />
          Sponsored
        </span>
        {banner ? (
          <div className="relative aspect-[4/1] w-full overflow-hidden">
            <img
              src={banner}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeAccent}20` }}
              >
                <Megaphone className="w-4 h-4" style={{ color: themeAccent }} />
              </div>
              <p className="text-sm font-medium truncate">{alt}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        )}
      </div>
    </a>
  );

  if (isSticky) {
    return (
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 24 }}
        className={wrapperCls}
      >
        {Card}
      </motion.div>
    );
  }

  return <div className={className}>{Card}</div>;
};
