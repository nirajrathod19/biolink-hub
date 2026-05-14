import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Instagram, Youtube, GraduationCap, Music2, Gamepad2, Shirt,
  Palette, Briefcase, Sparkles, Heart, Play, Calendar, Star,
  Wand2, Flame, TrendingUp, Crown, Zap, Image as ImageIcon, ArrowRight,
} from "lucide-react";

/* ---------------- Types ---------------- */
type PackId =
  | "soft-pastel"
  | "cyber-neon"
  | "luxury-dark"
  | "creator-minimal"
  | "editorial-mono"
  | "glass-aurora"
  | "anime-creator"
  | "gaming-streamer"
  | "fashion-luxe"
  | "corporate-coach";

type TrendTag = "Trending" | "New" | "Top converting" | "Creator favorite" | "Hot this week";

type Template = {
  id: string;
  name: string;
  pack: PackId;
  Icon: typeof Instagram;
  tagline: string;
  creators: string;
  conversion: string;
  tags: TrendTag[];
  // visual tokens
  bg: string;            // background gradient (Tailwind)
  ring: string;          // glow color (Tailwind text/shadow)
  font: "display" | "serif" | "mono" | "sans";
  Preview: React.FC;
};

const PACKS: { id: PackId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "soft-pastel", label: "Soft Pastel" },
  { id: "cyber-neon", label: "Cyber Neon" },
  { id: "luxury-dark", label: "Luxury Dark" },
  { id: "creator-minimal", label: "Creator Minimal" },
  { id: "editorial-mono", label: "Editorial Mono" },
  { id: "glass-aurora", label: "Glass Aurora" },
  { id: "anime-creator", label: "Anime Creator" },
  { id: "gaming-streamer", label: "Gaming Streamer" },
  { id: "fashion-luxe", label: "Fashion Luxe" },
  { id: "corporate-coach", label: "Corporate Coach" },
];

/* ---------------- Live Mini Previews ---------------- */
const InstagramMini = () => (
  <div className="space-y-2.5">
    <div className="flex gap-1.5 overflow-hidden">
      {["🌸", "✨", "🔥", "💫", "🌊"].map((e, i) => (
        <motion.div
          key={i}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
          className="shrink-0 w-9 h-9 rounded-full bg-[conic-gradient(from_0deg,#f472b6,#fb923c,#f472b6)] p-[2px]"
        >
          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs">{e}</div>
        </motion.div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-md bg-gradient-to-br from-fuchsia-500/40 via-rose-500/30 to-amber-400/30" />
      ))}
    </div>
    <div className="relative h-5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-4, -22], opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, delay: i * 0.7, repeat: Infinity }}
          className="absolute left-2"
          style={{ left: `${10 + i * 30}%` }}
        >
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
        </motion.div>
      ))}
    </div>
  </div>
);

const YouTubeMini = () => {
  const [count, setCount] = useState(248321);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 5) + 1), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-2">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-red-500/20 to-transparent skew-x-12"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.12, 1], boxShadow: ["0 0 20px rgba(239,68,68,.4)", "0 0 50px rgba(239,68,68,.7)", "0 0 20px rgba(239,68,68,.4)"] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
          >
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </motion.div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => <div key={i} className="aspect-video rounded bg-gradient-to-br from-red-500/20 to-orange-500/10" />)}
      </div>
      <div className="text-[10px] text-white/70 tabular-nums">
        <span className="font-bold text-white">{count.toLocaleString()}</span> subscribers · LIVE
      </div>
    </div>
  );
};

const CoachMini = () => (
  <div className="space-y-2">
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="rounded-lg border border-amber-300/30 bg-gradient-to-br from-amber-50/10 to-transparent p-2.5"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-200">
        <Calendar className="w-3 h-3" /> 1:1 Strategy Call
      </div>
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {["M", "T", "W", "T", "F"].map((d, i) => (
          <div key={i} className={`text-center text-[9px] rounded py-1 ${i === 2 ? "bg-amber-300 text-amber-900 font-bold" : "bg-white/5 text-white/50"}`}>{d}</div>
        ))}
      </div>
    </motion.div>
    <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[10px] text-white/80 italic">
      "Booked 12 clients in 2 weeks." — Maya
    </div>
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
      <span className="ml-1 text-[10px] text-white/60">4.9 · 312</span>
    </div>
  </div>
);

