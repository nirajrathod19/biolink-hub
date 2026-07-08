import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DollarSign, Wallet, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAdRevenue } from "@/hooks/useAdRevenue";

const fmt = (n: number) => `$${(n || 0).toFixed(2)}`;

export const EarningsSummaryCard = () => {
  const { stats, isLoading } = useAdRevenue();

  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </GlassCard>
    );
  }

  const payable = stats.walletBalance;
  const payoutStatus =
    payable >= 3
      ? { label: "Ready to withdraw", tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" }
      : { label: `Min $3 to withdraw`, tone: "bg-amber-500/10 text-amber-600 border-amber-500/30" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Earnings snapshot</p>
              <p className="text-[11px] text-muted-foreground">
                {stats.revenueSharePct > 0
                  ? `${stats.revenueSharePct}% ad revenue share`
                  : "Upgrade to Pro to unlock ad revenue"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] ${payoutStatus.tone}`}>
            {payoutStatus.label}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" /> AdSense (est.)
            </div>
            <p className="text-base sm:text-lg font-bold text-primary">
              {fmt(stats.creatorEarnings)}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
              <Wallet className="w-3 h-3" /> Wallet
            </div>
            <p className="text-base sm:text-lg font-bold">{fmt(stats.walletBalance)}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
              <Clock className="w-3 h-3" /> Pending
            </div>
            <p className="text-base sm:text-lg font-bold">{fmt(stats.pendingRevenue)}</p>
          </div>
        </div>

        <Link
          to="/dashboard/wallet"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Manage payouts <ArrowUpRight className="w-3 h-3" />
        </Link>
      </GlassCard>
    </motion.div>
  );
};
