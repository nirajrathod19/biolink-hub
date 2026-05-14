import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, Users, TrendingUp, DollarSign, Heart } from "lucide-react";

interface Activity {
  icon: typeof ShoppingBag;
  text: string;
  tone: "primary" | "accent";
}

const SAMPLES: Activity[] = [
  { icon: ShoppingBag, text: "Someone bought your ebook", tone: "primary" },
  { icon: Eye, text: "12 new visitors from Instagram", tone: "accent" },
  { icon: TrendingUp, text: "Your latest reel link is trending", tone: "primary" },
  { icon: Users, text: "New lead captured from your bio", tone: "accent" },
  { icon: DollarSign, text: "Affiliate sale completed: +$24.00", tone: "primary" },
  { icon: Heart, text: "47 hearts on your community post", tone: "accent" },
];

export const LiveActivityFeed = () => {
  const [items, setItems] = useState<(Activity & { id: number })[]>([]);

  useEffect(() => {
    let id = 0;
    const push = () => {
      const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      setItems((prev) => [{ ...sample, id: ++id }, ...prev].slice(0, 4));
    };
    push();
    const t = setInterval(push, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.section
      aria-label="Live activity"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Live activity</h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-[11px] text-muted-foreground">streaming</span>
        </div>
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <motion.li
                key={it.id}
                layout
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 px-3 py-2.5"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50"
                  style={{
                    background:
                      it.tone === "primary"
                        ? "radial-gradient(circle at 50% 30%, hsl(var(--primary)/0.25), transparent 70%)"
                        : "radial-gradient(circle at 50% 30%, hsl(var(--accent)/0.25), transparent 70%)",
                  }}
                >
                  <Icon className="h-4 w-4 text-foreground/85" />
                </div>
                <span className="text-sm text-foreground/90">{it.text}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
};
