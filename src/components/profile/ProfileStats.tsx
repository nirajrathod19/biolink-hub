import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, MousePointer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileStatsProps {
  profileId: string;
  userId: string;
  initialViews?: number;
  initialClicks?: number;
  theme: {
    accent: string;
    textColor: string;
    bioTextColor: string;
    cardBg: string;
  };
}

export const ProfileStats = ({
  profileId,
  userId,
  initialViews = 0,
  initialClicks = 0,
  theme,
}: ProfileStatsProps) => {
  const [views, setViews] = useState(initialViews);
  const [clicks, setClicks] = useState(initialClicks);

  // Sync initial values when they load
  useEffect(() => {
    setViews(initialViews);
  }, [initialViews]);

  useEffect(() => {
    setClicks(initialClicks);
  }, [initialClicks]);

  // Subscribe to real-time profile updates (total_clicks / unique_clicks)
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`profile-stats-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profileId}`,
        },
        (payload) => {
          if (payload.new) {
            const p = payload.new as any;
            if (typeof p.total_clicks === "number") setViews(p.total_clicks);
            if (typeof p.unique_clicks === "number") setClicks(p.unique_clicks);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "click_logs",
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          // Increment local click count optimistically
          setClicks((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  const stats = [
    { icon: Eye, label: "Visitors", value: views },
    { icon: MousePointer, label: "Clicks", value: clicks },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="flex justify-center gap-6 mb-6"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1.5">
          <stat.icon
            className="w-3.5 h-3.5"
            style={{ color: theme.accent }}
            aria-hidden="true"
          />
          <motion.span
            key={stat.value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold tabular-nums"
            style={{ color: theme.textColor }}
          >
            {stat.value.toLocaleString()}
          </motion.span>
          <span
            className="text-xs"
            style={{ color: theme.bioTextColor, opacity: 0.7 }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
};