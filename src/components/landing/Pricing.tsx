import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Unlimited links",
      "Basic templates",
      "Basic analytics",
      "Social media icons",
      "Mobile optimized",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro Monthly",
    price: "$3",
    period: "per month",
    description: "Unlock revenue sharing",
    features: [
      "Everything in Free",
      "Premium templates",
      "Advanced analytics",
      "50% revenue share",
      "Priority support",
      "Custom domain",
      "Remove branding",
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Pro Yearly",
    price: "$30",
    period: "per year",
    description: "Best value - Save $6",
    features: [
      "Everything in Pro",
      "2 months free",
      "Early access features",
      "VIP support",
      "API access",
    ],
    cta: "Go Pro",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section className="py-24 relative" id="pricing">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="container relative px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready. Unlock Pro after 1000 unique clicks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <GlassCard
                gradient={plan.popular}
                className={cn(
                  "h-full flex flex-col relative",
                  plan.popular && "border-primary/50 shadow-lg shadow-primary/10"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-semibold text-primary-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-display font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <GradientButton
                  variant={plan.popular ? "glow" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </GradientButton>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
