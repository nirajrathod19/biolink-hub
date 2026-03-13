import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Eye, Crown, Lock, Wallet, Clock, ArrowDownRight, Zap, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdRevenue } from "@/hooks/useAdRevenue";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export const AdRevenueCard = () => {
  const { stats, isLoading } = useAdRevenue();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not Pro - show upgrade prompt
  if (!stats.isPro) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Unlock Ad Revenue Sharing</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
              Upgrade to Pro to start earning from ad revenue on your page.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Starter Pro</p>
                <p className="font-bold text-primary">50%</p>
                <p className="text-xs text-muted-foreground">Revenue Share</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <p className="text-xs text-primary mb-1">Full Pro</p>
                <p className="font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground">Revenue Share</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{stats.totalImpressions.toLocaleString()} page views so far</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFullPro = stats.revenueSharePct === 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullPro ? "bg-primary/20" : "bg-primary/10"}`}>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Earnings</CardTitle>
              <CardDescription>
                Real-time revenue • {stats.revenueSharePct}% share
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={isFullPro ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}>
            <Crown className="w-3 h-3 mr-1" />
            {isFullPro ? "Full Pro" : "Starter Pro"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier Highlight */}
        {!isFullPro && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-primary">Upgrade to Full Pro</span> to keep 100% of your ad revenue instead of 50%.
            </p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Eye className="w-4 h-4" />
              Page Views
            </div>
            <p className="text-2xl font-bold">
              {stats.totalImpressions.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-2 text-primary text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Lifetime Earned
            </div>
            <p className="text-2xl font-bold text-primary">
              ${stats.creatorEarnings.toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Estimated Earnings */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-primary text-sm mb-1">
            <Shield className="w-4 h-4" />
            Estimated Revenue (Gross)
          </div>
          <p className="text-xl font-bold text-primary">
            ${stats.totalEstimatedRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You receive {stats.revenueSharePct}% = ${(stats.totalEstimatedRevenue * stats.revenueSharePct / 100).toFixed(2)}
          </p>
        </div>

        {/* Wallet Info */}
        <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Wallet Balance
            </span>
            <span className="font-medium">${stats.walletBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Pending Revenue
            </span>
            <span className="font-medium">${stats.pendingRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Ad Revenue Balance
            </span>
            <span className="font-medium">${stats.adsBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Total Withdrawn
            </span>
            <span className="font-medium">${stats.totalWithdrawn.toFixed(2)}</span>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          You earn {stats.revenueSharePct}% of ad revenue from each verified page view. Revenue is calculated daily with fraud protection.
          {stats.lastCalculatedAt && (
            <> Last updated: {new Date(stats.lastCalculatedAt).toLocaleString()}</>
          )}
        </p>
      </CardContent>
    </Card>
  );
};