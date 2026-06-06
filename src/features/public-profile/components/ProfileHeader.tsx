import { motion } from "framer-motion";
import { Sparkles, MapPin } from "lucide-react";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { SocialRow, type SocialItem } from "./SocialRow";
import { QuickActions, type QuickAction } from "./QuickActions";

interface Theme {
  accent: string;
  accentText: string;
  textColor: string;
  bioTextColor: string;
  cardBg: string;
  socialBg: string;
  socialText: string;
}

export interface ProfileHeaderProps {
  displayName: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  category?: string | null;
  location?: string | null;
  isVerified?: boolean;
  isPro?: boolean;
  socials?: SocialItem[];
  actions?: QuickAction[];
  theme: Theme;
}

/**
 * Premium hero-style profile header. Mobile-first, supports optional cover
 * image, brand accent, location + category, verified badge, social row, and
 * configurable quick-action CTAs.
 */
export const ProfileHeader = ({
  displayName,
  username,
  bio,
  avatarUrl,
  coverUrl,
  category,
  location,
  isVerified,
  isPro,
  socials = [],
  actions = [],
  theme,
}: ProfileHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-8 -mx-4"
    >
      {/* Cover band */}
      <div
        className="relative h-28 sm:h-36 rounded-b-3xl overflow-hidden"
        style={{
          background: coverUrl
            ? `url(${coverUrl}) center/cover`
            : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}55)`,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, transparent 40%, ${theme.cardBg}55 100%)` }}
        />
      </div>

      <div className="px-4 -mt-14 text-center">
        {/* Avatar */}
        <div className="relative inline-block mb-3">
          <div
            className="w-28 h-28 rounded-full p-[3px]"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                loading="eager"
                decoding="async"
                className="w-full h-full rounded-full object-cover border-2"
                style={{ borderColor: theme.cardBg }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-4xl border-2"
                style={{ background: theme.cardBg, borderColor: theme.cardBg }}
                role="img"
                aria-label="Default avatar"
              >
                👤
              </div>
            )}
          </div>
          {isPro && (
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }}
              aria-label="Pro creator"
            >
              <Sparkles className="w-4 h-4" style={{ color: theme.accentText }} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Name + verified */}
        <h1
          className="text-[26px] sm:text-3xl font-display font-bold tracking-[-0.03em] leading-[1.05] mb-1 flex items-center justify-center gap-1.5"
          style={{ color: theme.textColor }}
        >
          <span>{displayName}</span>
          {isVerified && <VerifiedBadge size={20} />}
        </h1>

        {/* Username */}
        <p className="text-xs font-medium tracking-wide opacity-70 mb-2" style={{ color: theme.bioTextColor }}>
          @{username}
        </p>

        {/* Category + location chips */}
        {(category || location) && (
          <div className="flex flex-wrap justify-center items-center gap-1.5 mb-3">
            {category && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight"
                style={{
                  background: `${theme.accent}18`,
                  color: theme.accent,
                  border: `1px solid ${theme.accent}30`,
                }}
              >
                {category}
              </span>
            )}
            {location && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]"
                style={{ background: theme.cardBg, color: theme.bioTextColor }}
              >
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {location}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <p
            className="text-[14px] leading-relaxed max-w-sm mx-auto mb-4 tracking-tight"
            style={{ color: theme.bioTextColor }}
          >
            {bio}
          </p>
        )}

        {/* Quick actions */}
        {actions.length > 0 && <QuickActions actions={actions} theme={theme} className="mb-4" />}

        {/* Socials */}
        {socials.length > 0 && <SocialRow items={socials} theme={theme} />}
      </div>
    </motion.header>
  );
};
