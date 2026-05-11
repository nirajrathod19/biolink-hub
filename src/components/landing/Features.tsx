import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
  Link2, Palette, TrendingUp, Wallet, Users, Zap, Shield, BarChart3, Sparkles,
} from "lucide-react";

type Feature = {
  icon: typeof Link2;
  title: string;
  description: string;
  span?: string; // grid span classes
  accent: string; // tailwind gradient
};

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "AI Creator OS",
    description: "Bio writer, CTA optimizer, color extractor, and smart block reordering — built in.",
    span: "md:col-span-2 md:row-span-2",
    accent: "from-fuchsia-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Etlytix BI",
    description: "Real-time traffic, revenue, and funnel insights.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: Wallet,
    title: "Built-in Wallet",
    description: "Earn, pay, withdraw — all in one place.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    icon: Palette,
    title: "Premium Themes",
    description: "Glassmorphism, mesh gradients, AI-styled palettes.",
    span: "md:col-span-2",
    accent: "from-amber-400 to-rose-400",
  },
  {
    icon: TrendingUp,
    title: "Monetization",
    description: "Tips, products, ads, subs, affiliates.",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    icon: Users,
    title: "Referrals",
    description: "Earn 5% from every creator you bring in.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Enterprise-grade",
    description: "Bot protection, fraud scoring, RLS.",
    accent: "from-slate-400 to-zinc-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Edge-rendered, 95+ Lighthouse out of the box.",
    accent: "from-yellow-400 to-orange-500",
  },
];

const FeatureCard = ({ f, i }: { f: Feature; i: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };
  const glow = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, hsl(var(--primary) / 0.15), transparent 70%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: i * 0.05 }}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-6 transition-all hover:border-primary/40 ${f.span ?? ""}`}
    >
      {/* Cursor-following glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />
      {/* Accent gradient corner */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${f.accent} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity`} />

      <div className="relative">
        <div className={`inline-flex w-11 h-11 rounded-xl bg-gradient-to-br ${f.accent} bg-opacity-20 items-center justify-center mb-4 ring-1 ring-white/10`}>
          <f.icon className="w-5 h-5 text-foreground" />
        </div>
        <h3 className="text-lg md:text-xl font-display font-semibold tracking-tight mb-2">
          {f.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {f.description}
        </p>
      </div>
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section className="relative py-24" id="features">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide uppercase">The toolkit</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Everything you need.{" "}
            <span className="gradient-text">Nothing you don't.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A creator OS that grows with your audience — not against it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[180px]">
          {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
};
