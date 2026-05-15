import { motion } from "framer-motion";
import {
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Sparkles,
  Activity,
  DollarSign,
  Target,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveIndicator } from "@/components/ui/LiveIndicator";

interface KPI {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delta: string;
  trend: "up" | "down";
  icon: any;
  accent: string; // tailwind gradient stops
}

interface EtlytixHeroProps {
  views: number;
  clicks: number;
  uniqueVisitors: number;
  conversion: number;
  revenue: number;
  engagement: number;
  healthScore: number;
  topLink?: string;
  isConnected: boolean;
  creatorName?: string;
}

export const EtlytixHero = ({
  views,
  clicks,
  uniqueVisitors,
  conversion,
  revenue,
  engagement,
  healthScore,
  topLink,
  isConnected,
  creatorName,
}: EtlytixHeroProps) => {
  const kpis: KPI[] = [
    {
      label: "Total Revenue",
      value: revenue,
      prefix: "₹",
      delta: "+18.4%",
      trend: "up",
      icon: DollarSign,
      accent: "from-[#7B61FF] to-[#C8B6FF]",
    },
    {
      label: "Live Visitors",
      value: uniqueVisitors,
      delta: "+12.5%",
      trend: "up",
      icon: Users,
      accent: "from-[#69EACB] to-[#7B61FF]",
    },
    {
      label: "Conversion",
      value: conversion,
      suffix: "%",
      delta: "+2.1%",
      trend: "up",
      icon: Target,
      accent: "from-[#C8B6FF] to-[#69EACB]",
    },
    {
      label: "Engagement",
      value: engagement,
      delta: "+8.2%",
      trend: "up",
      icon: Activity,
      accent: "from-[#7B61FF] to-[#69EACB]",
    },
  ];

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 backdrop-blur-2xl md:p-8">
      {/* Decorative rings */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#7B61FF]/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-[#69EACB]/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Header row */}
      <div className="relative mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-[#69EACB]" />
            <span className="bg-gradient-to-r from-[#C8B6FF] to-[#69EACB] bg-clip-text text-transparent">
              Etlytix BI · Creator Intelligence Engine
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {creatorName ? `Welcome back, ${creatorName}` : "Your business, in motion"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live momentum · top link {topLink ? `“${topLink}”` : "—"} is leading today
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiveIndicator isConnected={isConnected} />
          <HealthOrb score={healthScore} />
        </div>
      </div>

      {/* KPI grid */}
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-all hover:border-white/20"
          >
            {/* hover glow */}
            <div
              className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${kpi.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
            />
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.accent} shadow-lg shadow-black/20`}
              >
                <kpi.icon className="h-4 w-4 text-white" />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  kpi.trend === "up"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-rose-500/10 text-rose-300"
                }`}
              >
                {kpi.delta}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              {kpi.prefix && (
                <span className="text-lg font-medium text-muted-foreground">
                  {kpi.prefix}
                </span>
              )}
              <AnimatedCounter
                value={kpi.value}
                className="font-display text-2xl font-bold tracking-tight md:text-3xl"
              />
              {kpi.suffix && (
                <span className="text-base text-muted-foreground">
                  {kpi.suffix}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground/80">
              {kpi.label}
            </p>

            {/* sparkline pulse line */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px overflow-hidden">
              <motion.div
                className={`h-full w-1/3 bg-gradient-to-r ${kpi.accent}`}
                animate={{ x: ["-100%", "300%"] }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary strip */}
      <div className="relative mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Views", value: views, icon: Eye },
          { label: "Total Clicks", value: clicks, icon: MousePointer },
          {
            label: "Audience Growth",
            value: Math.round(uniqueVisitors * 1.12),
            icon: TrendingUp,
          },
          {
            label: "Earnings Pulse",
            value: Math.round(revenue / 30),
            icon: Activity,
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 backdrop-blur-md"
          >
            <item.icon className="h-4 w-4 text-[#69EACB]" />
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold">
                <AnimatedCounter value={item.value} />
              </div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const HealthOrb = ({ score }: { score: number }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 4;
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color =
    clamped >= 75 ? "#69EACB" : clamped >= 50 ? "#7B61FF" : "#C8B6FF";

  return (
    <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
      <div className="relative h-14 w-14">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={r}
            stroke="hsl(var(--muted-foreground) / 0.2)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-sm font-bold">{clamped}</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          AI Health
        </div>
        <div className="text-xs font-semibold">
          {clamped >= 75 ? "Thriving" : clamped >= 50 ? "Steady" : "Warming up"}
        </div>
      </div>
    </div>
  );
};
