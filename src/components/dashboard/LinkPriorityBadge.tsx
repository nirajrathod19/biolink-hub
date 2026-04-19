import { Flame, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LinkPriorityBadgeProps {
  clicks: number;
  maxClicks: number;
  totalClicks: number;
}

/**
 * Heuristic: classify a link by share of total dashboard clicks.
 * - Top: 40%+ share OR is the absolute max
 * - Hot: 20%+ share
 * - Active: any clicks
 * - (none returned for 0 clicks)
 */
export const LinkPriorityBadge = ({ clicks, maxClicks, totalClicks }: LinkPriorityBadgeProps) => {
  if (!clicks || clicks <= 0 || totalClicks <= 0) return null;
  const share = clicks / totalClicks;
  const isMax = clicks === maxClicks && maxClicks > 0;

  if (share >= 0.4 || isMax) {
    return (
      <Badge className="text-[10px] bg-orange-500/15 text-orange-600 border border-orange-500/30 gap-1">
        <Flame className="w-3 h-3" /> Top performer
      </Badge>
    );
  }
  if (share >= 0.2) {
    return (
      <Badge className="text-[10px] bg-pink-500/15 text-pink-600 border border-pink-500/30 gap-1">
        <TrendingUp className="w-3 h-3" /> Hot
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
      <Activity className="w-3 h-3" /> Active
    </Badge>
  );
};
