import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Link2,
  TrendingUp,
  MousePointerClick,
  Eye,
  Wallet,
  Instagram,
  Youtube,
  Music2,
  ShoppingBag,
  BarChart3,
  Wand2,
  Check,
} from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Link } from "react-router-dom";

/* -------------------------------------------------------------
   Editorial split hero — left copy, right floating phone mockup
   + glass analytics cards. Matches uploaded reference mood.
------------------------------------------------------------- */

const FEATURE_ICONS = [
  { Icon: Link2, label: "Bio Links" },
  { Icon: ShoppingBag, label: "Stores" },
  { Icon: BarChart3, label: "Analytics" },
  { Icon: Wand2, label: "AI Tools" },
  { Icon: Wallet, label: "Monetization" },
];

const ROTATING_WORDS = ["Empire.", "Brand.", "Studio.", "Universe."];

/* ---------- Floating glass analytics card ---------- */
const StatCard = ({
  label,
  value,
  delta,
  Icon,
  className = "",
  delay = 0,
  spark = "up",
}: {
  label: string;
  value: string;
  delta: string;
  Icon: typeof TrendingUp;
  className?: string;
  delay?: number;
  spark?: "up" | "down";
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className={`absolute pointer-events-auto ${className}`}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut" }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-3.5 py-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] min-w-[140px]"
    >
      {/* inner gradient sheen */}
      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
      <div className="flex items-center gap-1.5 text-[10px] text-white/60 tracking-wide">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-display font-bold text-white tabular-nums">
        {value}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-medium text-[hsl(167,71%,72%)]">
          {delta}
        </span>
        {/* mini sparkline */}
        <svg viewBox="0 0 50 16" className="w-12 h-4">
          <defs>
            <linearGradient id={`sp-${label}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="hsl(249, 100%, 76%)" />
              <stop offset="100%" stopColor="hsl(167, 71%, 72%)" />
            </linearGradient>
          </defs>
          <motion.path
            d={
              spark === "up"
                ? "M0,12 L8,10 L16,11 L24,7 L32,8 L40,4 L50,2"
                : "M0,4 L8,6 L16,5 L24,9 L32,8 L40,12 L50,14"
            }
            fill="none"
            stroke={`url(#sp-${label})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: delay + 0.4, duration: 1.2, ease: "easeOut" }}
          />
        </svg>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------- Floating phone mockup ---------- */
const PhoneMockup = ({ mouseX, mouseY }: { mouseX: any; mouseY: any }) => {
  const rotateX = useTransform(mouseY, [0, 1], [6, -6]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
  const springX = useSpring(rotateX, { stiffness: 80, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 80, damping: 20 });

  return (
    <motion.div
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1400 }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto"
    >
      {/* orbital glow behind device */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle_at_center,hsl(249,100%,69%,0.35),transparent_60%)] blur-2xl" />
      </div>
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[440px] h-[440px] rounded-full bg-[radial-gradient(circle_at_center,hsl(167,71%,67%,0.18),transparent_70%)] blur-3xl" />
      </div>

      {/* device frame */}
      <div className="relative w-[260px] sm:w-[280px] rounded-[2.5rem] bg-gradient-to-b from-white/15 to-white/5 p-[3px] shadow-[0_40px_120px_-20px_rgba(123,97,255,0.6)]">
        <div className="relative rounded-[2.3rem] overflow-hidden bg-gradient-to-br from-[#0d1430] via-[#1a1240] to-[#0a0f24] aspect-[9/19]">
          {/* notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black/80 z-20" />

          {/* aurora wash inside screen */}
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-[hsl(249,100%,69%)]/40 blur-3xl" />
            <div className="absolute top-20 -right-10 w-40 h-40 rounded-full bg-[hsl(254,100%,86%)]/30 blur-3xl" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-[hsl(167,71%,67%)]/30 blur-3xl" />
          </div>

          {/* profile content */}
          <div className="relative z-10 pt-10 px-4 text-white">
            {/* avatar */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(254,100%,86%)] to-[hsl(249,100%,69%)] p-[2px]"
            >
              <div className="w-full h-full rounded-full bg-[#0d1430] flex items-center justify-center text-xl font-display font-bold">
                B
              </div>
            </motion.div>
            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-1 text-sm font-display font-semibold">
                @brioo_creator
                <span className="inline-flex w-3.5 h-3.5 rounded-full bg-[hsl(167,71%,67%)] items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#0d1430]" strokeWidth={3} />
                </span>
              </div>
              <div className="text-[10px] text-white/60">Digital Creator ✨</div>
            </div>

            {/* socials row */}
            <div className="flex justify-center gap-2 mt-3">
              {[Instagram, Youtube, Music2].map((Ic, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                >
                  <Ic className="w-3.5 h-3.5 text-white/90" />
                </div>
              ))}
            </div>

            {/* link list */}
            <div className="mt-4 space-y-2">
              {["My Portfolio", "Shop Merch", "Latest Video", "Join Community"].map(
                (t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                    className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 py-2 px-3 text-[11px] font-medium text-white/95 flex items-center justify-between"
                  >
                    <span>{t}</span>
                    <ArrowRight className="w-3 h-3 text-white/60" />
                  </motion.div>
                )
              )}
            </div>

            <div className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-white/40">
              Powered by Brioo.in
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Hero = () => {
  const [wordIdx, setWordIdx] = useState(0);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, -60]);

  useEffect(() => {
    const t = setInterval(
      () => setWordIdx((p) => (p + 1) % ROTATING_WORDS.length),
      2800
    );
    return () => clearInterval(t);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        type: "spring" as const,
        stiffness: 90,
        damping: 22,
      },
    }),
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16"
    >
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
          {/* ============== LEFT COLUMN ============== */}
          <motion.div style={{ y: heroParallax }} className="relative">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[hsl(254,100%,86%)]" />
              <span className="text-[12px] font-medium aurora-text tracking-wide">
                The #1 Creator Monetization Platform
              </span>
            </motion.div>

            {/* Editorial headline */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="font-display font-semibold leading-[0.95] tracking-[-0.04em] text-[clamp(2.75rem,6.2vw,5.25rem)] text-white"
            >
              <span className="block">One Link.</span>
              <span className="block">Your Entire</span>
              <span className="block">
                Creator{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block aurora-text"
                  >
                    {ROTATING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-6 text-base md:text-[17px] text-white/65 max-w-lg leading-relaxed"
            >
              Create your personalized bio link page, share unlimited content,
              sell products, collect leads, and start earning — all from one
              beautiful link.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link to="/signup">
                <GradientButton variant="glow" size="lg" className="rounded-full px-7">
                  Start Free
                  <ArrowRight className="w-4 h-4" />
                </GradientButton>
              </Link>
              <Link to="/demo">
                <GradientButton variant="ghost" size="lg" className="rounded-full px-7 border border-white/10 hover:bg-white/5">
                  <Link2 className="w-4 h-4" />
                  See Live Demo
                </GradientButton>
              </Link>
            </motion.div>

            {/* Feature icon rail */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-12 flex flex-wrap gap-x-7 gap-y-4"
            >
              {FEATURE_ICONS.map(({ Icon, label }, i) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3 }}
                  className="flex flex-col items-center gap-1.5 group cursor-default"
                >
                  <div className="relative w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:border-[hsl(249,100%,69%)]/60 group-hover:shadow-[0_0_24px_-2px_hsl(249,100%,69%,0.45)]">
                    <Icon className="w-[18px] h-[18px] text-white/85" />
                  </div>
                  <span className="text-[11px] text-white/55 group-hover:text-white/85 transition-colors">
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ============== RIGHT COLUMN: phone + floating cards ============== */}
          <div className="relative h-[560px] sm:h-[620px] lg:h-[640px] flex items-center justify-center">
            {/* radial backdrop */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[conic-gradient(from_120deg,hsl(249,100%,69%,0.15),hsl(254,100%,86%,0.1),hsl(167,71%,67%,0.12),hsl(249,100%,69%,0.15))] blur-3xl opacity-70" />
            </div>

            <PhoneMockup mouseX={mouseX} mouseY={mouseY} />

            {/* Floating analytics cards */}
            <StatCard
              label="Total Earnings"
              value="₹2,45,890"
              delta="+18.6%"
              Icon={Wallet}
              className="top-4 left-0 sm:-left-4 lg:left-2"
              delay={0.6}
              spark="up"
            />
            <StatCard
              label="Links Clicked"
              value="89.7K"
              delta="+24.1%"
              Icon={MousePointerClick}
              className="top-16 right-0 sm:-right-2 lg:right-0"
              delay={0.85}
              spark="up"
            />
            <StatCard
              label="Profile Views"
              value="221K"
              delta="+12.9%"
              Icon={Eye}
              className="bottom-20 left-0 sm:-left-2"
              delay={1.05}
              spark="up"
            />

            {/* Real-time analytics tag */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="absolute bottom-32 right-2 hidden sm:flex items-center gap-2 text-[11px] text-white/60"
            >
              <svg width="34" height="20" viewBox="0 0 34 20" className="text-white/30">
                <path d="M2 2 Q 16 2, 16 10 T 32 18" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
              <span>
                Real-time
                <br />
                Analytics
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
