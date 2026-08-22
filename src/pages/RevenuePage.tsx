import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Wallet as WalletIcon,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { useCreatorRevenue, type RevenueSource } from "@/hooks/useCreatorRevenue";
import { useMonetizationStatus, useApplyForMonetization } from "@/hooks/useMonetization";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";

const money = (n: number) => `$${(n || 0).toFixed(2)}`;

const sourceLabels: Record<RevenueSource, string> = {
  ADS: "Ad revenue",
  PRODUCT: "Product sales",
  TIP: "Tips",
  AFFILIATE: "Affiliate",
  OTHER: "Other",
};

const statusTone: Record<string, string> = {
  ESTIMATED: "bg-muted text-muted-foreground",
  PENDING: "bg-amber-500/15 text-amber-600",
  CONFIRMED: "bg-primary/15 text-primary",
  AVAILABLE: "bg-emerald-500/15 text-emerald-600",
  PAID: "bg-emerald-500/15 text-emerald-600",
  REVERSED: "bg-destructive/15 text-destructive",
};

const MonetizationBanner = () => {
  const { data: profile } = useProfile();
  const { data: monetization, isLoading } = useMonetizationStatus();
  const apply = useApplyForMonetization();

  if (isLoading) return null;

  const status = monetization?.status ?? "NOT_ELIGIBLE";
  const isPro = !!profile?.is_pro;

  if (status === "APPROVED") {
    return (
      <GlassCard className="p-4 flex items-center gap-3 border-emerald-500/30">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-sm">Monetization approved</p>
          <p className="text-xs text-muted-foreground">
            You receive {monetization?.revenue_share_pct ?? 50}% of eligible net advertising
            revenue from your bio page. Amounts vary and are never guaranteed.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-sm">
          {status === "PENDING_REVIEW"
            ? "Application under review"
            : status === "SUSPENDED"
            ? "Monetization suspended"
            : status === "REJECTED"
            ? "Application rejected"
            : "Ad revenue sharing not enabled"}
        </p>
        <p className="text-xs text-muted-foreground">
          {status === "PENDING_REVIEW"
            ? "We're reviewing your profile. You'll be notified once a decision is made."
            : status === "SUSPENDED" || status === "REJECTED"
            ? monetization?.review_notes || "Contact support for more details."
            : isPro
            ? "Apply to earn a share of eligible net advertising revenue from your bio page."
            : "Upgrade to Pro to become eligible for advertising revenue sharing."}
        </p>
      </div>
      {status === "NOT_ELIGIBLE" && isPro && (
        <GradientButton size="sm" onClick={() => apply.mutate()} disabled={apply.isPending}>
          Apply now
        </GradientButton>
      )}
    </GlassCard>
  );
};

const RevenuePage = () => {
  const { data, isLoading } = useCreatorRevenue();
  const summary = data?.summary;
  const entries = data?.entries ?? [];

  const stats = [
    { label: "Lifetime earnings", value: money(summary?.lifetime ?? 0), icon: DollarSign },
    { label: "This month", value: money(summary?.thisMonth ?? 0), icon: TrendingUp },
    { label: "Pending", value: money(summary?.pending ?? 0), icon: Clock },
    { label: "Available", value: money(summary?.available ?? 0), icon: WalletIcon },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Revenue</h1>
          <p className="text-sm text-muted-foreground">
            Every figure below is calculated server-side from your revenue ledger.
          </p>
        </div>

        <MonetizationBanner />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-4">
                <s.icon className="w-4 h-4 text-primary mb-2" />
                <p className="text-xl font-bold">{isLoading ? "—" : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <PayoutCta available={summary?.available ?? 0} />



        <GlassCard className="p-4">
          <h2 className="font-semibold text-sm mb-3">Earnings over time</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.byDay ?? []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => money(v)}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {(Object.keys(sourceLabels) as RevenueSource[]).map((src) => (
            <GlassCard key={src} className="p-4">
              <p className="text-xs text-muted-foreground">{sourceLabels[src]}</p>
              <p className="text-lg font-bold">{money(summary?.bySource[src] ?? 0)}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-4">
          <h2 className="font-semibold text-sm mb-3">Revenue ledger</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No revenue entries yet. Earnings appear here once your page starts generating
              revenue.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border/40">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3 text-right">Gross</th>
                    <th className="py-2 pr-3 text-right">Eligible</th>
                    <th className="py-2 pr-3 text-right">Your share</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-b border-border/20">
                      <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                        {format(new Date(e.created_at), "dd MMM yyyy")}
                      </td>
                      <td className="py-2 pr-3">{sourceLabels[e.source]}</td>
                      <td className="py-2 pr-3 text-right">{money(Number(e.gross_amount))}</td>
                      <td className="py-2 pr-3 text-right">{money(Number(e.eligible_amount))}</td>
                      <td className="py-2 pr-3 text-right font-medium">
                        {money(Number(e.creator_share))}
                      </td>
                      <td className="py-2">
                        <Badge variant="secondary" className={statusTone[e.status]}>
                          {e.status.toLowerCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <p className="text-[11px] text-muted-foreground">
          Advertising revenue varies with traffic, geography and advertiser demand. Estimated
          amounts are not guaranteed and may be adjusted for invalid traffic, refunds or network
          deductions before becoming available for withdrawal.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default RevenuePage;
