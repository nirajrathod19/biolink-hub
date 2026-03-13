import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Referral {
  id: string;
  referred_id: string;
  level: number;
  commission_earned: number;
  created_at: string;
  referred_username: string | null;
}

export const useReferrals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async (): Promise<Referral[]> => {
      if (!user) return [];

      const { data: referrals, error } = await supabase
        .from("referrals")
        .select("id, referred_id, level, commission_earned, created_at")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!referrals || referrals.length === 0) return [];

      // Fetch usernames for referred users
      const referredIds = referrals.map((r) => r.referred_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", referredIds);

      const usernameMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.username])
      );

      return referrals.map((r) => ({
        ...r,
        referred_username: usernameMap.get(r.referred_id) || null,
      }));
    },
    enabled: !!user,
  });
};
