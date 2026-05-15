import { motion } from "framer-motion";

/**
 * Etlytix BI cinematic ambient layer.
 * - Animated mesh gradients (violet → cyan → lavender)
 * - Subtle grid + grain
 * - Soft floating orbs
 * Pointer-events disabled so it never intercepts UI.
 */
export const EtlytixAmbient = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#07111F]/40" />

      {/* Animated mesh orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #7B61FF 0%, transparent 60%)",
        }}
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #69EACB 0%, transparent 60%)",
        }}
        animate={{ x: [0, -40, 30, 0], y: [0, -50, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-1/3 h-[440px] w-[440px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #C8B6FF 0%, transparent 60%)",
        }}
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      {/* Cinematic grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
};
