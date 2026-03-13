import { Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LiveIndicator } from "@/components/ui/LiveIndicator";

interface StatsRowProps {
  totalViews: number;
  totalClicks: number;
  clickRate: string;
  earnings: string;
  isPro?: boolean;
  isLive?: boolean;
}

export const StatsRow = ({ totalViews, totalClicks, clickRate, earnings, isPro, isLive = false }: StatsRowProps) => {
  const earningsNum = parseFloat(earnings.replace(/[^0-9.]/g, "")) || 0;

  const stats = [
    {
      icon: Eye,
      value: totalViews,
      label: "Views",
      format: (v: number) => Math.round(v).toLocaleString(),
    },
    {
      icon: MousePointer,
      value: totalClicks,
      label: "Clicks",
      format: (v: number) => Math.round(v).toLocaleString(),
    },
    {
      icon: TrendingUp,
      value: null as number | null,
      displayValue: clickRate,
      label: "Rate",
      format: undefined,
    },
    {
      icon: DollarSign,
      value: isPro ? earningsNum : 0,
      label: "Earned",
      format: (v: number) => `$${v.toFixed(2)}`,
    },
  ];

  return (
    <div className="w-full bg-secondary/50 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">Performance</span>
        <LiveIndicator isConnected={isLive} />
      </div>
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className={cn(
              "flex flex-col items-center flex-1 py-2",
              index < stats.length - 1 && "border-r border-border/50"
            )}
          >
            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
            {stat.value !== null && stat.format ? (
              <AnimatedCounter
                value={stat.value}
                formatFn={stat.format}
                className="text-sm sm:text-base font-bold text-foreground"
              />
            ) : (
              <span className="text-sm sm:text-base font-bold text-foreground">{stat.displayValue}</span>
            )}
            <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
