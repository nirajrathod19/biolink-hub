import { motion } from "framer-motion";
import { Check, Sparkles, Crown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { 
  useSubscription, 
  useCreateCheckout, 
  useCustomerPortal,
  SUBSCRIPTION_PLANS,
  PlanKey 
} from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

const features = [
  "50% Revenue Share",
  "Advanced Analytics",
  "Priority Support",
  "Custom Themes",
  "Remove Platform Branding",
  "Early Access Features",
];

export const SubscriptionPlans = () => {
  const { isSubscribed, currentPlan, subscriptionEnd, isLoading: statusLoading, refetch } = useSubscription();
  const { createCheckout, isLoading: checkoutLoading } = useCreateCheckout();
  const { openPortal, isLoading: portalLoading } = useCustomerPortal();

  const handleSubscribe = async (planKey: PlanKey) => {
    await createCheckout(planKey);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (statusLoading) {
    return (
      <GlassCard className="mb-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </GlassCard>
    );
  }

  // If already subscribed, show subscription details
  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard gradient className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Pro Subscription Active</h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {currentPlan?.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Your subscription renews on {subscriptionEnd && formatDate(subscriptionEnd)}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <GradientButton
              variant="outline"
              onClick={() => openPortal()}
              disabled={portalLoading}
            >
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </GradientButton>
            <GradientButton
              variant="ghost"
              onClick={() => refetch()}
            >
              Refresh Status
            </GradientButton>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  // Show subscription plans for non-subscribers
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard className="mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Upgrade to Pro</h3>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {(Object.entries(SUBSCRIPTION_PLANS) as [PlanKey, typeof SUBSCRIPTION_PLANS[PlanKey]][]).map(
            ([key, plan]) => (
              <div
                key={key}
                className={`relative p-4 rounded-xl border transition-all ${
                  key === "annual"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-secondary/30 hover:border-primary/50"
                }`}
              >
                {plan.savings && (
                  <Badge 
                    className="absolute -top-2 right-2 bg-accent/20 text-accent-foreground border-accent/30"
                  >
                    {plan.savings}
                  </Badge>
                )}
                
                <h4 className="font-semibold mb-1">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                </div>
                
                <GradientButton
                  className="w-full"
                  variant={key === "annual" ? "glow" : "default"}
                  onClick={() => handleSubscribe(key)}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Loading..." : "Subscribe"}
                </GradientButton>
              </div>
            )
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Cancel anytime. Secure payment via Stripe.
        </p>
      </GlassCard>
    </motion.div>
  );
};
