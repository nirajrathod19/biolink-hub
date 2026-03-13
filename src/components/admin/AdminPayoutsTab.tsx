import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Clock, RefreshCw, TrendingUp, CheckCircle, X, ShieldAlert, AlertTriangle, Loader2, Users } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePendingWithdrawals, useCreatorRevenueList } from "@/hooks/useAdminStats";
import { useProcessWithdrawal, useMovePendingToWallet } from "@/hooks/useWallet";
import { formatDistanceToNow } from "date-fns";

export const AdminPayoutsTab = () => {
  const { toast } = useToast();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = usePendingWithdrawals();
  const { data: creatorRevenues = [], isLoading: revenueLoading } = useCreatorRevenueList();
  const processWithdrawal = useProcessWithdrawal();
  const movePending = useMovePendingToWallet();

  // Manual revenue entry
  const [manualUsername, setManualUsername] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const handleManualEntry = async () => {
    setManualLoading(true);
    try {
      const gross = parseFloat(manualAmount);
      const { data, error } = await supabase.functions.invoke("sync-adsense-revenue", {
        body: { mode: "manual", entries: [{ username: manualUsername.trim(), gross_revenue: gross, description: manualDescription || "Manual entry" }] },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Revenue Added", description: `$${gross.toFixed(2)} credited to @${manualUsername}` });
      setManualUsername(""); setManualAmount(""); setManualDescription("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Payouts & Finance
        </h1>
        <p className="text-muted-foreground text-sm">Manage withdrawals, revenue processing, and creator earnings</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2"><RefreshCw className="w-4 h-4 text-primary" /> Process Pending</h4>
          <p className="text-xs text-muted-foreground mb-3">Transfer pending revenue to wallets</p>
          <GradientButton size="sm" className="w-full" onClick={() => movePending.mutate()} disabled={movePending.isPending}>
            {movePending.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process Revenue"}
          </GradientButton>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-primary" /> AdSense Sync</h4>
          <p className="text-xs text-muted-foreground mb-3">Fetch & distribute AdSense earnings</p>
          <GradientButton size="sm" className="w-full" onClick={async () => {
            try {
              const { data, error } = await supabase.functions.invoke("sync-adsense-revenue", { body: { mode: "auto" } });
              if (error) throw error;
              toast({ title: "Sync Complete", description: `Processed ${data.processed} creators` });
            } catch (err: any) {
              toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
            }
          }}>
            Sync Revenue
          </GradientButton>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-primary" /> Tier Calculation</h4>
          <p className="text-xs text-muted-foreground mb-3">Starter=50/50, Full=100% creator</p>
          <GradientButton size="sm" className="w-full" onClick={async () => {
            try {
              const { data, error } = await supabase.functions.invoke("calculate-ad-revenue", {});
              if (error) throw error;
              toast({ title: "Calculated", description: `Creator: $${data.total_creator_share?.toFixed(2)}, Platform: $${data.total_platform_share?.toFixed(2)}` });
            } catch (err: any) {
              toast({ title: "Failed", description: err.message, variant: "destructive" });
            }
          }}>
            Run Calculation
          </GradientButton>
        </div>
      </div>

      {/* Manual Revenue Entry */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-5 mb-6">
        <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-primary" /> Manual Revenue Entry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div><Label className="text-xs">Username</Label><Input value={manualUsername} onChange={e => setManualUsername(e.target.value)} placeholder="johndoe" className="mt-1 bg-card/50" /></div>
          <div><Label className="text-xs">Amount ($)</Label><Input type="number" step="0.01" value={manualAmount} onChange={e => setManualAmount(e.target.value)} placeholder="10.00" className="mt-1 bg-card/50" /></div>
          <div><Label className="text-xs">Description</Label><Input value={manualDescription} onChange={e => setManualDescription(e.target.value)} placeholder="Jan 2026 AdSense" className="mt-1 bg-card/50" /></div>
        </div>
        <GradientButton size="sm" onClick={handleManualEntry} disabled={manualLoading || !manualUsername.trim() || !manualAmount || parseFloat(manualAmount) <= 0}>
          {manualLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <DollarSign className="w-4 h-4 mr-1" />} Add Entry
        </GradientButton>
      </div>

      {/* Withdrawal Requests */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> All Withdrawal Requests</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{withdrawals.length} pending</span>
        </div>
        <div className="space-y-3">
          {withdrawalsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No requests</p>
          ) : (
             withdrawals.map((w) => {
              const details = (w.payment_details || {}) as Record<string, any>;
              const contactInfo = w.payment_method === "upi"
                ? `UPI: ${details.upi_id || "—"}`
                : `Bank: ${details.account_holder || "—"} / ${details.account_number || "—"} / IFSC: ${details.ifsc_code || "—"}`;

              return (
              <div key={w.id} className={`p-4 rounded-lg ${w.is_flagged ? "bg-destructive/5 border border-destructive/20" : "bg-muted/15 border border-border/30"}`}>
                {w.is_flagged && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive mb-2"><ShieldAlert className="w-3 h-3" /> Fraud Score: {w.fraud_score}/100</div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium flex items-center gap-1.5">@{w.username} {w.is_flagged && <AlertTriangle className="w-3 h-3 text-destructive" />}</p>
                    <p className="text-xs text-muted-foreground">{w.payment_method === "upi" ? "UPI" : "Bank Transfer"} • {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{contactInfo}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-xl">${w.amount.toFixed(2)}</span>
                    <Badge variant="outline" className="block mt-1 text-xs">{w.status === "processing" ? "Processing" : "Pending"}</Badge>
                  </div>
                </div>
                {w.fraud_flags && w.fraud_flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {w.fraud_flags.map((flag: any, idx: number) => (
                      <span key={idx} className={`text-xs px-2 py-0.5 rounded-full ${flag.severity === "high" ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"}`}>{flag.code.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "reject" })} disabled={processWithdrawal.isPending}>
                    <X className="w-3 h-3 mr-1" /> Reject
                  </Button>
                  <GradientButton size="sm" className="flex-1" onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "approve" })} disabled={processWithdrawal.isPending}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Mark as Paid
                  </GradientButton>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

      {/* Creator Revenue Table */}
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <div className="p-5 border-b border-border/30">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Creator Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creator</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Wallet</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Pending</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Clicks</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
              </tr>
            </thead>
            <tbody>
              {revenueLoading ? (
                <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : creatorRevenues.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No data</td></tr>
              ) : (
                creatorRevenues.map((c) => (
                  <tr key={c.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-xs font-semibold text-primary-foreground">{c.username?.charAt(0).toUpperCase()}</div>
                        <div><p className="font-medium text-sm">@{c.username}</p><p className="text-xs text-muted-foreground hidden sm:block">{c.display_name || "—"}</p></div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-mono font-semibold text-primary">${(c.wallet_balance || 0).toFixed(2)}</td>
                    <td className="text-right py-3 px-4 hidden sm:table-cell text-muted-foreground">${(c.pending_revenue || 0).toFixed(2)}</td>
                    <td className="text-right py-3 px-4 hidden md:table-cell">{(c.unique_clicks || 0).toLocaleString()}</td>
                    <td className="text-center py-3 px-4"><Badge variant={c.is_pro ? "default" : "secondary"} className="text-xs">{c.is_pro ? "Pro" : "Free"}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};