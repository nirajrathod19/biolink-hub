import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Sets up Supabase Realtime subscriptions for analytics-related tables
 * and invalidates the corresponding React Query caches on changes.
 * Returns `isConnected` so the UI can show a live indicator.
 */
export const useRealtimeAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`analytics-realtime-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "click_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          queryClient.invalidateQueries({ queryKey: ["links", user.id] });
          queryClient.invalidateQueries({ queryKey: ["enhanced-analytics", user.id] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "links" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["links", user.id] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          queryClient.invalidateQueries({ queryKey: ["ad-revenue", user.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          queryClient.invalidateQueries({ queryKey: ["ad-revenue", user.id] });
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [user, queryClient]);

  return { isConnected };
};
