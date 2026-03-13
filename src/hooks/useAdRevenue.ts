import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/hooks/useSubscription";

export interface AdRevenueStats {
  totalImpressions: number;
  totalEstimatedRevenue: number;
  creatorEarnings: number;
  pendingRevenue: number;
  walletBalance: number;
  adsBalance: number;
  totalWithdrawn: number;
  lastCalculatedAt: string | null;
  isRevenueShareEnabled: boolean;
  isPro: boolean;
  revenueSharePct: number;
}

export const useAdRevenue = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currentPriceId, isSubscribed } = useSubscription();

  // Determine revenue share % based on subscription tier
  // Starter Pro = 50%, Full Pro = 100%
  const { currentPlan } = useSubscription();
  const revenueSharePct = !isSubscribed ? 0 : (currentPlan === "full" ? 100 : 50);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["ad-revenue", user?.id],
    queryFn: async (): Promise<AdRevenueStats> => {
      if (!user?.id) {
        return {
          totalImpressions: 0,
          totalEstimatedRevenue: 0,
          creatorEarnings: 0,
          pendingRevenue: 0,
          walletBalance: 0,
          adsBalance: 0,
          totalWithdrawn: 0,
          lastCalculatedAt: null,
          isRevenueShareEnabled: false,
          isPro: false,
          revenueSharePct: 0,
        };
      }

      const [profileRes, settingsRes, earningsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("unique_clicks, is_pro, pending_revenue, wallet_balance, ads_balance, total_withdrawn")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("adsense_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("type", "earning"),
      ]);

      const profile = profileRes.data;
      const settings = settingsRes.data;
      const earnings = earningsRes.data;

      const totalEarnings = earnings?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalImpressions = settings?.total_impressions || profile?.unique_clicks || 0;
      const totalEstimatedRevenue = settings?.total_estimated_revenue || 0;
      const creatorEarnings = totalEarnings || settings?.creator_earnings || 0;

      return {
        totalImpressions,
        totalEstimatedRevenue,
        creatorEarnings,
        pendingRevenue: profile?.pending_revenue || 0,
        walletBalance: profile?.wallet_balance || 0,
        adsBalance: (profile as any)?.ads_balance || 0,
        totalWithdrawn: (profile as any)?.total_withdrawn || 0,
        lastCalculatedAt: settings?.last_calculated_at || null,
        isRevenueShareEnabled: settings?.is_revenue_sharing_enabled || false,
        isPro: profile?.is_pro || false,
        revenueSharePct,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("ad-revenue-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["ad-revenue", user.id] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "adsense_settings", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["ad-revenue", user.id] })
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["ad-revenue", user.id] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const enableRevenueSharing = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("adsense_settings")
        .upsert({ user_id: user.id, is_revenue_sharing_enabled: true }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ad-revenue"] }),
  });

  return {
    stats: stats || {
      totalImpressions: 0,
      totalEstimatedRevenue: 0,
      creatorEarnings: 0,
      pendingRevenue: 0,
      walletBalance: 0,
      adsBalance: 0,
      totalWithdrawn: 0,
      lastCalculatedAt: null,
      isRevenueShareEnabled: false,
      isPro: false,
      revenueSharePct: 0,
    },
    isLoading,
    enableRevenueSharing,
  };
};