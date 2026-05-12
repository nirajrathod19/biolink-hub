import { ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { Music, Radio } from "lucide-react";
import type { ProfileModeContext } from "./ProfileModeRouter";

interface Props {
  ctx: ProfileModeContext;
  children: ReactNode;
}

const SPOTIFY_RE = /open\.spotify\.com\/(track|album|playlist|artist)\/([A-Za-z0-9]+)/;

/**
 * Musician Mode — immersive, audio-reactive aesthetics.
 * Adds animated SVG waveform background, neon purple/cyan accents and
 * embeds the first Spotify link as a hero player.
 */
export const MusicianMode = ({ ctx, children }: Props) => {
  const spotifyEmbed = useMemo(() => {
    for (const l of ctx.links) {
      const m = SPOTIFY_RE.exec(l.url || "");
      if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=brioo`;
    }
    return null;
  }, [ctx.links]);

  return (
    <div className="musician-mode relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(139,92,246,0.25), transparent 55%), radial-gradient(ellipse at bottom, rgba(34,211,238,0.22), transparent 60%), #07060f",
        }}
      />
      {/* Animated waveform */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 w-full h-40 opacity-50"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50"
            fill="none"
            stroke="url(#wave-grad)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0.6, 1, 0.6],
              opacity: [0.3, 0.7, 0.3],
              y: [0, -4 - i * 2, 0],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
      </svg>

      <div className="relative z-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] tracking-wider uppercase border border-white/15 bg-white/[0.04] backdrop-blur-md"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          Now streaming
        </motion.div>

        {spotifyEmbed && (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            aria-label="Featured track"
            className="mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-30px_rgba(139,92,246,0.6)]"
          >
            <iframe
              title="Featured track"
              src={spotifyEmbed}
              width="100%"
              height="152"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </motion.section>
        )}

        {!spotifyEmbed && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-5 flex items-center gap-3">
            <Music className="w-5 h-5 text-cyan-300" />
            <div className="text-sm opacity-80">
              Drop a Spotify link below to feature your latest release.
            </div>
          </div>
        )}

        {children}
      </div>

      <style>{`
        .musician-mode a[class*="rounded-2xl"],
        .musician-mode a[class*="rounded-xl"] {
          transition: transform .3s ease, box-shadow .3s ease, filter .3s ease;
        }
        .musician-mode a[class*="rounded-2xl"]:hover,
        .musician-mode a[class*="rounded-xl"]:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 0 1px rgba(167,139,250,0.5), 0 20px 60px -20px rgba(34,211,238,0.5);
          filter: brightness(1.08);
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 24px rgba(167,139,250,0.3); }
          50% { box-shadow: 0 0 48px rgba(34,211,238,0.45); }
        }
      `}</style>
    </div>
  );
};
