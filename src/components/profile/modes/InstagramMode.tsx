import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import type { ProfileModeContext } from "./ProfileModeRouter";

interface Props {
  ctx: ProfileModeContext;
  children: ReactNode;
}

/**
 * Instagram Creator Mode — aesthetic, vibrant, story-highlight forward.
 * Adds scoped pastel gradient palette, story-circle rail and animated
 * gradient orbs. Existing profile content renders below the intro band.
 */
export const InstagramMode = ({ ctx, children }: Props) => {
  const highlights = ctx.socialLinks.slice(0, 6);

  return (
    <div
      className="ig-mode relative"
      style={{
        // scoped palette
        ["--ig-pink" as any]: "#ff6fa3",
        ["--ig-peach" as any]: "#ffb37a",
        ["--ig-lavender" as any]: "#b18cff",
        ["--ig-violet" as any]: "#7a5cff",
      }}
    >
      {/* floating gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, var(--ig-pink), transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -25, 20, 0], y: [0, 30, -15, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -right-20 w-80 h-80 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, var(--ig-lavender), transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, var(--ig-peach), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10">
        {/* Story highlights rail */}
        {highlights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="Story highlights"
            className="mb-6 -mx-1 px-1 flex gap-4 overflow-x-auto scrollbar-hide"
          >
            {highlights.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1 shrink-0"
              >
                <span
                  className="block p-[2px] rounded-full transition-transform group-hover:-translate-y-1"
                  style={{
                    background:
                      "conic-gradient(from 0deg, var(--ig-pink), var(--ig-peach), var(--ig-lavender), var(--ig-violet), var(--ig-pink))",
                  }}
                >
                  <span className="block w-16 h-16 rounded-full bg-background p-[2px]">
                    <span className="block w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-md capitalize text-center text-[10px] leading-[60px] font-medium text-foreground">
                      {s.platform.slice(0, 2)}
                    </span>
                  </span>
                </span>
                <span className="text-[10px] capitalize opacity-70">{s.platform}</span>
              </a>
            ))}
          </motion.section>
        )}

        {/* Engagement strip — playful, faux Instagram */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center justify-center gap-4 text-xs opacity-80"
        >
          <span className="inline-flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" style={{ color: "var(--ig-pink)" }} /> aesthetic vibes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" style={{ color: "var(--ig-lavender)" }} /> DM open
          </span>
        </motion.div>

        {children}
      </div>

      <style>{`
        .ig-mode a[class*="rounded-2xl"],
        .ig-mode a[class*="rounded-xl"] {
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .ig-mode a[class*="rounded-2xl"]:hover,
        .ig-mode a[class*="rounded-xl"]:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px -10px var(--ig-pink);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; }
      `}</style>
    </div>
  );
};
