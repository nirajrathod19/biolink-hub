import { motion } from "framer-motion";
import { ExternalLink, Sparkles, Wifi } from "lucide-react";
import { getThemeById } from "@/lib/bioThemes";

interface LiveMobilePreviewProps {
  profile: {
    username?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    template?: string | null;
    is_pro?: boolean | null;
  } | null;
  links: Array<{
    id: string;
    title: string;
    url: string;
    is_active: boolean | null;
    badge?: string | null;
  }>;
}

export const LiveMobilePreview = ({ profile, links }: LiveMobilePreviewProps) => {
  const theme = getThemeById(profile?.template || "minimal-mono");
  const activeLinks = links.filter((l) => l.is_active !== false);

  return (
    <div className="sticky top-8">
      <div className="flex items-center gap-2 mb-3">
        <Wifi className="w-4 h-4 text-green-500" />
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
      </div>

      {/* Phone Frame */}
      <div className="relative mx-auto w-[300px] h-[600px] rounded-[2.5rem] border-4 border-foreground/20 shadow-xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/20 rounded-b-2xl z-20" />

        {/* Screen Content */}
        <div
          className="h-full overflow-y-auto scrollbar-none pt-8 pb-6 px-4"
          style={{ background: theme.background }}
        >
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 p-0.5"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                  style={{ background: theme.cardBg }}
                >
                  👤
                </div>
              )}
            </div>
            <h3
              className="text-base font-bold flex items-center justify-center gap-1"
              style={{ color: theme.textColor }}
            >
              {profile?.display_name || `@${profile?.username}`}
              {profile?.is_pro && (
                <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              )}
            </h3>
            {profile?.bio && (
              <p className="text-xs mt-1 max-w-[200px] mx-auto" style={{ color: theme.bioTextColor }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-2.5">
            {activeLinks.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-3 text-center text-sm font-medium cursor-default transition-all hover:scale-[1.02]"
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.cardText,
                }}
              >
                <div className="flex items-center justify-between px-1">
                  <span className="truncate flex-1">{link.title}</span>
                  {link.badge && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-2"
                      style={{ background: `${theme.accent}20`, color: theme.accent }}
                    >
                      {link.badge}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 ml-2 opacity-40 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
            {activeLinks.length === 0 && (
              <p className="text-center text-xs py-8" style={{ color: theme.bioTextColor }}>
                Add links to see them here
              </p>
            )}
          </div>

          {/* Brioo Footer */}
          <div className="mt-8 text-center">
            <span className="text-[10px] font-bold opacity-40" style={{ color: theme.footerText }}>
              brioo.in/{profile?.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
