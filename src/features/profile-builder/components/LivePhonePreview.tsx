import { motion } from "framer-motion";
import { Wifi, Sparkles, Star } from "lucide-react";
import { getThemeById } from "@/lib/bioThemes";

interface Props {
  profile: {
    username?: string | null;
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
    is_active: boolean;
    is_highlighted?: boolean;
    badge?: string | null;
    icon?: string | null;
  }>;
}

export const LivePhonePreview = ({ profile, links }: Props) => {
  const theme = getThemeById(profile?.template || "minimal-mono");
  const active = links.filter((l) => l.is_active);
  const featured = active.filter((l) => l.is_highlighted);
  const regular = active.filter((l) => !l.is_highlighted);

  return (
    <div className="sticky top-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Live preview</span>
      </div>

      <div className="relative mx-auto w-[320px] h-[640px] rounded-[2.75rem] border-[10px] border-foreground/15 bg-foreground/5 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.25)] overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/30 rounded-full z-20" />
        <div
          className="h-full overflow-y-auto scrollbar-none pt-10 pb-8 px-5"
          style={{ background: theme.background }}
        >
          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 p-[2px]"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}66)` }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-xl"
                  style={{ background: theme.cardBg }}
                >
                  👤
                </div>
              )}
            </div>
            <h2
              className="font-display font-bold tracking-tight text-lg"
              style={{ color: theme.textColor }}
            >
              {profile?.display_name || `@${profile?.username || "you"}`}
              {profile?.is_pro && (
                <Sparkles className="inline w-3.5 h-3.5 ml-1" style={{ color: theme.accent }} />
              )}
            </h2>
            {profile?.bio && (
              <p
                className="text-xs mt-1.5 leading-relaxed px-4"
                style={{ color: theme.bioTextColor }}
              >
                {profile.bio}
              </p>
            )}
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <div className="space-y-2 mb-3">
              {featured.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                    color: theme.accentText,
                  }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="truncate flex-1">{l.title}</span>
                  {l.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                      {l.badge}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Regular */}
          <div className="space-y-2">
            {regular.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 border"
                style={{
                  background: theme.cardBg,
                  color: theme.textColor,
                  borderColor: `${theme.textColor}14`,
                }}
              >
                {l.icon && (
                  <img src={l.icon} alt="" className="w-5 h-5 rounded object-cover" />
                )}
                <span className="truncate flex-1 font-medium">{l.title}</span>
                {l.badge && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: `${theme.accent}22`, color: theme.accent }}
                  >
                    {l.badge}
                  </span>
                )}
              </motion.div>
            ))}
            {active.length === 0 && (
              <div
                className="rounded-2xl border border-dashed py-10 text-center text-xs"
                style={{ borderColor: `${theme.textColor}33`, color: theme.bioTextColor }}
              >
                Add your first link to see it here
              </div>
            )}
          </div>
        </div>
      </div>

      {profile?.username && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          brioo.in/<span className="text-foreground font-medium">{profile.username}</span>
        </p>
      )}
    </div>
  );
};
