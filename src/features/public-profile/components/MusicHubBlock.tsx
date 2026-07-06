import { useMemo } from "react";
import { motion } from "framer-motion";
import { Music, ExternalLink } from "lucide-react";
import type { BioTheme } from "@/lib/bioThemes";

export interface MusicPlatformLink {
  platform: "spotify" | "apple" | "soundcloud" | "youtube" | "amazon" | "tidal" | "deezer" | "other";
  url: string;
  label?: string;
}

interface MusicHubBlockProps {
  primaryUrl: string;
  title?: string | null;
  subtitle?: string | null;
  alternates?: MusicPlatformLink[];
  creatorId: string;
  theme: BioTheme;
}

const PLATFORM_STYLE: Record<MusicPlatformLink["platform"], { label: string; color: string }> = {
  spotify: { label: "Spotify", color: "#1DB954" },
  apple: { label: "Apple Music", color: "#FA243C" },
  soundcloud: { label: "SoundCloud", color: "#FF5500" },
  youtube: { label: "YouTube Music", color: "#FF0033" },
  amazon: { label: "Amazon Music", color: "#00A8E1" },
  tidal: { label: "Tidal", color: "#000000" },
  deezer: { label: "Deezer", color: "#A238FF" },
  other: { label: "Listen", color: "#888888" },
};

const detectMusicEmbed = (raw: string): { platform: MusicPlatformLink["platform"]; embedUrl: string | null; aspect: string } => {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("spotify.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      // /track/ID or /episode/ID or /playlist/ID or /album/ID or /show/ID
      const kinds = ["track", "episode", "playlist", "album", "show"];
      const idx = parts.findIndex((p) => kinds.includes(p));
      if (idx >= 0 && parts[idx + 1]) {
        return {
          platform: "spotify",
          embedUrl: `https://open.spotify.com/embed/${parts[idx]}/${parts[idx + 1]}`,
          aspect: parts[idx] === "track" ? "24%" : "60%",
        };
      }
      return { platform: "spotify", embedUrl: null, aspect: "24%" };
    }
    if (host.includes("soundcloud.com")) {
      return {
        platform: "soundcloud",
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`,
        aspect: "22%",
      };
    }
    if (host.includes("music.apple.com")) {
      const embed = raw.replace("music.apple.com", "embed.music.apple.com");
      return { platform: "apple", embedUrl: embed, aspect: "45%" };
    }
    if (host.includes("music.youtube.com") || host.endsWith("youtube.com") || host === "youtu.be") {
      let id: string | null = null;
      if (host === "youtu.be") id = u.pathname.slice(1);
      else id = u.searchParams.get("v");
      return { platform: "youtube", embedUrl: id ? `https://www.youtube.com/embed/${id}` : null, aspect: "56.25%" };
    }
  } catch {
    /* ignore */
  }
  return { platform: "other", embedUrl: null, aspect: "0%" };
};

/**
 * MusicHubBlock — inline audio preview + branded alt platform buttons.
 * Fully public/read-only renderer.
 */
export const MusicHubBlock = ({
  primaryUrl,
  title,
  subtitle,
  alternates = [],
  creatorId,
  theme,
}: MusicHubBlockProps) => {
  const { platform, embedUrl, aspect } = useMemo(() => detectMusicEmbed(primaryUrl), [primaryUrl]);
  const isGlass = theme.cardBg.includes("rgba");

  const withUtm = (raw: string, platformKey: string) => {
    try {
      const u = new URL(raw);
      u.searchParams.set("utm_source", "brioo");
      u.searchParams.set("utm_medium", "music_hub");
      u.searchParams.set("utm_content", `${creatorId}:${platformKey}`);
      return u.toString();
    } catch {
      return raw;
    }
  };

  // Ensure primary is present in the button list too
  const buttons: MusicPlatformLink[] = [
    { platform, url: primaryUrl },
    ...alternates.filter((a) => a.url && a.url !== primaryUrl),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label={title || "Listen"}
      className="my-6 rounded-2xl p-5"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.accent}25`,
        backdropFilter: isGlass ? "blur(16px)" : undefined,
        WebkitBackdropFilter: isGlass ? "blur(16px)" : undefined,
        boxShadow: `0 8px 32px ${theme.accent}12`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}18`, color: theme.accent }}>
          <Music className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-base leading-tight" style={{ color: theme.cardText }}>
            {title || "Listen now"}
          </h3>
          {subtitle && (
            <p className="text-xs opacity-70 truncate" style={{ color: theme.cardText }}>{subtitle}</p>
          )}
        </div>
      </div>

      {embedUrl && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ paddingBottom: aspect, position: "relative", height: 0 }}>
          <iframe
            src={embedUrl}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            title={title || "Audio player"}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {buttons.map((b, i) => {
          const meta = PLATFORM_STYLE[b.platform] || PLATFORM_STYLE.other;
          return (
            <a
              key={`${b.platform}-${i}`}
              href={withUtm(b.url, b.platform)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 h-12 px-4 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]"
              style={{
                background: `${meta.color}15`,
                border: `1px solid ${meta.color}40`,
                color: theme.cardText,
                minHeight: 48,
              }}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: meta.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{b.label || meta.label}</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </motion.section>
  );
};
