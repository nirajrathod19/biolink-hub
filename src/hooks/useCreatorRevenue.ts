import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type RevenueSource = "ADS" | "PRODUCT" | "TIP" | "AFFILIATE" | "OTHER";
export type RevenueStatus =
  | "ESTIMATED"
  | "PENDING"
  | "CONFIRMED"
  | "AVAILABLE"
  | "PAID"
  | "REVERSED";

export interface RevenueEntry {
  id: string;
  creator_id: string;
  source: RevenueSource;
  gross_amount: number;
  deductions: number;
  eligible_amount: number;
  creator_share: number;
  platform_share: number;
  currency: string;
  period: string | null;
  status: RevenueStatus;
  reference_id: string | null;
  created_at: string;
}

export interface RevenueSummary {
  lifetime: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  available: number;
  bySource: Record<RevenueSource, number>;
  byDay: { date: string; amount: number }[];
}

const emptySources: Record<RevenueSource, number> = {
  ADS: 0,
  PRODUCT: 0,
  TIP: 0,
  AFFILIATE: 0,
  OTHER: 0,
};

export const useCreatorRevenue = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["creator-revenue", user?.id],
    queryFn: async () => {
      if (!user) return { entries: [] as RevenueEntry[], summary: null };

      const { data, error } = await supabase
        .from("creator_revenue")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      const entries = (data || []) as RevenueEntry[];
      const now = new Date();
      const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
      const thisKey = monthKey(now);
      const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

      const summary: RevenueSummary = {
        lifetime: 0,
        thisMonth: 0,
        lastMonth: 0,
        pending: 0,
        available: 0,
        bySource: { ...emptySources },
        byDay: [],
      };

      const dayMap = new Map<string, number>();

      for (const e of entries) {
        const share = Number(e.creator_share) || 0;
        const signed = e.status === "REVERSED" ? -share : share;
        if (e.status !== "REVERSED") summary.lifetime += share;
        else summary.lifetime -= share;

        summary.bySource[e.source] = (summary.bySource[e.source] || 0) + signed;

        if (e.status === "ESTIMATED" || e.status === "PENDING") summary.pending += share;
        if (e.status === "AVAILABLE" || e.status === "CONFIRMED") summary.available += share;

        const created = new Date(e.created_at);
        const k = monthKey(created);
        if (k === thisKey) summary.thisMonth += signed;
        if (k === lastKey) summary.lastMonth += signed;

        const day = created.toISOString().slice(0, 10);
        dayMap.set(day, (dayMap.get(day) || 0) + signed);
      }

      summary.byDay = Array.from(dayMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      return { entries, summary };
    },
    enabled: !!user,
  });
};
