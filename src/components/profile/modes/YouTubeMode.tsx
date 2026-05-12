import { ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Eye, Users } from "lucide-react";
import type { ProfileModeContext } from "./ProfileModeRouter";

interface Props {
  ctx: ProfileModeContext;
  children: ReactNode;
}

const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

const extractYouTubeId = (url: string) => YT_RE.exec(url)?.[1];

/**
 * YouTube Creator Mode — cinematic dark theme with featured-video hero,
 * neon-red accents, subscriber/view stat strip and light-streak sweep.
 */
export const YouTubeMode = ({ ctx, children }: Props) => {
  const featured = useMemo(() => {
    for (const l of ctx.links) {
      const id = extractYouTubeId(l.url || "");
      if (id) return { link: l, videoId: id };
    }
    return null;
  }, [ctx.links]);

  return (
    <div className="yt-mode relative">
      {/* dark cinematic backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(220,38,38,0.18), transparent 55%), radial-gradient(ellipse at bottom, rgba(139,92,246,0.14), transparent 60%), #0a0a0c",
        }}
      />
      {/* light-streak sweep */}
      <motion.div
        aria-hidden
        initial={{ x: "-30%" }}
        animate={{ x: "130%" }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute top-10 left-0 right-0 h-32 -z-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
        }}
      />

      <div className="relative z-10 text-white">
        {featured && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="Featured video"
            className="mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-30px_rgba(220,38,38,0.5)]"
          >
            <div className="relative aspect-video bg-black">
              <iframe
                title={featured.link.title || "Featured video"}
                src={`https://www.youtube.com/embed/${featured.videoId}?rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            {featured.link.title && (
              <div className="px-4 py-3 bg-gradient-to-r from-red-600/20 via-transparent to-violet-600/20">
                <p className="text-sm font-medium tracking-tight flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-red-500" fill="currentColor" />
                  {featured.link.title}
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 grid grid-cols-3 gap-2 text-center text-xs"
        >
          {[
            { Icon: Users, label: "Subscribers", value: "Watch & subscribe" },
            { Icon: Play, label: "Latest", value: featured ? "Now playing" : "Coming soon" },
            { Icon: Eye, label: "Channel", value: "Live updates" },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2.5 border border-white/10 bg-white/[0.03] backdrop-blur-sm"
            >
              <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-red-500" />
              <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
              <div className="text-[11px] font-medium opacity-90 truncate">{value}</div>
            </div>
          ))}
        </motion.div>

        {children}
      </div>

      <style>{`
        .yt-mode a[class*="rounded-2xl"],
        .yt-mode a[class*="rounded-xl"] {
          transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease;
        }
        .yt-mode a[class*="rounded-2xl"]:hover,
        .yt-mode a[class*="rounded-xl"]:hover {
          transform: scale(1.03);
          box-shadow: 0 0 0 1px rgba(220,38,38,.6), 0 20px 60px -20px rgba(220,38,38,.55);
        }
      `}</style>
    </div>
  );
};
