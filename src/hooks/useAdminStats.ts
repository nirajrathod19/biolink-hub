import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalClicks: number;
  proUsers: number;
}

export interface PendingWithdrawal {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  username?: string;
  is_flagged?: boolean;
  fraud_score?: number;
  fraud_flags?: Array<{
    code: string;
    message: string;
    severity: "low" | "medium" | "high";
  }>;
  payment_details?: Record<string, any>;
}

export interface RecentUser {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  is_pro: boolean;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get aggregated stats
      const { data: statsData } = await supabase
        .from("profiles")
        .select("wallet_balance, unique_clicks, is_pro");

      let totalRevenue = 0;
      let totalClicks = 0;
      let proUsers = 0;

      if (statsData) {
        statsData.forEach((profile) => {
          totalRevenue += Number(profile.wallet_balance) || 0;
          totalClicks += profile.unique_clicks || 0;
          if (profile.is_pro) proUsers++;
        });
      }

      return {
        totalUsers: totalUsers || 0,
        totalRevenue,
        totalClicks,
        proUsers,
      } as AdminStats;
    },
    staleTime: 1000 * 30, // Refresh every 30 seconds
  });
};

export const usePendingWithdrawals = () => {
  return useQuery({
    queryKey: ["pending-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select(`
          id,
          user_id,
          amount,
          payment_method,
          payment_details,
          status,
          created_at,
          is_flagged,
          fraud_score,
          fraud_flags
        `)
        .in("status", ["pending", "processing"])
        .order("is_flagged", { ascending: false }) // Show flagged first
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch usernames for each withdrawal
      const withdrawalsWithUsers = await Promise.all(
        (data || []).map(async (w) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("user_id", w.user_id)
            .single();
          
          return {
            ...w,
            username: profile?.username || "Unknown",
          };
        })
      );

      return withdrawalsWithUsers as PendingWithdrawal[];
    },
  });
};

export const useRecentUsers = () => {
  return useQuery({
    queryKey: ["recent-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, created_at, is_pro")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as RecentUser[];
    },
  });
};

export interface CreatorRevenue {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  wallet_balance: number;
  pending_revenue: number;
  total_clicks: number;
  unique_clicks: number;
  is_pro: boolean;
  created_at: string;
}

export const useCreatorRevenueList = () => {
  return useQuery({
    queryKey: ["creator-revenue-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          username,
          display_name,
          wallet_balance,
          pending_revenue,
          total_clicks,
          unique_clicks,
          is_pro,
          created_at
        `)
        .order("wallet_balance", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CreatorRevenue[];
    },
    staleTime: 1000 * 30, // Refresh every 30 seconds
  });
};