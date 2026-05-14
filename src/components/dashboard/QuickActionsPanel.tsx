import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Link2,
  ShoppingBag,
  Wand2,
  Megaphone,
  Share2,
  Tag,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { icon: Link2, label: "New link", href: "/dashboard/links" },
  { icon: ShoppingBag, label: "Add product", href: "/dashboard/monetization" },
  { icon: Wand2, label: "AI bio", href: "/dashboard/profile" },
  { icon: Sparkles, label: "AI CTA", href: "/dashboard/links" },
  { icon: Share2, label: "Share", href: "/dashboard/settings" },
  { icon: Tag, label: "Coupon", href: "/dashboard/monetization" },
  { icon: MessageSquare, label: "Post", href: "/dashboard/community" },
  { icon: Megaphone, label: "Campaign", href: "/dashboard/analytics" },
];

export const QuickActionsPanel = () => {
  return (
    <motion.section
      aria-label="Quick actions"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.25 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Quick actions</h3>
        <span className="text-[11px] text-muted-foreground">creator dock</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i + 0.3, duration: 0.4 }}
            >
              <Link
                to={a.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background/40 p-3 text-center transition-all",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/70 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.35)]"
                )}
              >
                <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "radial-gradient(60% 80% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%)" }}
                />
                <Icon className="relative h-5 w-5 text-foreground/80 transition-colors group-hover:text-primary" />
                <span className="relative text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                  {a.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
