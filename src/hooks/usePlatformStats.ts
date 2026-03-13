import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalCreators: number;
  totalClicks: number;
  totalVisitors: number;
}

// Improved formatter to ALWAYS add "+" at the end
const formatNumber = (num: number): string => {
  if (!num) return "0"; // 0 par sirf 0 dikhega
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`;
  }
  return `${num}+`; // YAHAN CHANGE KIYA HAI: Ab har chhote number par bhi + aayega
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      let totalCreators = 0;
      let totalClicks = 0;
      let totalVisitors = 0;

      // 1. Fetch total creators safely
      try {
        const { count, error } = await supabase
          .from("profiles_public" as any)
          .select("*", { count: "exact", head: true });
          
        if (error) throw error;
        totalCreators = count || 0;
      } catch (err) {
        console.error("Supabase Error (Creators):", err);
      }

      // 2. Fetch total clicks safely
      try {
        const { count, error } = await supabase
          .from("click_logs")
          .select("*", { count: "exact", head: true });
          
        if (error) throw error;
        totalClicks = count || 0;
      } catch (err) {
        console.error("Supabase Error (Clicks):", err);
      }

      // 3. Fetch total unique visitors safely
      try {
        const { count, error } = await supabase
          .from("click_logs")
          .select("*", { count: "exact", head: true })
          .eq("is_unique", true);
          
        if (error) throw error;
        totalVisitors = count || 0;
      } catch (err) {
        console.error("Supabase Error (Visitors):", err);
      }

      // Even if one fails, the others will still return their counts!
      return {
        totalCreators,
        totalClicks,
        totalVisitors,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute for real-time feel
  });
};

export const useFormattedPlatformStats = () => {
  const { data, isLoading, error } = usePlatformStats();

  return {
    stats: data
      ? [
          { value: formatNumber(data.totalCreators), label: "Active Creators" },
          { value: formatNumber(data.totalVisitors), label: "Profile Views" },
          { value: formatNumber(data.totalClicks), label: "Links Clicked" },
        ]
      : null,
    isLoading,
    error,
  };
};