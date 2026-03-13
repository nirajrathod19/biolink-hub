import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, User, ShoppingBag, MousePointer, UserPlus, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LiveIndicator } from "@/components/ui/LiveIndicator";

const actionIcons: Record<string, any> = {
  profile_update: User,
  product_sale: ShoppingBag,
  link_click: MousePointer,
  signup: UserPlus,
};

const actionColors: Record<string, string> = {
  profile_update: "text-blue-400 bg-blue-400/10",
  product_sale: "text-emerald-400 bg-emerald-400/10",
  link_click: "text-amber-400 bg-amber-400/10",
  signup: "text-purple-400 bg-purple-400/10",
};

export const AdminActivityTab = () => {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const userIds = [...new Set((data || []).map(l => l.user_id))];
      if (userIds.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return (data || []).map(log => ({
        ...log,
        username: profileMap.get(log.user_id)?.username || "unknown",
        display_name: profileMap.get(log.user_id)?.display_name,
      }));
    },
    staleTime: 1000 * 10,
  });

  // Dedicated realtime channel for this tab
  useEffect(() => {
    const channel = supabase
      .channel("admin-activity-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-activity-logs"] });
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [queryClient]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Activity & Audit Logs
          </h1>
          <p className="text-muted-foreground text-sm">Real-time platform activity feed</p>
        </div>
        <div className="flex items-center gap-3">
          {isLive && <LiveIndicator isConnected={isLive} />}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/60">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No activity recorded yet. Actions will appear here automatically.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border/40" />

            <AnimatePresence initial={false}>
              {logs.map((log: any) => {
                const Icon = actionIcons[log.action_type] || Activity;
                const colorClass = actionColors[log.action_type] || "text-muted-foreground bg-muted/30";

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -24, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 24, height: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative flex items-start gap-4 py-3 pl-1 overflow-hidden"
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm">
                        <span className="font-medium">@{log.username}</span>
                        <span className="text-muted-foreground ml-1">{log.description}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
};