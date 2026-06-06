import { motion } from "framer-motion";
import { LucideIcon, Mail, MessageCircle, Calendar, Globe, UserPlus, Briefcase } from "lucide-react";

export type QuickActionKind = "contact" | "whatsapp" | "book" | "website" | "follow" | "hire";

export interface QuickAction {
  kind: QuickActionKind;
  label: string;
  href: string;
  primary?: boolean;
}

const ICONS: Record<QuickActionKind, LucideIcon> = {
  contact: Mail,
  whatsapp: MessageCircle,
  book: Calendar,
  website: Globe,
  follow: UserPlus,
  hire: Briefcase,
};

interface QuickActionsProps {
  actions: QuickAction[];
  theme: { accent: string; accentText: string; cardBg: string; textColor: string };
  className?: string;
}

/**
 * Configurable quick-action row. The first `primary` action becomes the hero
 * CTA; remaining actions are rendered as soft secondary chips.
 */
export const QuickActions = ({ actions, theme, className = "" }: QuickActionsProps) => {
  if (!actions?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={`flex flex-wrap justify-center gap-2 ${className}`}
    >
      {actions.map((a, i) => {
        const Icon = ICONS[a.kind];
        const isPrimary = a.primary;
        return (
          <a
            key={`${a.kind}-${i}`}
            href={a.href}
            target={a.href.startsWith("#") ? undefined : "_blank"}
            rel={a.href.startsWith("#") ? undefined : "noopener noreferrer"}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-h-[44px]"
            style={
              isPrimary
                ? {
                    background: theme.accent,
                    color: theme.accentText,
                    boxShadow: `0 8px 24px -8px ${theme.accent}`,
                  }
                : {
                    background: theme.cardBg,
                    color: theme.textColor,
                    border: `1px solid ${theme.accent}22`,
                  }
            }
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span>{a.label}</span>
          </a>
        );
      })}
    </motion.div>
  );
};
