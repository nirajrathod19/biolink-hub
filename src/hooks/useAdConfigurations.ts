import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AdPlacement = "top_banner" | "in_between" | "sticky_bottom";

export interface AdConfig {
  id: string;
  creator_id: string;
  placement: AdPlacement;
  is_enabled: boolean;
  ad_source_type: "custom" | "adsense";
  adsense_script: string | null;
  custom_banner_url: string | null;
  custom_target_url: string | null;
  custom_alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export const AD_PLACEMENTS: AdPlacement[] = ["top_banner", "in_between", "sticky_bottom"];

/** Creator: fetch all ad configs owned by the logged-in user */
export const useMyAdConfigs = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ad-configs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_configurations")
        .select("*")
        .eq("creator_id", user!.id);
      if (error) throw error;
      return (data ?? []) as AdConfig[];
    },
  });
};

/** Public: fetch a specific creator's ad config for one placement */
export const usePublicAdConfig = (creatorId?: string, placement?: AdPlacement) => {
  return useQuery({
    queryKey: ["public-ad-config", creatorId, placement],
    enabled: !!creatorId && !!placement,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_configurations")
        .select("*")
        .eq("creator_id", creatorId!)
        .eq("placement", placement!)
        .eq("is_enabled", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as AdConfig | null;
    },
  });
};

/** Upsert one placement config (creator_id enforced by RLS + auth.uid()) */
export const useUpsertAdConfig = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AdConfig> & { placement: AdPlacement }) => {
      if (!user?.id) throw new Error("Not signed in");
      const payload = {
        creator_id: user.id,
        placement: input.placement,
        is_enabled: input.is_enabled ?? false,
        ad_source_type: input.ad_source_type ?? "custom",
        adsense_script: input.adsense_script ?? null,
        custom_banner_url: input.custom_banner_url ?? null,
        custom_target_url: input.custom_target_url ?? null,
        custom_alt_text: input.custom_alt_text ?? null,
      };
      const { data, error } = await supabase
        .from("ad_configurations")
        .upsert(payload, { onConflict: "creator_id,placement" })
        .select()
        .single();
      if (error) throw error;
      return data as AdConfig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ad-configs", user?.id] }),
  });
};
