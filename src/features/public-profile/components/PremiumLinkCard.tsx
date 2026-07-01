import { memo } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Play, Download, ShoppingBag, Share2, Sparkles, Zap,
} from "lucide-react";
import type { BioTheme } from "@/lib/bioThemes";
import { detectLinkVariant, extractYouTubeId, type LinkVariant } from "../utils/linkVariant";

export interface PremiumLink {
  id: string;
  title: string | null;
  url: string | null;
  badge?: string | null;
  icon?: string | null;
  is_highlighted?: boolean | null;
  link_type?: string | null;
  click_count?: number | null;
  animation?: string | null;
}

interface Props {
  link: PremiumLink;
  theme: BioTheme;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, link: { id: string; url: string }) => void;
  size?: "md" | "lg";
}

const variantIcon: Record<LinkVariant, React.ComponentType<{ className?: string }>> = {
  standard: ArrowUpRight,
  social: Share2,
  product: ShoppingBag,
  video: Play,
  download: Download,
  cta: Zap,
};

const variantLabel: Record<LinkVariant, string> = {
  standard: "Link",
  social: "Social",
  product: "Shop",
  video: "Watch",
  download: "Download",
  cta: "Open",
};

/**
 * Premium polymorphic link card — mobile-first, large tap target,
 * variant-aware visual treatment. Schema-free: rich variant inferred
 * from `link_type` + `url`.
 */
export const PremiumLinkCard = memo(({ link, theme, onLinkClick, size = "md" }: Props) => {
  const variant = detectLinkVariant(link);
  const Icon = variantIcon[variant];
  const isGlass = theme.cardBg.includes("rgba");
  const isFeatured = !!link.is_highlighted;

  // YouTube thumbnail for video variants — zero-cost rich preview
  const ytId = variant === "video" && link.url ? extractYouTubeId(link.url) : null;
  const thumbnail = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <motion.a
      href={link.url || "#"}
      onClick={(e) => onLinkClick(e, { id: link.id, url: link.url || "" })}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      whileTap={{ scale: 0.98 }}
      className="group relative block w-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: theme.cardBg,
        border: `1px solid ${isFeatured ? theme.accent + "55" : theme.cardBorder}`,
        color: theme.cardText,
        backdropFilter: isGlass ? "blur(16px) saturate(160%)" : undefined,
        WebkitBackdropFilter: isGlass ? "blur(16px) saturate(160%)" : undefined,
        boxShadow: isFeatured
          ? `0 1px 0 ${theme.accent}22 inset, 0 12px 32px -10px ${theme.accent}40, 0 24px 56px -20px rgba(0,0,0,0.20)`
          : isGlass
          ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px -6px rgba(0,0,0,0.18)"
          : "inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 16px -4px rgba(0,0,0,0.08)",
        minHeight: size === "lg" ? 88 : 64,
      }}
      aria-label={`${link.title || "Open link"} — ${variantLabel[variant]}`}
    >
      {/* Hover glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(60% 80% at 50% 0%, ${theme.accent}1f, transparent 70%)` }}
      />

      {thumbnail && (
        <div className="relative aspect-video w-full overflow-hidden" style={{ background: theme.hoverBg }}>
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md"
              style={{ background: `${theme.accent}E6`, color: theme.accentText }}
            >
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>
      )}

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:-rotate-3 group-hover:scale-105"
          style={{
            background: isFeatured ? theme.accent : `${theme.accent}1f`,
            border: `1px solid ${theme.accent}30`,
            color: isFeatured ? theme.accentText : theme.accent,
          }}
        >
          {isFeatured ? <Sparkles className="w-4.5 h-4.5" /> : <Icon className="w-4.5 h-4.5" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold tracking-tight truncate text-[15px] leading-snug">
            {link.title || "Untitled"}
          </p>
          <p className="text-[11px] uppercase tracking-wider opacity-60 mt-0.5">
            {variantLabel[variant]}
            {typeof link.click_count === "number" && link.click_count > 25 && (
              <span className="ml-2 opacity-80">· {link.click_count.toLocaleString()} clicks</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {link.badge && (
            <span
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full tracking-wide uppercase"
              style={{
                background: isFeatured ? `${theme.accent}` : `${theme.accent}1f`,
                color: isFeatured ? theme.accentText : theme.accent,
              }}
            >
              {link.badge}
            </span>
          )}
          <ArrowUpRight
            className="w-4 h-4 opacity-40 transition-all group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            style={{ color: theme.accent }}
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.a>
  );
});

PremiumLinkCard.displayName = "PremiumLinkCard";
