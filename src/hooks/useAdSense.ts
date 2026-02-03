import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdSenseSettings {
  publisherId: string;
  enabled: boolean;
}

export const useAdSenseSettings = () => {
  return useQuery({
    queryKey: ["adsense-settings"],
    queryFn: async (): Promise<AdSenseSettings> => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["adsense_publisher_id", "adsense_enabled"]);

      if (error) {
        console.error("Error fetching AdSense settings:", error);
        return { publisherId: "", enabled: false };
      }

      const settings: AdSenseSettings = { publisherId: "", enabled: false };
      data?.forEach((row) => {
        if (row.setting_key === "adsense_publisher_id") {
          settings.publisherId = row.setting_value || "";
        }
        if (row.setting_key === "adsense_enabled") {
          settings.enabled = row.setting_value === "true";
        }
      });

      return settings;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateAdSenseSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AdSenseSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update publisher ID
      await supabase
        .from("admin_settings")
        .upsert({
          setting_key: "adsense_publisher_id",
          setting_value: settings.publisherId,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }, { onConflict: "setting_key" });

      // Update enabled status
      await supabase
        .from("admin_settings")
        .upsert({
          setting_key: "adsense_enabled",
          setting_value: settings.enabled ? "true" : "false",
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }, { onConflict: "setting_key" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adsense-settings"] });
    },
  });
};
