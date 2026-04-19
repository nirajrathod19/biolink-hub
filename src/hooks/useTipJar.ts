import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TipJar {
  id: string;
  user_id: string;
  is_enabled: boolean;
  paypal_email: string | null;
  venmo_username: string | null;
  cashapp_tag: string | null;
  razorpay_enabled: boolean;
  minimum_amount: number;
  suggested_amounts: number[];
  message: string;
  created_at: string;
  updated_at: string;
}

export const useTipJar = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tip-jar", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("tip_jar")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Parse suggested_amounts from JSON if needed
      if (data && typeof data.suggested_amounts === 'string') {
        data.suggested_amounts = JSON.parse(data.suggested_amounts);
      }
      
      return data as TipJar | null;
    },
    enabled: !!user,
  });
};

export const usePublicTipJar = (userId: string) => {
  return useQuery({
    queryKey: ["public-tip-jar", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tip_jar")
        .select("*")
        .eq("user_id", userId)
        .eq("is_enabled", true)
        .maybeSingle();

      if (error) throw error;
      
      if (data && typeof data.suggested_amounts === 'string') {
        data.suggested_amounts = JSON.parse(data.suggested_amounts);
      }
      
      return data as TipJar | null;
    },
    enabled: !!userId,
  });
};

export const useCreateOrUpdateTipJar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tipJar: Partial<Omit<TipJar, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!user) throw new Error("Not authenticated");

      // Check if tip jar exists
      const { data: existing } = await supabase
        .from("tip_jar")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("tip_jar")
          .update(tipJar)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("tip_jar")
          .insert({
            ...tipJar,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-jar", user?.id] });
    },
  });
};
