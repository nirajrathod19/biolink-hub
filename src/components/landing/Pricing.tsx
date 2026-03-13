import { motion } from "framer-motion";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";

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
            Start free and upgrade when you're ready. Unlock Pro after 1,000 unique clicks.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <SubscriptionPlans variant="embed" />
        </div>
      </div>
    </section>
  );
};