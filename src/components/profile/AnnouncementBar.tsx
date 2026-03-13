import { motion } from "framer-motion";
import type { BioTheme } from "@/lib/bioThemes";

interface AnnouncementBarProps {
  text: string;
  theme: BioTheme;
}

export const AnnouncementBar = ({ text, theme }: AnnouncementBarProps) => {
  if (!text?.trim()) return null;

  return (
    <div
      className="overflow-hidden rounded-xl mb-4 py-2"
      style={{
        background: `${theme.accent}15`,
        border: `1px solid ${theme.accent}25`,
      }}
    >
      <motion.div
        className="whitespace-nowrap text-sm font-medium"
        style={{ color: theme.accent }}
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: Math.max(8, text.length * 0.25), repeat: Infinity, ease: "linear" }}
      >
        📢 {text}
      </motion.div>
    </div>
  );
};