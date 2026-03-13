import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme_color: string;
  template: string;
  is_pro: boolean;
  wallet_balance: number;
  pending_revenue: number;
  total_clicks: number;
  unique_clicks: number;
  referral_code: string | null;
  referred_by: string | null;
  interests: string[];
  ads_balance: number;
  total_withdrawn: number;
  is_verified: boolean;
  announcement_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription for profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
};

export const usePublicProfile = (username: string) => {
  return useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      // Use profiles_public view for unauthenticated access
      const { data, error } = await supabase
        .from("profiles_public")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return data as (Partial<Profile> & { is_verified?: boolean; announcement_text?: string | null }) | null;
    },
    enabled: !!username,
  });
};