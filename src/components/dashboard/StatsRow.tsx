import { Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsRowProps {
  totalViews: number;
  totalClicks: number;
  clickRate: string;
  earnings: string;
  isPro?: boolean;
}

export const StatsRow = ({ totalViews, totalClicks, clickRate, earnings, isPro }: StatsRowProps) => {
  const stats = [
    {
      icon: Eye,
      value: totalViews.toLocaleString(),
      label: "Views",
    },
    {
      icon: MousePointer,
      value: totalClicks.toLocaleString(),
      label: "Clicks",
    },
    {
      icon: TrendingUp,
      value: clickRate,
      label: "Rate",
    },
    {
      icon: DollarSign,
      value: isPro ? earnings : "$0.00",
      label: "Earned",
    },
  ];

  return (
    <div className="w-full bg-secondary/50 rounded-xl p-3 sm:p-4">
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
            <span className="text-sm sm:text-base font-bold text-foreground">{stat.value}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
