import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, ArrowUpRight } from "lucide-react";

interface Insight {
  title: string;
  detail: string;
  confidence: number;
  tag: string;
  accent: string;
}

const DEFAULT_INSIGHTS: Insight[] = [
  {
    title: "Your audience peaks at 7–9 PM",
    detail: "Schedule promo links and stories in this window for ~22% more clicks.",
    confidence: 92,
    tag: "Timing",
    accent: "from-[#7B61FF] to-[#C8B6FF]",
  },
  {
    title: "Shorter CTAs convert 18% better",
    detail: "Try replacing long button copy with verbs like “Get”, “Join”, “Buy”.",
    confidence: 87,
    tag: "Copy",
    accent: "from-[#69EACB] to-[#7B61FF]",
  },
  {
    title: "Add a testimonial above the fold",
    detail: "Profiles with social proof up top see ~14% higher purchase rate.",
    confidence: 81,
    tag: "Layout",
    accent: "from-[#C8B6FF] to-[#69EACB]",
  },
  {
    title: "Instagram traffic monetizes best",
    detail: "Move your highest-margin product to the top for IG visitors.",
    confidence: 90,
    tag: "Monetization",
    accent: "from-[#7B61FF] to-[#69EACB]",
  },
];

interface Props {
  insights?: Insight[];
}

export const AIInsightEngine = ({ insights = DEFAULT_INSIGHTS }: Props) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % insights.length);
    }, 6000);
    return () => clearInterval(t);
  }, [insights.length]);

  const current = insights[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 backdrop-blur-xl">
      {/* AI orb */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #7B61FF 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7B61FF] to-[#69EACB]">
            <Sparkles className="h-4 w-4 text-white" />
            <motion.div
              className="absolute inset-0 rounded-full ring-2 ring-[#7B61FF]/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              AI Insight Engine
            </div>
            <div className="font-display text-sm font-semibold">
              Live recommendations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#69EACB]" : "w-1.5 bg-white/20"
              }`}
              aria-label={`Insight ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full bg-gradient-to-r ${current.accent} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/95`}
            >
              {current.tag}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {current.confidence}% confidence
            </span>
          </div>
          <h4 className="mb-1 font-display text-lg font-semibold leading-tight">
            <Lightbulb className="mr-1 inline h-4 w-4 text-[#69EACB]" />
            {current.title}
          </h4>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {current.detail}
          </p>

          <button className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium backdrop-blur-md transition hover:border-[#69EACB]/40 hover:bg-white/10">
            Apply suggestion
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>

          {/* confidence bar */}
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
            <motion.div
              key={current.title + "-bar"}
              initial={{ width: 0 }}
              animate={{ width: `${current.confidence}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${current.accent}`}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
