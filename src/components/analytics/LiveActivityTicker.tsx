import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  UserPlus,
  Heart,
  Sparkles,
} from "lucide-react";

interface ActivityEvent {
  id: number;
  text: string;
  icon: any;
  accent: string;
}

const TEMPLATES: Omit<ActivityEvent, "id">[] = [
  { text: "Someone bought your ebook", icon: ShoppingBag, accent: "text-[#69EACB]" },
  { text: "12 visitors joined from Instagram", icon: Users, accent: "text-[#C8B6FF]" },
  { text: "Your latest reel is trending", icon: TrendingUp, accent: "text-[#7B61FF]" },
  { text: "New lead captured", icon: UserPlus, accent: "text-[#69EACB]" },
  { text: "Affiliate sale completed", icon: Sparkles, accent: "text-[#C8B6FF]" },
  { text: "Profile got 8 new likes", icon: Heart, accent: "text-rose-300" },
];

export const LiveActivityTicker = () => {
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    TEMPLATES.slice(0, 4).map((t, i) => ({ ...t, id: i }))
  );

  useEffect(() => {
    let next = events.length;
    const t = setInterval(() => {
      const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      const newEvent: ActivityEvent = { ...tpl, id: next++ };
      setEvents((prev) => [newEvent, ...prev].slice(0, 5));
    }, 3500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Live Activity
          </div>
          <div className="font-display text-sm font-semibold">
            Real-time creator pulse
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, x: 16, height: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 backdrop-blur-md"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ${e.accent}`}>
                <e.icon className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-sm">{e.text}</span>
              <span className="text-[10px] text-muted-foreground">just now</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
