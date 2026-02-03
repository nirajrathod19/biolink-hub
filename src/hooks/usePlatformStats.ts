import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalCreators: number;
  totalClicks: number;
  totalVisitors: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K+`;
  }
  return `${num}+`;
};

const formatCurrency = (num: number): string => {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K+`;
  }
  return `$${num.toFixed(0)}+`;
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Fetch total creators (profiles count) - using public view for security
      const { count: creatorsCount, error: creatorsError } = await supabase
        .from("profiles_public" as any)
        .select("*", { count: "exact", head: true });

      if (creatorsError) throw creatorsError;

      // Fetch total clicks from click_logs
      const { count: clicksCount, error: clicksError } = await supabase
        .from("click_logs")
        .select("*", { count: "exact", head: true });

      if (clicksError) throw clicksError;

      // Fetch total unique visitors from click_logs
      const { count: visitorsCount, error: visitorsError } = await supabase
        .from("click_logs")
        .select("*", { count: "exact", head: true })
        .eq("is_unique", true);

      if (visitorsError) throw visitorsError;

      return {
        totalCreators: creatorsCount || 0,
        totalClicks: clicksCount || 0,
        totalVisitors: visitorsCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute for "real-time" feel
  });
};

export const useFormattedPlatformStats = () => {
  const { data, isLoading, error } = usePlatformStats();

  return {
    stats: data
      ? [
          { value: formatNumber(data.totalCreators), label: "Creators" },
          { value: formatNumber(data.totalClicks), label: "Links Clicked" },
          { value: formatNumber(data.totalVisitors), label: "Visitors" },
        ]
      : null,
    isLoading,
    error,
  };
};
