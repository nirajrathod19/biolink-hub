import { motion } from "framer-motion";
import { Users, DollarSign, Eye, TrendingUp, Clock, CheckCircle, ShieldAlert, AlertTriangle, X, Wallet } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAdminStats, usePendingWithdrawals, useRecentUsers } from "@/hooks/useAdminStats";
import { useProcessWithdrawal } from "@/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export const AdminOverviewTab = () => {
  const { isConnected } = useAdminRealtime();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = usePendingWithdrawals();
  const { data: recentUsers = [], isLoading: usersLoading } = useRecentUsers();
  const processWithdrawal = useProcessWithdrawal();

  const { data: globalRevenue } = useQuery({
    queryKey: ["admin-global-revenue"],
    queryFn: async () => {
      const [earningsRes, profilesRes] = await Promise.all([
        supabase.from("ad_earnings_logs").select("gross_revenue, creator_share, platform_share"),
        supabase.from("profiles").select("wallet_balance, ads_balance, total_withdrawn, pending_revenue, is_pro"),
      ]);
      const totalGross = earningsRes.data?.reduce((s, r) => s + (r.gross_revenue || 0), 0) || 0;
      const totalCreatorShare = earningsRes.data?.reduce((s, r) => s + (r.creator_share || 0), 0) || 0;
      const totalPlatformShare = earningsRes.data?.reduce((s, r) => s + (r.platform_share || 0), 0) || 0;
      const totalPayouts = profilesRes.data?.reduce((s, r) => s + (r.total_withdrawn || 0), 0) || 0;
      const totalWalletBalance = profilesRes.data?.reduce((s, r) => s + (r.wallet_balance || 0), 0) || 0;
      const totalAdsBalance = profilesRes.data?.reduce((s, r) => s + (r.ads_balance || 0), 0) || 0;
      const totalPending = profilesRes.data?.reduce((s, r) => s + (r.pending_revenue || 0), 0) || 0;
      return { totalGross, totalCreatorShare, totalPlatformShare, totalPayouts, totalWalletBalance, totalAdsBalance, totalPending, proCreators: profilesRes.data?.filter(p => p.is_pro)?.length || 0 };
    },
    staleTime: 1000 * 30,
  });

  const { data: todayRevenue } = useQuery({
    queryKey: ["admin-today-revenue"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("ad_earnings_logs")
        .select("gross_revenue")
        .gte("date", today);
      return data?.reduce((s, r) => s + (r.gross_revenue || 0), 0) || 0;
    },
    staleTime: 1000 * 30,
  });

  const statsData = [
    { label: "Total Creators", value: stats?.totalUsers || 0, prefix: "", sub: "Active creators", icon: Users, color: "text-blue-400" },
    { label: "Today's Revenue", value: todayRevenue || 0, prefix: "$", sub: "Gross earnings today", icon: DollarSign, color: "text-emerald-400" },
    { label: "Active Pro Users", value: stats?.proUsers || 0, prefix: "", sub: "Monetized", icon: TrendingUp, color: "text-amber-400" },
    { label: "Total Payouts", value: globalRevenue?.totalPayouts || 0, prefix: "$", sub: "All time", icon: Eye, color: "text-purple-400" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Command Center</h1>
          <p className="text-muted-foreground text-sm">Platform overview at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && <LiveIndicator isConnected={isConnected} />}
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Stats with animated counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className="text-2xl font-display font-bold">
                {statsLoading ? "..." : (
                  <>
                    {stat.prefix}
                    <AnimatedCounter
                      value={typeof stat.value === "number" ? stat.value : 0}
                      formatFn={stat.prefix === "$" ? (v) => v.toFixed(2) : (v) => Math.round(v).toLocaleString()}
                    />
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenue Overview
            </h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {globalRevenue?.proCreators || 0} Pro Creators
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Gross Revenue", value: globalRevenue?.totalGross || 0, accent: false },
              { label: "Creator Share", value: globalRevenue?.totalCreatorShare || 0, accent: true },
              { label: "Platform Share", value: globalRevenue?.totalPlatformShare || 0, accent: false },
              { label: "Total Withdrawn", value: globalRevenue?.totalPayouts || 0, accent: false },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-lg text-center ${item.accent ? "bg-primary/5 border border-primary/20" : "bg-muted/30 border border-border/40"}`}>
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.accent ? "text-primary" : ""}`}>
                  $<AnimatedCounter value={item.value} formatFn={(v) => v.toFixed(2)} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Master AdSense Wallet */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Master AdSense Wallet
            </h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              All Users
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Ad Earnings", value: globalRevenue?.totalAdsBalance || 0, accent: true },
              { label: "Wallet Balances", value: globalRevenue?.totalWalletBalance || 0, accent: false },
              { label: "Pending Revenue", value: globalRevenue?.totalPending || 0, accent: false },
              { label: "Total Withdrawn", value: globalRevenue?.totalPayouts || 0, accent: false },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-lg text-center ${item.accent ? "bg-primary/10 border border-primary/20" : "bg-muted/30 border border-border/40"}`}>
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.accent ? "text-primary" : ""}`}>
                  $<AnimatedCounter value={item.value} formatFn={(v) => v.toFixed(2)} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Withdrawals */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              Withdrawal Requests
            </h3>
            <motion.span
              key={withdrawals.length}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
            >
              {withdrawals.length} active
            </motion.span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {withdrawalsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No withdrawal requests</p>
            ) : (
              withdrawals.slice(0, 4).map((w) => (
                <motion.div
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg ${w.is_flagged ? "bg-destructive/5 border border-destructive/20" : "bg-muted/20 border border-border/30"}`}
                >
                  {w.is_flagged && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive mb-2">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Fraud Score: {w.fraud_score}/100</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1">
                        @{w.username}
                        {w.is_flagged && <AlertTriangle className="w-3 h-3 text-destructive" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{w.payment_method.replace("_", " ")} • {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}</p>
                    </div>
                    <span className="font-semibold text-lg">${w.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "reject" })} disabled={processWithdrawal.isPending}>
                      <X className="w-3 h-3 mr-1" /> Reject
                    </Button>
                    <GradientButton size="sm" className="flex-1 text-xs" onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "approve" })} disabled={processWithdrawal.isPending}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve
                    </GradientButton>
                  </div>
                </motion.div>
              ))
            )}
            {withdrawals.length > 4 && (
              <Link to="/admin/payouts" className="text-xs text-primary hover:underline text-center block pt-1">View all {withdrawals.length} requests →</Link>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              Recent Signups
            </h3>
            <Link to="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {usersLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No users yet</p>
            ) : (
              recentUsers.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">@{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.display_name || "No display name"} • {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</p>
                  </div>
                  <Badge variant={u.is_pro ? "default" : "secondary"} className="text-xs">{u.is_pro ? "Pro" : "Free"}</Badge>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};