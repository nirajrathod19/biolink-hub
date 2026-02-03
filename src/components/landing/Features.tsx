import { motion } from "framer-motion";
import { 
  Link2, 
  Palette, 
  TrendingUp, 
  Wallet, 
  Users, 
  Zap,
  Shield,
  BarChart3
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Link2,
    title: "Unlimited Links",
    description: "Add as many links as you need. Social media, websites, products - all in one place.",
  },
  {
    icon: Palette,
    title: "Custom Themes",
    description: "Choose from stunning templates or create your own unique style that matches your brand.",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track every click, visitor, and engagement with detailed real-time analytics.",
  },
  {
    icon: Wallet,
    title: "Earn Revenue",
    description: "Monetize your audience with our revenue-sharing program. Unlock Pro after 1000 clicks.",
  },
  {
    icon: Users,
    title: "Referral System",
    description: "Earn 5% commission from creators you refer. Build your network and earn passively.",
  },
  {
    icon: Zap,
    title: "Gamified Progress",
    description: "Watch your progress as you grow. Unlock achievements and Pro status with milestones.",
  },
  {
    icon: Shield,
    title: "Secure & Fast",
    description: "Lightning-fast page loads with enterprise-grade security for you and your audience.",
  },
  {
    icon: BarChart3,
    title: "Internal Wallet",
    description: "Manage your earnings in one place. Pay for subscriptions or withdraw to your bank.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const Features = () => {
  return (
    <section className="py-24 relative" id="features">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for creators who want to grow their audience and monetize their content.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <GlassCard className="h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
