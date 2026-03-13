import { motion } from "framer-motion";
import { MousePointer, Link as LinkIcon, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLinks } from "@/hooks/useLinks";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { LiveIndicator } from "@/components/ui/LiveIndicator";

export const LinkClicksBreakdown = () => {
  const { data: links = [], isLoading } = useLinks();
  const { isConnected } = useRealtimeAnalytics();

  const sorted = [...links].sort(
    (a, b) => (b.click_count || 0) - (a.click_count || 0)
  );

  const totalClicks = sorted.reduce((s, l) => s + (l.click_count || 0), 0);

  if (isLoading) {
    return (
      <GlassCard>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MousePointer className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Per-Link Clicks</h3>
        </div>
        <LiveIndicator isConnected={isConnected} />
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          No links yet — add some to see click analytics.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((link, i) => {
            const pct =
              totalClicks > 0
                ? ((link.click_count || 0) / totalClicks) * 100
                : 0;

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.title}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <MousePointer className="w-3 h-3" />
                  <span className="text-sm font-semibold tabular-nums">
                    {(link.click_count || 0).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};