const MusicianMini = () => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 rounded-full bg-[radial-gradient(circle_at_center,#000_30%,#a855f7_31%,#000_45%,#22d3ee_46%,#000_60%)] border border-white/20"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 absolute" style={{ top: "calc(50% - 4px)", left: "calc(50% - 4px)" }} />
      </motion.div>
      <div className="flex-1">
        <div className="text-[11px] font-semibold text-white">Midnight Drive</div>
        <div className="text-[9px] text-white/50">Single · 3:24</div>
      </div>
    </div>
    <svg viewBox="0 0 100 24" className="w-full h-6">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.rect
          key={i}
          x={i * 3.6}
          width="1.8"
          rx="0.9"
          fill="url(#wgrad)"
          animate={{ height: [4, 12 + (i % 7) * 1.5, 4], y: [10, 12 - (i % 7), 10] }}
          transition={{ duration: 0.9 + (i % 5) * 0.1, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
      <defs>
        <linearGradient id="wgrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const GamingMini = () => (
  <div className="space-y-2">
    <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500/30 via-zinc-900 to-purple-500/30 border border-emerald-400/30">
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500 text-[9px] font-bold text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
      </div>
      <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-emerald-300">2.4k watching</div>
      <Gamepad2 className="absolute inset-0 m-auto w-8 h-8 text-white/40" />
    </div>
    <div className="flex gap-1">
      {["VOD", "Clips", "Schedule"].map((t) => (
        <div key={t} className="flex-1 text-center py-1 text-[9px] font-bold text-emerald-300 border border-emerald-400/30 rounded bg-emerald-500/10">{t}</div>
      ))}
    </div>
  </div>
);

const FashionMini = () => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-1.5">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.04 }}
          className="aspect-[3/4] rounded-md bg-gradient-to-br from-stone-200/20 via-rose-200/10 to-stone-300/20 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute bottom-1 left-1 right-1 text-[8px] text-white/80 font-serif">Look 0{i}</div>
        </motion.div>
      ))}
    </div>
    <div className="text-[9px] text-white/60 font-serif italic tracking-wide">— Spring Edit '26</div>
  </div>
);

const EditorialMini = () => (
  <div className="space-y-1.5 font-mono">
    <div className="text-[9px] uppercase tracking-[0.25em] text-white/50">Issue 04</div>
    <div className="text-base font-bold leading-tight text-white">A Quiet Revolution in Creator Tooling.</div>
    <div className="h-px bg-white/30 my-1" />
    <div className="text-[9px] text-white/60 leading-relaxed">Long-form essays, dispatches, and field notes from the edge of the internet.</div>
    <div className="text-[9px] text-white/40">— Read 4 min</div>
  </div>
);

const AuroraMini = () => (
  <div className="relative h-32 rounded-lg overflow-hidden bg-zinc-950 border border-white/10">
    <motion.div
      animate={{ x: ["-30%", "30%", "-30%"], y: ["-20%", "20%", "-20%"] }}
      transition={{ duration: 8, repeat: Infinity }}
      className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,#a78bfa,transparent_50%),radial-gradient(circle_at_70%_60%,#22d3ee,transparent_50%),radial-gradient(circle_at_50%_80%,#4ade80,transparent_50%)] blur-2xl opacity-70"
    />
    <div className="absolute inset-3 rounded-md bg-white/5 backdrop-blur-md border border-white/20 p-2 flex flex-col justify-end">
      <div className="text-[10px] font-semibold text-white">Aurora — your link, alive.</div>
    </div>
  </div>
);

