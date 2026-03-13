import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { BIO_THEMES, THEME_CATEGORIES, type BioTheme } from "@/lib/bioThemes";

interface ThemeGalleryProps {
  selectedThemeId: string;
  onSelect: (themeId: string) => void;
}

const ThemeMiniPreview = ({ theme, isSelected, onClick }: { theme: BioTheme; isSelected: boolean; onClick: () => void }) => {
  const isGradient = theme.background.includes("gradient") || theme.background.includes("linear");

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
        isSelected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/40"
      }`}
    >
      {/* Mini preview */}
      <div
        className="w-full aspect-[3/4] p-3 flex flex-col items-center justify-center gap-1.5"
        style={{ background: theme.background }}
      >
        {/* Mini avatar */}
        <div
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }}
        />
        {/* Mini name */}
        <div
          className="h-2 w-12 rounded-full"
          style={{ background: theme.textColor }}
        />
        {/* Mini bio */}
        <div
          className="h-1.5 w-16 rounded-full opacity-60"
          style={{ background: theme.bioTextColor }}
        />
        {/* Mini cards */}
        <div className="w-full space-y-1 mt-1 px-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3.5 w-full rounded-md"
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Theme name */}
      <div className="px-2.5 py-2 bg-card border-t border-border">
        <p className="text-xs font-semibold text-foreground truncate">{theme.name}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{theme.category}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
};

export const ThemeGallery = ({ selectedThemeId, onSelect }: ThemeGalleryProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredThemes = activeCategory === "all"
    ? BIO_THEMES
    : BIO_THEMES.filter((t) => t.category === activeCategory);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mr-1" />
        {THEME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filteredThemes.map((theme) => (
            <ThemeMiniPreview
              key={theme.id}
              theme={theme}
              isSelected={selectedThemeId === theme.id}
              onClick={() => onSelect(theme.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {BIO_THEMES.length} professionally designed themes
      </p>
    </div>
  );
};
