import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAllMonetizationApplications,
  useReviewMonetization,
  type MonetizationStatus,
} from "@/hooks/useMonetization";
import { format } from "date-fns";

const tone: Record<MonetizationStatus, string> = {
  NOT_ELIGIBLE: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-amber-500/15 text-amber-600",
  APPROVED: "bg-emerald-500/15 text-emerald-600",
  SUSPENDED: "bg-destructive/15 text-destructive",
  REJECTED: "bg-destructive/15 text-destructive",
};

export const AdminMonetizationTab = () => {
  const { data: applications = [], isLoading } = useAllMonetizationApplications();
  const review = useReviewMonetization();
  const [search, setSearch] = useState("");

  const filtered = applications.filter(
    (a) =>
      a.user_id.toLowerCase().includes(search.toLowerCase()) ||
      a.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Monetization
        </h1>
        <p className="text-muted-foreground text-sm">
          Approve creators for eligible ad revenue sharing
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user or status"
          className="pl-9"
        />
      </div>

      <GlassCard className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No monetization applications yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/40">
                  <th className="py-2 pr-3">Creator</th>
                  <th className="py-2 pr-3">Applied</th>
                  <th className="py-2 pr-3">Share</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border/20">
                    <td className="py-2 pr-3 font-mono text-xs">{a.user_id.slice(0, 8)}…</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {a.applied_at ? format(new Date(a.applied_at), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="py-2 pr-3">{a.revenue_share_pct}%</td>
                    <td className="py-2 pr-3">
                      <Badge variant="secondary" className={tone[a.status]}>
                        {a.status.replace("_", " ").toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-2 flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={review.isPending || a.status === "APPROVED"}
                        onClick={() => review.mutate({ id: a.id, status: "APPROVED" })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={review.isPending || a.status === "SUSPENDED"}
                        onClick={() => review.mutate({ id: a.id, status: "SUSPENDED" })}
                      >
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={review.isPending || a.status === "REJECTED"}
                        onClick={() => review.mutate({ id: a.id, status: "REJECTED" })}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
