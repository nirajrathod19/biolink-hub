import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin-specific realtime subscriptions for activity_logs, withdrawals,
 * profiles, and ad_earnings_logs. Invalidates React Query caches on
 * changes and fires toast alerts for new withdrawal requests.
 */
export const useAdminRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isConnected, setConnected] = useState(false);

  // Stable callback refs to avoid re-subscribing
  const invalidateAdmin = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-global-revenue"] });
    queryClient.invalidateQueries({ queryKey: ["admin-today-revenue"] });
  }, [queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime-dashboard")
      // ── Activity logs: new inserts ──
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-activity-logs"] });
        }
      )
      // ── Profiles: user signups & updates ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          invalidateAdmin();
          queryClient.invalidateQueries({ queryKey: ["recent-users"] });
          queryClient.invalidateQueries({ queryKey: ["creator-revenue-list"] });
        }
      )
      // ── Withdrawals: new requests & status changes ──
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "withdrawals" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] });
          invalidateAdmin();
          toast({
            title: "🔔 New Withdrawal Request",
            description: `$${Number(payload.new.amount).toFixed(2)} via ${(payload.new.payment_method as string).replace("_", " ")}`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "withdrawals" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] });
          invalidateAdmin();
        }
      )
      // ── Earnings logs: revenue changes ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ad_earnings_logs" },
        () => {
          invalidateAdmin();
          queryClient.invalidateQueries({ queryKey: ["creator-revenue-list"] });
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [queryClient, invalidateAdmin, toast]);

  return { isConnected };
};