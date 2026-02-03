import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, MousePointer, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  click_count: number | null;
  is_active: boolean | null;
  badge?: string | null;
}

interface LinksListProps {
  links: LinkItem[];
}

export const LinksList = ({ links }: LinksListProps) => {
  const activeLinks = links.filter(link => link.is_active !== false);

  if (activeLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 mb-4 text-muted-foreground/50">
          <Sparkles className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Show the world who you are.
        </h3>
        <p className="text-muted-foreground text-sm">
          Add a link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeLinks.map((link, index) => (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Link to="/dashboard/links">
            <GlassCard className="p-3 sm:p-4 hover:bg-secondary/80 transition-colors cursor-pointer">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm sm:text-base truncate">{link.title}</p>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {link.url}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MousePointer className="w-3 h-3" />
                    <span className="text-xs">{link.click_count || 0}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
