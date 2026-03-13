import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, X, Search, Wallet, CreditCard, Zap, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { 
  useSubscription, 
  useCreateCheckout, 
  usePayWithWallet,
  SUBSCRIPTION_PLANS,
  PlanKey 
} from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useExchangeRates, convertPrice, CURRENCIES } from "@/hooks/useExchangeRates";
import { useProfile } from "@/hooks/useProfile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface SubscriptionPlansProps {
  /** Render in compact "embed" mode for landing/profile pages (hides wallet, shows CTA to signup) */
  variant?: "full" | "embed";
}

export const SubscriptionPlans = ({ variant = "full" }: SubscriptionPlansProps) => {
  const { isSubscribed, currentPlan, subscriptionEnd, isLoading: statusLoading, refetch } = useSubscription();
  const { createCheckout, isLoading: checkoutLoading } = useCreateCheckout();
  const { payWithWallet, isLoading: walletLoading } = usePayWithWallet();
  const { data: rates, isLoading: ratesLoading } = useExchangeRates();
  const { data: profile } = useProfile();
  
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const walletBalance = profile?.wallet_balance ?? 0;
  const isEmbed = variant === "embed";

  const handleSubscribe = async (planKey: PlanKey) => {
    await createCheckout(planKey);
  };

  const handleWalletPay = async (planKey: PlanKey) => {
    await payWithWallet(planKey);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getConvertedPrice = (usdPrice: number, inrPrice: number) => {
    if (selectedCurrency === "INR") return `₹${inrPrice}`;
    if (selectedCurrency === "USD") return `$${usdPrice}`;
    if (!rates) return `$${usdPrice}`;
    const rate = rates[selectedCurrency];
    if (!rate) return `$${usdPrice}`;
    const curr = CURRENCIES.find(c => c.code === selectedCurrency);
    return `${curr?.symbol || ""}${convertPrice(usdPrice, rate)}`;
  };

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  if (statusLoading && !isEmbed) {
    return (
      <GlassCard className="mb-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </GlassCard>
    );
  }

  const currentTier = currentPlan === "full" ? "full" : currentPlan === "starter" ? "starter" : null;

  if (isSubscribed && !isEmbed) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard gradient className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Pro Subscription Active</h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {currentTier === "full" ? "Full Pro" : "Starter Pro"}
            </Badge>
          </div>
          {subscriptionEnd && (
            <p className="text-muted-foreground mb-4">
              Your subscription renews on {formatDate(subscriptionEnd)}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {(currentTier === "full" ? SUBSCRIPTION_PLANS.full.features : SUBSCRIPTION_PLANS.starter.features).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
          <GradientButton variant="ghost" onClick={() => refetch()}>
            Refresh Status
          </GradientButton>
        </GlassCard>
      </motion.div>
    );
  }

  const CurrencySelector = () => (
    <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-sm hover:bg-secondary transition-colors">
          <span className="font-medium">{selectedCurrency}</span>
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <Input
          placeholder="Search currency..."
          value={currencySearch}
          onChange={(e) => setCurrencySearch(e.target.value)}
          className="h-8 text-sm mb-2"
        />
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {filteredCurrencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                setSelectedCurrency(curr.code);
                setCurrencyOpen(false);
                setCurrencySearch("");
              }}
              className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-secondary transition-colors flex items-center justify-between ${
                selectedCurrency === curr.code ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <span>{curr.symbol} {curr.code}</span>
              <span className="text-xs text-muted-foreground">{curr.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className={isEmbed ? "" : "mb-6"}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Upgrade to Pro</h3>
          </div>
          <CurrencySelector />
        </div>

        {/* Wallet Balance Banner - only in full mode */}
        {!isEmbed && walletBalance > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Wallet Balance: <span className="text-primary">${walletBalance.toFixed(2)}</span>
            </span>
            <span className="text-xs text-muted-foreground ml-auto">Use wallet to pay instantly</span>
          </div>
        )}

        {/* Two-tier pricing cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {(Object.entries(SUBSCRIPTION_PLANS) as [PlanKey, typeof SUBSCRIPTION_PLANS[PlanKey]][]).map(
            ([key, plan]) => {
              const isFull = key === "full";
              const canPayWithWallet = walletBalance >= plan.price;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isFull ? 0.1 : 0 }}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-2xl p-6 transition-all ${
                    isFull
                      ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : "border-2 border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {/* Best Value badge for Full Pro */}
                  {isFull && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-lg shadow-primary/20 px-3 py-1 gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Best Value
                      </Badge>
                    </div>
                  )}

                  {/* Plan icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isFull ? "bg-primary/15" : "bg-secondary"}`}>
                    {isFull ? <Zap className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-muted-foreground" />}
                  </div>

                  <h4 className="font-display font-bold text-xl mb-1">{plan.name}</h4>

                  {plan.savings && (
                    <Badge variant="outline" className="mb-3 text-primary border-primary/30 text-xs">
                      {plan.savings}
                    </Badge>
                  )}

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-display font-extrabold">{getConvertedPrice(plan.price, plan.priceINR)}</span>
                    <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                  </div>

                  {selectedCurrency !== "INR" && selectedCurrency !== "USD" && (
                    <p className="text-xs text-muted-foreground mb-3">≈ ₹{plan.priceINR} INR • Live rate</p>
                  )}

                  {/* Features */}
                  <div className="space-y-2.5 my-5 pb-5 border-b border-border">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isFull ? "bg-primary/15" : "bg-secondary"}`}>
                          <Check className={`w-3 h-3 ${isFull ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <span className={isFull ? "font-medium" : ""}>{feature}</span>
                      </div>
                    ))}
                    {plan.excluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground/40">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted/30">
                          <X className="w-3 h-3" />
                        </div>
                        <span className="line-through">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {/* For embed mode, just link to signup */}
                    {isEmbed ? (
                      <a href="/signup" className="block">
                        <GradientButton className="w-full" variant={isFull ? "glow" : "outline"}>
                          {isFull ? "Get Full Pro" : `Get ${plan.name}`}
                        </GradientButton>
                      </a>
                    ) : (
                      <>
                        {canPayWithWallet && (
                          <Button
                            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleWalletPay(key)}
                            disabled={walletLoading}
                          >
                            <Wallet className="w-4 h-4" />
                            {walletLoading ? "Processing..." : `Pay with Wallet ($${plan.price})`}
                          </Button>
                        )}
                        <GradientButton
                          className="w-full"
                          variant={isFull && !canPayWithWallet ? "glow" : "default"}
                          onClick={() => handleSubscribe(key)}
                          disabled={checkoutLoading}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          {checkoutLoading ? "Loading..." : canPayWithWallet ? "Pay with Razorpay" : `Get ${plan.name}`}
                        </GradientButton>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            }
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-5">
          Cancel anytime • Wallet payments auto-renew monthly • Card payments via Razorpay
        </p>
      </div>
    </motion.div>
  );
};