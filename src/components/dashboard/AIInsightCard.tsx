import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface Insight {
  title: string;
  body: string;
  cta: string;
}

const DEFAULT_INSIGHTS: Insight[] = [
  {
    title: "Your audience peaks at 7–9PM",
    body: "Schedule your top link or new product drop in this window for ~22% more clicks.",
    cta: "Schedule a link",
  },
  {
    title: "Add a CTA to your top link",
    body: "Links with action verbs convert 18% better. Try 'Shop the drop' or 'Watch now'.",
    cta: "Optimize CTA",
  },
  {
    title: "Instagram is your strongest channel",
    body: "65% of your clicks come from IG. Pin a story-style highlight at the top of your bio.",
    cta: "Edit highlights",
  },
  {
    title: "Try the AI Bio writer",
    body: "Refresh your bio in your tone of voice — proven to lift profile-to-link conversion.",
    cta: "Generate bio",
  },
];

interface AIInsightCardProps {
  insights?: Insight[];
}

export const AIInsightCard = ({ insights = DEFAULT_INSIGHTS }: AIInsightCardProps) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((v) => (v + 1) % insights.length), 6500);
    return () => clearInterval(id);
  }, [insights.length]);

  const insight = insights[idx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl"
    >
      {/* Aurora wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(120% 80% at 100% 100%, hsl(var(--accent) / 0.20), transparent 55%)",
        }}
      />

      <div className="relative flex items-start gap-4">
        {/* Pulsing orb */}
        <div className="relative shrink-0">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-primary/40 blur-md"
          />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-background/70 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Brioo AI
            </span>
            <span className="text-[11px] text-muted-foreground">insight {idx + 1}/{insights.length}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-display text-base font-semibold leading-snug">
                {insight.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{insight.body}</p>
              <button className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2 transition-all">
                {insight.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
