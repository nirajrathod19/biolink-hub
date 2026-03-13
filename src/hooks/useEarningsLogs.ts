import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useEarningsLogs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["earnings-logs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("ad_earnings_logs")
        .select("date, creator_share, gross_revenue")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(60);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};