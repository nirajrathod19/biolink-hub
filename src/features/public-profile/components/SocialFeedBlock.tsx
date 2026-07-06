import { useMemo } from "react";
import { motion } from "framer-motion";
import { Youtube, Instagram, Music2 } from "lucide-react";
import type { BioTheme } from "@/lib/bioThemes";

interface SocialFeedBlockProps {
  url: string;
  title?: string | null;
  creatorId: string;
  theme: BioTheme;
}

type Platform = "youtube" | "tiktok" | "instagram" | "unknown";

const detectPlatform = (raw: string): { platform: Platform; embedUrl: string | null } => {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    // YouTube
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return { platform: "youtube", embedUrl: id ? `https://www.youtube.com/embed/${id}` : null };
    }
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1]) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${parts[1]}` };
      if (parts[0] === "embed" && parts[1]) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${parts[1]}` };
    }
    // TikTok
    if (host.endsWith("tiktok.com")) {
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (m) return { platform: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${m[1]}` };
      return { platform: "tiktok", embedUrl: null };
    }
    // Instagram
    if (host.endsWith("instagram.com")) {
      const m = u.pathname.match(/\/(reel|p|tv)\/([^/]+)/);
      if (m) return { platform: "instagram", embedUrl: `https://www.instagram.com/${m[1]}/${m[2]}/embed` };
      return { platform: "instagram", embedUrl: null };
    }
  } catch {
    /* ignore */
  }
  return { platform: "unknown", embedUrl: null };
};

const PLATFORM_META: Record<Platform, { label: string; Icon: any; color: string }> = {
  youtube: { label: "YouTube", Icon: Youtube, color: "#FF0033" },
  tiktok: { label: "TikTok", Icon: Music2, color: "#000000" },
  instagram: { label: "Instagram", Icon: Instagram, color: "#E1306C" },
  unknown: { label: "Feed", Icon: Youtube, color: "#666" },
};

/**
 * SocialFeedBlock — responsive lazy-loaded video/reel embed for YouTube,
 * TikTok, and Instagram. Read-only public renderer; no writes.
 */
export const SocialFeedBlock = ({ url, title, creatorId, theme }: SocialFeedBlockProps) => {
  const { platform, embedUrl } = useMemo(() => detectPlatform(url), [url]);
  const isGlass = theme.cardBg.includes("rgba");
  const meta = PLATFORM_META[platform];
  const Icon = meta.Icon;

  // Tag outbound-open with creator for lightweight tracking parity
  const openHref = useMemo(() => {
    try {
      const u = new URL(url);
      u.searchParams.set("utm_source", "brioo");
      u.searchParams.set("utm_medium", "social_feed");
      u.searchParams.set("utm_content", creatorId);
      return u.toString();
    } catch {
      return url;
    }
  }, [url, creatorId]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label={title || `${meta.label} feed`}
      className="my-6 rounded-2xl overflow-hidden"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.accent}25`,
        backdropFilter: isGlass ? "blur(16px)" : undefined,
        WebkitBackdropFilter: isGlass ? "blur(16px)" : undefined,
        boxShadow: `0 8px 32px ${theme.accent}12`,
      }}
    >
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-base leading-tight" style={{ color: theme.cardText }}>
            {title || `Latest on ${meta.label}`}
          </h3>
          <p className="text-xs opacity-60" style={{ color: theme.cardText }}>Tap to watch</p>
        </div>
      </div>

      {embedUrl ? (
        <div className="relative w-full" style={{ paddingBottom: platform === "tiktok" ? "170%" : platform === "instagram" ? "125%" : "56.25%" }}>
          <iframe
            src={embedUrl}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            title={title || `${meta.label} embed`}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : (
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-5 py-8 text-center text-sm min-h-[56px]"
          style={{ color: theme.cardText }}
        >
          Open on {meta.label} →
        </a>
      )}
    </motion.section>
  );
};
