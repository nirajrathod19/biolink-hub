import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useInView, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Link2, Instagram, Youtube, Twitter, Music, Globe, ShoppingBag } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Link } from "react-router-dom";
import { useFormattedPlatformStats } from "@/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";

// Floating social icon config
const FLOATING_ICONS = [
  { Icon: Instagram, x: "10%", y: "20%", delay: 0, size: 28, color: "hsl(var(--primary))" },
  { Icon: Youtube, x: "85%", y: "15%", delay: 0.5, size: 32, color: "hsl(var(--destructive))" },
  { Icon: Twitter, x: "75%", y: "70%", delay: 1, size: 24, color: "hsl(var(--accent-foreground))" },
  { Icon: Music, x: "15%", y: "75%", delay: 1.5, size: 26, color: "hsl(var(--primary))" },
  { Icon: Globe, x: "90%", y: "45%", delay: 0.8, size: 22, color: "hsl(var(--muted-foreground))" },
  { Icon: ShoppingBag, x: "5%", y: "50%", delay: 1.2, size: 24, color: "hsl(var(--primary))" },
];

const THEME_GRADIENTS = [
  "from-primary to-accent",
  "from-purple-500 to-pink-500",
  "from-emerald-400 to-cyan-400",
  "from-orange-400 to-rose-400",
];

// Animated counter component
const AnimatedNumber = ({ value, label }: { value: string; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/[0-9,]/g, "");
  const spring = useSpring(0, { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (v) => `${Math.floor(v)}${suffix}`);

  useEffect(() => {
    if (isInView) spring.set(numericValue);
  }, [isInView, numericValue, spring]);

  return (
    <div ref={ref} className="text-center">
      <motion.div className="text-2xl md:text-3xl font-display font-bold gradient-text">
        {isInView ? <motion.span>{display}</motion.span> : "0"}
      </motion.div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

// Floating bio card component
const FloatingBioCard = ({ mouseX, mouseY }: { mouseX: any; mouseY: any }) => {
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.8, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8, type: "spring" }}
      className="absolute right-[5%] top-[18%] hidden lg:block z-20 pointer-events-none"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-56 rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl"
      >
        <div className="h-16 bg-gradient-to-r from-primary to-accent" />
        <div className="px-4 pb-4 -mt-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary mx-auto border-2 border-card flex items-center justify-center text-primary-foreground font-bold text-lg">B</div>
          <p className="font-display font-semibold mt-2 text-sm text-foreground">@brioo_creator</p>
          <p className="text-xs text-muted-foreground">Digital Creator ✨</p>
          <div className="mt-3 space-y-1.5">
            {["My Portfolio", "Shop Merch", "Latest Video"].map((t, i) => (
              <div key={t} className="bg-primary/10 rounded-lg py-1.5 text-xs font-medium text-primary">
                {t}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Hero = () => {
  const { stats, isLoading } = useFormattedPlatformStats();
  const [themeIdx, setThemeIdx] = useState(0);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const containerRef = useRef<HTMLElement>(null);

  // Cycle theme gradient
  useEffect(() => {
    const interval = setInterval(() => {
      setThemeIdx((prev) => (prev + 1) % THEME_GRADIENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 20 } },
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 15, -25, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Moving grid pattern */}
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:60px_60px]"
      />

      {/* Floating social media icons */}
      {FLOATING_ICONS.map(({ Icon, x, y, delay, size, color }, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none z-10"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: delay + 0.8, duration: 0.5 }}
        >
          <motion.div
            animate={{
              y: [0, -15, 5, -10, 0],
              x: [0, 8, -5, 3, 0],
              rotate: [0, 5, -3, 2, 0],
            }}
            transition={{ repeat: Infinity, duration: 6 + i * 0.5, ease: "easeInOut" }}
            className="blur-[0.5px]"
          >
            <Icon size={size} style={{ color }} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      ))}

      {/* 3D Floating Bio Card */}
      <FloatingBioCard mouseX={mouseX} mouseY={mouseY} />

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Creator monetization platform</span>
          </motion.div>

          {/* Main heading with dynamic gradient */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
          >
            One Link to{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={themeIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className={`bg-gradient-to-r ${THEME_GRADIENTS[themeIdx]} bg-clip-text text-transparent`}
              >
                Rule Them All
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Create your personalized bio link page, share all your content in one place, 
            and start earning from your audience. The ultimate link-in-bio for creators.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/signup">
              <GradientButton variant="glow" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </Link>
            <Link to="/demo">
              <GradientButton variant="outline" size="xl">
                <Link2 className="w-5 h-5" />
                See Demo
              </GradientButton>
            </Link>
          </motion.div>

          {/* Stats with counting animation */}
          <motion.div
            variants={fadeUp}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </>
            ) : stats ? (
              stats.map((stat) => (
                <AnimatedNumber key={stat.label} value={stat.value} label={stat.label} />
              ))
            ) : null}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};