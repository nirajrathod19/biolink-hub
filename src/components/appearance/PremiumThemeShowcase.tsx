import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { BIO_THEMES, type BioTheme } from "@/lib/bioThemes";

interface Props {
  selectedThemeId: string;
  onSelect: (id: string) => void;
}

const PREMIUM_THEMES: BioTheme[] = BIO_THEMES.filter((t) => t.category === "premium");

const ThemeCard = ({
  theme,
  selected,
  onClick,
}: {
  theme: BioTheme;
  selected: boolean;
  onClick: () => void;
}) => {
  const gradient = theme.primaryGradient || theme.accent;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left rounded-2xl overflow-hidden transition-all group ${
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
      style={{
        background: theme.background,
        boxShadow: selected
          ? `0 20px 60px -20px ${theme.glow || theme.accent}80`
          : "0 8px 24px -12px rgba(0,0,0,0.25)",
      }}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Ambient blur */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ background: theme.glow || theme.accent }}
      />

      <div className="relative p-5 min-h-[180px] flex flex-col justify-between">
        {/* Top: name + mood */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-display font-bold text-base leading-tight" style={{ color: theme.textColor }}>
              {theme.name}
            </h4>
            {selected && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: theme.accent, color: theme.accentText }}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
            )}
          </div>
          {theme.tagline && (
            <p className="text-[11px] leading-snug opacity-80" style={{ color: theme.bioTextColor }}>
              {theme.tagline}
            </p>
          )}
        </div>

        {/* Mini preview blocks */}
        <div className="space-y-1.5 mt-4">
          <div
            className="h-7 rounded-lg flex items-center px-3"
            style={{
              background: gradient,
              color: theme.accentText,
              boxShadow: theme.buttonShadow,
            }}
          >
            <span className="text-[10px] font-bold tracking-wide">PRIMARY CTA</span>
          </div>
          <div className="flex gap-1.5">
            <div
              className="flex-1 h-6 rounded-md"
              style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            />
            <div
              className="w-6 h-6 rounded-md"
              style={{ background: theme.socialBg, border: `1px solid ${theme.cardBorder}` }}
            />
          </div>
          {theme.chartPalette && (
            <div className="flex gap-1 pt-1">
              {theme.chartPalette.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ background: c, opacity: 0.9 - i * 0.1 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export const PremiumThemeShowcase = ({ selectedThemeId, onSelect }: Props) => {
  return (
    <section aria-labelledby="premium-themes-heading">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 id="premium-themes-heading" className="font-display font-bold text-lg">
          Premium Themes
        </h3>
        <span className="ml-auto text-[10px] font-bold tracking-wider text-primary uppercase">
          Adaptive Engine
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        10 cinematic themes with smart contrast, gradient buttons, glow shadows, and matching chart palettes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PREMIUM_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={selectedThemeId === theme.id}
            onClick={() => onSelect(theme.id)}
          />
        ))}
      </div>
    </section>
  );
};
