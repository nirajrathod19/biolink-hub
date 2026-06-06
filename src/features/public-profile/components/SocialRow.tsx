import { motion } from "framer-motion";
import {
  Instagram, Youtube, Twitter, Linkedin, Github, Facebook,
  MessageCircle, Send, Camera, Globe, ExternalLink,
} from "lucide-react";
import { MagneticWrap } from "@/components/profile/MagneticWrap";

const ICONS: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  github: Github,
  whatsapp: MessageCircle,
  telegram: Send,
  snapchat: Camera,
  website: Globe,
};

export interface SocialItem {
  id: string;
  platform: string;
  url: string;
}

interface SocialRowProps {
  items: SocialItem[];
  theme: { socialBg: string; socialText: string };
  size?: "sm" | "md";
  className?: string;
}

/**
 * Premium social row primitive. Consistent icon system, magnetic hover,
 * accessible labels, mobile-friendly tap targets (40–44px).
 */
export const SocialRow = ({ items, theme, size = "md", className = "" }: SocialRowProps) => {
  if (!items?.length) return null;
  const dim = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <nav aria-label="Social media links" className={`flex flex-wrap justify-center gap-2.5 ${className}`}>
      {items.map((s, i) => {
        const Icon = ICONS[s.platform.toLowerCase()] || ExternalLink;
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
          >
            <MagneticWrap strength={10}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${s.platform} profile`}
                className={`${dim} rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                style={{
                  background: theme.socialBg,
                  color: theme.socialText,
                  backdropFilter: theme.socialBg.includes("rgba") ? "blur(8px)" : undefined,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <Icon className={icon} aria-hidden="true" />
              </a>
            </MagneticWrap>
          </motion.div>
        );
      })}
    </nav>
  );
};