const AnimeMini = () => (
  <div className="space-y-2">
    <div className="relative h-20 rounded-lg overflow-hidden bg-gradient-to-br from-pink-300 via-sky-300 to-purple-300">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,.15)_4px,rgba(255,255,255,.15)_8px)]" />
      <div className="absolute bottom-1.5 left-2 text-[10px] font-black text-white drop-shadow tracking-widest">SAKURA.WAVE</div>
      <Sparkles className="absolute top-2 right-2 w-3.5 h-3.5 text-white" />
    </div>
    <div className="flex gap-1">
      {["♡ Fan", "★ Shop", "✦ DM"].map((t) => (
        <div key={t} className="flex-1 text-center py-1 text-[9px] font-bold text-pink-200 border-2 border-pink-300 rounded-full bg-pink-500/20">{t}</div>
      ))}
    </div>
  </div>
);

/* ---------------- Templates ---------------- */
const TEMPLATES: Template[] = [
  {
    id: "ig-luxe",
    name: "Aesthetic IG",
    pack: "soft-pastel",
    Icon: Instagram,
    tagline: "Stories, reels, DM-to-buy.",
    creators: "12.4k",
    conversion: "+38%",
    tags: ["Trending", "Creator favorite"],
    bg: "from-fuchsia-500/20 via-rose-500/10 to-amber-300/20",
    ring: "shadow-fuchsia-500/40",
    font: "display",
    Preview: InstagramMini,
  },
  {
    id: "yt-cinema",
    name: "Cinema YouTube",
    pack: "luxury-dark",
    Icon: Youtube,
    tagline: "Auto-synced video hub.",
    creators: "8.1k",
    conversion: "+42%",
    tags: ["Top converting", "Hot this week"],
    bg: "from-red-500/20 via-zinc-900 to-orange-500/10",
    ring: "shadow-red-500/40",
    font: "sans",
    Preview: YouTubeMini,
  },
  {
    id: "coach-trust",
    name: "Coach Authority",
    pack: "corporate-coach",
    Icon: GraduationCap,
    tagline: "Booking. Trust. Revenue.",
    creators: "5.2k",
    conversion: "+51%",
    tags: ["Top converting"],
    bg: "from-amber-200/10 via-zinc-900 to-emerald-500/10",
    ring: "shadow-amber-400/40",
    font: "serif",
    Preview: CoachMini,
  },
  {
    id: "music-vinyl",
    name: "Vinyl Sessions",
    pack: "cyber-neon",
    Icon: Music2,
    tagline: "Audio-reactive identity.",
    creators: "3.8k",
    conversion: "+29%",
    tags: ["New"],
    bg: "from-purple-500/20 via-zinc-950 to-cyan-500/20",
    ring: "shadow-purple-500/50",
    font: "mono",
    Preview: MusicianMini,
  },
  {
    id: "stream-arena",
    name: "Stream Arena",
    pack: "gaming-streamer",
    Icon: Gamepad2,
    tagline: "Live, VODs, and merch.",
    creators: "6.7k",
    conversion: "+33%",
    tags: ["Hot this week", "Trending"],
    bg: "from-emerald-500/20 via-zinc-950 to-purple-500/20",
    ring: "shadow-emerald-500/40",
    font: "mono",
    Preview: GamingMini,
  },
  {
    id: "fashion-luxe",
    name: "Maison Luxe",
    pack: "fashion-luxe",
    Icon: Shirt,
    tagline: "Editorial fashion lookbook.",
    creators: "2.1k",
    conversion: "+44%",
    tags: ["New", "Creator favorite"],
    bg: "from-stone-200/10 via-zinc-900 to-rose-300/10",
    ring: "shadow-rose-300/40",
    font: "serif",
    Preview: FashionMini,
  },
  {
    id: "editorial-mono",
    name: "Field Notes",
    pack: "editorial-mono",
    Icon: Briefcase,
    tagline: "Long-form, archive-ready.",
    creators: "1.4k",
    conversion: "+22%",
    tags: ["New"],
    bg: "from-zinc-800 via-zinc-900 to-black",
    ring: "shadow-white/20",
    font: "mono",
    Preview: EditorialMini,
  },
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    pack: "glass-aurora",
    Icon: Sparkles,
    tagline: "Liquid glass, alive gradients.",
    creators: "4.6k",
    conversion: "+36%",
    tags: ["Trending", "New"],
    bg: "from-violet-500/20 via-zinc-950 to-cyan-400/20",
    ring: "shadow-violet-500/40",
    font: "display",
    Preview: AuroraMini,
  },
  {
    id: "anime-wave",
    name: "Sakura Wave",
    pack: "anime-creator",
    Icon: Palette,
    tagline: "Bold, kawaii, viral.",
    creators: "7.9k",
    conversion: "+47%",
    tags: ["Hot this week", "Creator favorite"],
    bg: "from-pink-400/20 via-purple-400/10 to-sky-400/20",
    ring: "shadow-pink-400/50",
    font: "display",
    Preview: AnimeMini,
  },
];

