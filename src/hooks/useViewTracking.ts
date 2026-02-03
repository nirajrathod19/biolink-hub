import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

// Track a profile view via edge function (proper IP-based unique detection)
export const useTrackProfileView = (profileId: string | undefined) => {
  const hasTracked = useRef(false);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("track-view", {
        body: { profile_id: id },
      });

      if (error) throw error;
      return data as {
        success: boolean;
        total_clicks: number;
        unique_clicks: number;
        is_unique: boolean;
        pro_unlocked: boolean;
      };
    },
  });

  // Auto-track on mount (only once per page load)
  useEffect(() => {
    if (profileId && !hasTracked.current) {
      hasTracked.current = true;
      mutation.mutate(profileId);
    }
  }, [profileId]);

  return mutation;
};

// Track ad click
export const useTrackAdClick = () => {
  return useMutation({
    mutationFn: async (adId: string) => {
      const { data: ad, error: fetchError } = await supabase
        .from("ads")
        .select("click_count")
        .eq("id", adId)
        .single();

      if (fetchError) throw fetchError;

      const newCount = (ad?.click_count || 0) + 1;

      const { error: updateError } = await supabase
        .from("ads")
        .update({ click_count: newCount })
        .eq("id", adId);

      if (updateError) throw updateError;

      return newCount;
    },
  });
};
