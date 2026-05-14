import { motion } from "framer-motion";
import { TrendingUp, Eye, MousePointer, DollarSign, Sparkles, Activity } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { cn } from "@/lib/utils";

interface MissionControlHeroProps {
  displayName?: string;
  username?: string;
  totalViews: number;
  totalClicks: number;
  clickRate: string;
  earnings: number;
  isPro?: boolean;
  isLive?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export const MissionControlHero = ({
  displayName,
  username,
  totalViews,
  totalClicks,
  clickRate,
  earnings,
  isPro,
  isLive,
}: MissionControlHeroProps) => {
  const greetingName = displayName || username || "Creator";
  const hour = new Date().getHours();
  const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const kpis = [
    {
      icon: Eye,
      label: "Profile views",
      value: totalViews,
      format: (v: number) => Math.round(v).toLocaleString(),
      tint: "from-primary/30 to-primary/5",
      ring: "ring-primary/20",
    },
    {
      icon: MousePointer,
      label: "Link clicks",
      value: totalClicks,
      format: (v: number) => Math.round(v).toLocaleString(),
      tint: "from-accent/30 to-accent/5",
      ring: "ring-accent/30",
    },
    {
      icon: TrendingUp,
      label: "Conversion",
      value: null as number | null,
      display: clickRate,
      tint: "from-primary/20 to-accent/10",
      ring: "ring-primary/20",
    },
    {
      icon: DollarSign,
      label: "Earnings",
      value: isPro ? earnings : 0,
      format: (v: number) => `$${v.toFixed(2)}`,
      tint: "from-accent/30 to-primary/10",
      ring: "ring-accent/30",
    },
  ];

  return (
    <section aria-label="Mission control" className="relative">
      {/* Greeting */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-primary" />
            Mission Control
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight sm:text-[2rem]">
            Good {period},{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
                backgroundSize: "200% 100%",
                animation: "shimmer 6s linear infinite",
              }}
            >
              {greetingName}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's how your creator business is moving today.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 backdrop-blur-md">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <LiveIndicator isConnected={!!isLive} />
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              whileHover={{ y: -3, transition: { duration: 0.25 } }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-xl ring-1",
                k.ring
              )}
            >
              {/* tint wash */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-500 group-hover:opacity-100",
                  k.tint
                )}
              />
              {/* sheen */}
              <div className="pointer-events-none absolute -inset-x-10 -top-10 h-24 rotate-12 bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </div>
                <div className="mt-1 font-display text-2xl font-bold tracking-tight">
                  {k.value !== null && k.format ? (
                    <AnimatedCounter value={k.value} formatFn={k.format} />
                  ) : (
                    <span>{k.display}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </section>
  );
};
