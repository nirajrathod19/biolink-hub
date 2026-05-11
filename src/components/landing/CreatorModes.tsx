import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Youtube, GraduationCap, Play, Heart, MessageCircle, Calendar, Star, ShoppingBag } from "lucide-react";

type ModeKey = "instagram" | "youtube" | "coach";

const MODES: Record<ModeKey, {
  label: string;
  tagline: string;
  Icon: typeof Instagram;
  accent: string;
  ring: string;
}> = {
  instagram: {
    label: "Instagram Creator",
    tagline: "Story-style highlights, reels, and DM-to-buy.",
    Icon: Instagram,
    accent: "from-fuchsia-500 via-rose-500 to-amber-400",
    ring: "ring-fuchsia-400/40",
  },
  youtube: {
    label: "YouTube Creator",
    tagline: "Cinematic dark hub with auto-synced videos.",
    Icon: Youtube,
    accent: "from-red-500 via-rose-500 to-orange-500",
    ring: "ring-red-400/40",
  },
  coach: {
    label: "Coach / Freelancer",
    tagline: "Booking, courses, testimonials — trust first.",
    Icon: GraduationCap,
    accent: "from-emerald-400 via-teal-400 to-cyan-400",
    ring: "ring-emerald-400/40",
  },
};

const InstagramPreview = () => (
  <div className="space-y-3">
    <div className="flex gap-3 overflow-hidden">
      {["🌸", "✨", "🔥", "💫", "🌊"].map((e, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 p-[2px]"
        >
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-lg">
            {e}
          </div>
        </motion.div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.04 }}
          className="aspect-square rounded-lg bg-gradient-to-br from-fuchsia-500/30 via-rose-500/20 to-amber-400/20 border border-white/10"
        />
      ))}
    </div>
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> 12.4k</span>
      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-fuchsia-400" /> DM Me</span>
    </div>
  </div>
);

const YouTubePreview = () => (
  <div className="space-y-3">
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/10"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-14 h-14 rounded-full bg-red-500/90 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]"
        >
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </motion.div>
      </div>
      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium">12:34</div>
    </motion.div>
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-video rounded-md bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-white/10" />
      ))}
    </div>
    <div className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">248K</span> subscribers · Live in 2h
    </div>
  </div>
);

const CoachPreview = () => (
  <div className="space-y-3">
    <div className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
        <Calendar className="w-3.5 h-3.5" /> Book a 1:1 call
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {["Mon", "Tue", "Wed", "Thu"].map((d, i) => (
          <div key={d} className={`text-center text-[10px] rounded py-1.5 ${i === 1 ? "bg-emerald-400 text-emerald-950 font-semibold" : "bg-white/5 text-muted-foreground"}`}>
            {d}
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-1.5">
      {["Mastermind Course", "Strategy eBook", "Weekly Newsletter"].map((t, i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
        >
          <span className="font-medium text-foreground">{t}</span>
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
        </motion.div>
      ))}
    </div>
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
      <span className="ml-1">4.9 · 312 reviews</span>
    </div>
  </div>
);

const PREVIEW: Record<ModeKey, JSX.Element> = {
  instagram: <InstagramPreview />,
  youtube: <YouTubePreview />,
  coach: <CoachPreview />,
};

export const CreatorModes = () => {
  const [active, setActive] = useState<ModeKey>("instagram");
  const mode = MODES[active];

  return (
    <section className="relative py-24 overflow-hidden" id="modes">
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r ${mode.accent} opacity-10 blur-[120px] transition-all duration-1000`} />
      </div>

      <div className="container relative px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-medium text-primary tracking-wide uppercase">Built for your craft</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
            One link.{" "}
            <span className={`bg-gradient-to-r ${mode.accent} bg-clip-text text-transparent`}>
              Every kind of creator.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Brioo adapts to who you are — the layout, blocks, and monetization shift to match your audience.
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {(Object.keys(MODES) as ModeKey[]).map((k) => {
            const M = MODES[k];
            const isActive = k === active;
            return (
              <button
                key={k}
                onClick={() => setActive(k)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="modePill"
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${M.accent} opacity-20 ring-1 ${M.ring}`}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <M.Icon className="relative w-4 h-4" />
                <span className="relative">{M.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview card */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            layout
            className="glass-card rounded-3xl p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${mode.accent} bg-opacity-10 mb-4`}>
                <mode.Icon className="w-4 h-4 text-foreground" />
                <span className="text-xs font-semibold text-foreground">{mode.label}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-3">
                {mode.tagline}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Smart blocks, role-aware themes, and conversion-first layouts — all generated for you.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Smart blocks", "Auto theme", "AI bio", "1-tap monetize"].map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-4 shadow-2xl"
              >
                {PREVIEW[active]}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
