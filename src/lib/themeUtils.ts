// Smart adaptive color utilities for the Brioo theme engine.
// Pure functions — safe to import anywhere.

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
};

// Relative luminance per WCAG.
export const luminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a: string, b: string): number => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/** Pick black or white text for max contrast against a given background. */
export const readableOn = (bg: string, light = "#FFFFFF", dark = "#0A0A0A"): string => {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
};

/** Append an alpha channel to a hex color → rgba string. */
export const withAlpha = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, Math.min(1, alpha))})`;
};

/** Mix two hex colors by a ratio (0 = a, 1 = b). */
export const mixColors = (a: string, b: string, ratio = 0.5): string => {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  return rgbToHex(
    ra.r + (rb.r - ra.r) * ratio,
    ra.g + (rb.g - ra.g) * ratio,
    ra.b + (rb.b - ra.b) * ratio,
  );
};

/** Derive a soft chart palette from a single accent color. */
export const deriveChartPalette = (accent: string): string[] => {
  return [
    accent,
    mixColors(accent, "#FFFFFF", 0.35),
    mixColors(accent, "#000000", 0.35),
    mixColors(accent, "#7B61FF", 0.4),
    mixColors(accent, "#69EACB", 0.4),
  ];
};
