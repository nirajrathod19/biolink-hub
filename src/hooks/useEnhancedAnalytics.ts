import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GeoData {
  country: string;
  count: number;
  percentage: number;
}

export interface DeviceData {
  device_type: string;
  count: number;
  percentage: number;
}

export interface ReferrerData {
  referer: string;
  count: number;
  percentage: number;
}

export interface ClickLogEnhanced {
  id: string;
  profile_id: string;
  link_id: string | null;
  visitor_ip: string | null;
  user_agent: string | null;
  referer: string | null;
  country: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  city: string | null;
  is_unique: boolean;
  created_at: string;
}

export const useEnhancedAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enhanced-analytics", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get profile to get profile_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return null;

      // Fetch click logs for this profile
      const { data: clickLogs, error } = await supabase
        .from("click_logs")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Process geographic data
      const countryMap = new Map<string, number>();
      const deviceMap = new Map<string, number>();
      const referrerMap = new Map<string, number>();

      clickLogs?.forEach((log: ClickLogEnhanced) => {
        // Country
        const country = log.country || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);

        // Device
        const device = log.device_type || 'Unknown';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

        // Referrer
        let referrer = 'Direct';
        if (log.referer) {
          try {
            const url = new URL(log.referer);
            referrer = url.hostname.replace('www.', '');
          } catch {
            referrer = log.referer;
          }
        }
        referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
      });

      const total = clickLogs?.length || 1;

      const geoData: GeoData[] = Array.from(countryMap.entries())
        .map(([country, count]) => ({
          country,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const deviceData: DeviceData[] = Array.from(deviceMap.entries())
        .map(([device_type, count]) => ({
          device_type,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      const referrerData: ReferrerData[] = Array.from(referrerMap.entries())
        .map(([referer, count]) => ({
          referer,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        geoData,
        deviceData,
        referrerData,
        totalClicks: total,
        clickLogs: clickLogs || [],
      };
    },
    enabled: !!user,
  });
};

export const useAffiliateClicks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["affiliate-clicks", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("affiliate_clicks")
        .select("*, links(title, url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