const TAG_COLOR: Record<TrendTag, string> = {
  "Trending": "bg-rose-500/15 text-rose-300 border-rose-400/30",
  "New": "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  "Top converting": "bg-amber-500/15 text-amber-300 border-amber-400/30",
  "Creator favorite": "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30",
  "Hot this week": "bg-orange-500/15 text-orange-300 border-orange-400/30",
};

const FONT_CLASS: Record<Template["font"], string> = {
  display: "font-display",
  serif: "font-serif",
  mono: "font-mono",
  sans: "font-sans",
};

/* ---------------- Tilt Card ---------------- */
const TiltCard: React.FC<{ tpl: Template; onUse: (t: Template) => void }> = ({ tpl, onUse }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 18 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["20%", "80%"]);
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const Preview = tpl.Preview;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); mx.set(0); my.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`group relative rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-4 transition-shadow duration-500 ${hover ? `shadow-2xl ${tpl.ring}` : "shadow-lg"}`}
    >
      {/* moving glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${glowX} ${glowY}, hsl(var(--primary) / 0.18), transparent 60%)`,
        }}
      />
      {/* glass reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/[0.06] to-transparent" />

      {/* header */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tpl.bg} border border-white/10 flex items-center justify-center`}>
            <tpl.Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <div className={`text-sm font-semibold text-white ${FONT_CLASS[tpl.font]}`}>{tpl.name}</div>
        </div>
        <div className="text-[10px] text-white/50 tabular-nums">{tpl.creators}</div>
      </div>

      {/* live preview */}
      <div className={`relative rounded-xl bg-gradient-to-br ${tpl.bg} border border-white/10 p-3 overflow-hidden`}>
        <Preview />
      </div>

      {/* meta */}
      <div className="relative mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {tpl.tags.slice(0, 1).map((t) => (
            <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${TAG_COLOR[t]} font-semibold tracking-wide`}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold tabular-nums">
          <TrendingUp className="w-3 h-3" /> {tpl.conversion}
        </div>
      </div>

      {/* hover CTA overlay */}
      <AnimatePresence>
        {hover && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={() => onUse(tpl)}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 py-2 rounded-xl bg-white text-zinc-900 text-xs font-bold shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
          >
            Use this template <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ---------------- Marquee ---------------- */
const Marquee: React.FC<{ items: Template[]; speed?: number; reverse?: boolean }> = ({ items, speed = 40, reverse = false }) => {
  const list = [...items, ...items];
  return (
    <div className="group/marquee relative overflow-hidden mask-fade-x">
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-3 w-max group-hover/marquee:[animation-play-state:paused]"
        style={{ animationPlayState: "running" }}
      >
        {list.map((t, i) => (
          <div key={`${t.id}-${i}`} className={`shrink-0 w-44 rounded-xl border border-white/10 bg-gradient-to-br ${t.bg} p-3 backdrop-blur-md`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <t.Icon className="w-3 h-3 text-white" />
              <span className="text-[10px] font-semibold text-white/90 truncate">{t.name}</span>
            </div>
            <div className="text-[9px] text-white/60 truncate">{t.tagline}</div>
            <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-300 font-bold">
              <Flame className="w-2.5 h-2.5" /> {t.conversion} CVR
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ---------------- AI Theme Generator Preview ---------------- */
const AIThemeBlock = () => {
  const palettes = useMemo(
    () => [
      ["#f5b8d6", "#a78bfa", "#22d3ee", "#0f172a"],
      ["#fbbf24", "#f97316", "#7c2d12", "#fef3c7"],
      ["#22d3ee", "#a855f7", "#f472b6", "#0a0a0a"],
      ["#10b981", "#0ea5e9", "#1e293b", "#f0fdf4"],
    ],
    []
  );
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % palettes.length), 2200);
    return () => clearInterval(t);
  }, [palettes.length]);

  return (
    <div className="relative rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-6 md:p-8 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative grid md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-wide uppercase text-fuchsia-300">
            <Wand2 className="w-3 h-3" /> New · AI Theme Studio
          </div>
          <h3 className="mt-3 text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-tight">
            Generate a theme from <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">your photo.</span>
          </h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">
            Drop a selfie, brand image, or moodboard. Brioo extracts a palette, gradient, button shape, and typography pair — instantly.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-zinc-900 text-sm font-bold hover:scale-[1.02] transition">
            <ImageIcon className="w-4 h-4" /> Try AI Theme
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-3">
            <Zap className="w-3 h-3 text-fuchsia-300" /> Generated palette
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-4 gap-2">
                {palettes[idx].map((c, i) => (
                  <div key={i} className="aspect-square rounded-lg border border-white/10" style={{ background: c, boxShadow: `0 8px 30px ${c}55` }} />
                ))}
              </div>
              <div className="rounded-xl p-3 border border-white/10" style={{ background: `linear-gradient(135deg, ${palettes[idx][0]}, ${palettes[idx][1]}, ${palettes[idx][2]})` }}>
                <div className="text-[10px] uppercase tracking-widest text-white/80">Preview</div>
                <div className="font-display font-bold text-white text-lg leading-tight">@yourname</div>
                <button className="mt-2 px-3 py-1.5 rounded-full bg-white text-zinc-900 text-[10px] font-bold">Follow</button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main Section ---------------- */
export const TemplateShowcase = () => {
  const [pack, setPack] = useState<PackId | "all">("all");
  const filtered = pack === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.pack === pack);

  const onUse = (_t: Template) => {
    window.location.href = "/signup";
  };

  return (
    <section id="templates" className="relative py-24 md:py-32 overflow-hidden">
      {/* ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      </div>

      <div className="container relative px-4 md:px-6">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/70">The App Store of creator identities</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em] leading-[1.02] text-white">
            Templates that feel <span className="bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">alive.</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/60 leading-relaxed">
            Not screenshots. Real, interactive previews — engineered for emotion, conversion, and the kind of profile creators are proud to share.
          </p>
        </motion.div>

        {/* Marquee — trending */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/50 px-1">
            <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-rose-400" /> Trending among creators</span>
            <span className="hidden md:inline">Used by 12,400+ creators · Updated daily</span>
          </div>
          <Marquee items={TEMPLATES} speed={45} />
          <Marquee items={[...TEMPLATES].reverse()} speed={55} reverse />
        </div>

        {/* Pack filter */}
        <div className="relative -mx-4 md:mx-0 mb-8">
          <div className="flex md:flex-wrap md:justify-center gap-2 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory">
            {PACKS.map((p) => {
              const active = pack === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPack(p.id)}
                  className={`relative shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    active
                      ? "bg-white text-zinc-900 border-white shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
                      : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              >
                <TiltCard tpl={t} onUse={onUse} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI theme generator */}
        <div className="mt-16">
          <AIThemeBlock />
        </div>
      </div>
    </section>
  );
};

export default TemplateShowcase;
