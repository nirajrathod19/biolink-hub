import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { useEffect } from "react";

/**
 * Premium ambient background: animated mesh gradient + floating orbs + grid +
 * cursor-reactive glow. Drop once at the root of a page (behind content).
 */
export const AmbientBackground = () => {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 100);
      my.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const cursorGlow = useMotionTemplate`radial-gradient(600px circle at ${mx}% ${my}%, hsl(var(--primary) / 0.10), transparent 60%)`;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />

      {/* Animated mesh blobs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-[140px] opacity-60"
        style={{ background: "radial-gradient(circle, hsl(160 60% 55% / 0.45), transparent 70%)" }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 30, 0], y: [0, 30, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-32 h-[560px] w-[560px] rounded-full blur-[150px] opacity-50"
        style={{ background: "radial-gradient(circle, hsl(175 70% 70% / 0.4), transparent 70%)" }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-[150px] opacity-45"
        style={{ background: "radial-gradient(circle, hsl(260 70% 75% / 0.4), transparent 70%)" }}
      />

      {/* Subtle moving grid */}
      <motion.div
        aria-hidden
        animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      {/* Cursor-reactive glow */}
      <motion.div aria-hidden className="absolute inset-0" style={{ background: cursorGlow }} />

      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
};
