import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AnalyticsSettings {
  id: string;
  user_id: string;
  ga_measurement_id: string | null;
  meta_pixel_id: string | null;
  is_ga_enabled: boolean;
  is_meta_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useAnalyticsSettings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("analytics_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AnalyticsSettings | null;
    },
    enabled: !!user,
  });
};

export const useUpdateAnalyticsSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<AnalyticsSettings, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!user) throw new Error("Not authenticated");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("analytics_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("analytics_settings")
          .update(settings)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("analytics_settings")
          .insert({
            ...settings,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-settings", user?.id] });
    },
  });
};
