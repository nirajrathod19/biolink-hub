import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import type { BioTheme } from "@/lib/bioThemes";
import { PremiumLinkCard, type PremiumLink } from "./PremiumLinkCard";

interface Props {
  links: PremiumLink[];
  announcementText?: string | null;
  theme: BioTheme;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, link: { id: string; url: string }) => void;
}

/**
 * Above-the-fold Featured area.
 * Renders highlighted (is_highlighted) links as premium cards and surfaces
 * an optional announcement as a soft hero strip. Falls back to nothing when
 * no featured content exists — zero visual cost for creators who don't use it.
 */
export const FeaturedSection = ({ links, announcementText, theme, onLinkClick }: Props) => {
  const featured = links.filter((l) => l.is_highlighted).slice(0, 3);
  if (featured.length === 0 && !announcementText) return null;

  return (
    <section aria-label="Featured" className="mb-6 space-y-3">
      {announcementText && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}14, ${theme.accent}05)`,
            border: `1px solid ${theme.accent}28`,
            color: theme.cardText,
          }}
        >
          <Megaphone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.accent }} />
          <p className="text-sm leading-snug font-medium">{announcementText}</p>
        </motion.div>
      )}

      {featured.length > 0 && (
        <div className="space-y-2.5">
          {featured.map((link) => (
            <PremiumLinkCard
              key={link.id}
              link={link}
              theme={theme}
              onLinkClick={onLinkClick}
              size="lg"
            />
          ))}
        </div>
      )}
    </section>
  );
};
