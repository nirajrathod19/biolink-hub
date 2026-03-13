import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// Two Pro tiers
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter Pro",
    price: 3,
    priceINR: 249,
    interval: "month",
    savings: null,
    features: [
      "50% Revenue Share",
      "Basic Analytics",
      "Links & Social Icons",
      "Digital Products",
      "AI Prompts Marketplace",
    ],
    excluded: [
      "Audio Lab",
      "Advanced Analytics",
      "Priority Support",
      "Remove Branding",
      "100% Revenue Share",
    ],
  },
  full: {
    name: "Full Pro",
    price: 5,
    priceINR: 419,
    interval: "month",
    savings: "Best Value",
    features: [
      "100% Revenue Share",
      "Advanced Analytics",
      "Audio Lab Access",
      "Digital Storefront",
      "AI Prompts Marketplace",
      "Priority Support",
      "Remove Platform Branding",
      "Early Access Features",
    ],
    excluded: [],
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

interface SubscriptionStatus {
  subscribed: boolean;
  plan: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus, isLoading, refetch } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) return { subscribed: false, plan: null, subscription_end: null };

      // Check wallet_subscriptions for active subscription
      const { data: walletSub, error } = await supabase
        .from("wallet_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking subscription:", error);
        return { subscribed: false, plan: null, subscription_end: null };
      }

      if (walletSub) {
        return {
          subscribed: true,
          plan: walletSub.plan,
          subscription_end: walletSub.next_renewal_at,
        };
      }

      // Also check profile is_pro flag as fallback
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("user_id", user.id)
        .single();

      if (profile?.is_pro) {
        return { subscribed: true, plan: "pro", subscription_end: null };
      }

      return { subscribed: false, plan: null, subscription_end: null };
    },
    enabled: !!user,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  return {
    subscriptionStatus,
    isLoading,
    refetch,
    isSubscribed: subscriptionStatus?.subscribed ?? false,
    currentPlan: subscriptionStatus?.plan ?? null,
    currentPriceId: null, // No longer used with Razorpay
    subscriptionEnd: subscriptionStatus?.subscription_end ?? null,
  };
};

// Razorpay checkout hook
export const useCreateCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCheckout = async (planKey: PlanKey) => {
    setIsLoading(true);
    try {
      const plan = SUBSCRIPTION_PLANS[planKey];

      // 1. Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { plan: planKey, amount: plan.priceINR, currency: "INR" },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const { order_id, amount, currency, key_id } = data;

      // 2. Load Razorpay script if not loaded
      await loadRazorpayScript();

      // 3. Open Razorpay checkout modal
      return new Promise<void>((resolve, reject) => {
        const options = {
          key: key_id,
          amount,
          currency,
          name: "Brioo",
          description: `${plan.name} - Monthly Subscription`,
          order_id,
          handler: async (response: any) => {
            try {
              // 4. Verify payment on backend
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                "verify-razorpay-subscription",
                {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    plan: planKey,
                  },
                }
              );

              if (verifyError) throw new Error(verifyError.message);
              if (verifyData?.error) throw new Error(verifyData.error);

              toast({
                title: "🎉 Pro Activated!",
                description: `${plan.name} subscription is now active.`,
              });

              queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
              queryClient.invalidateQueries({ queryKey: ["profile"] });
              resolve();
            } catch (err: any) {
              toast({
                title: "Verification Failed",
                description: err.message || "Payment verification failed. Contact support.",
                variant: "destructive",
              });
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              resolve();
            },
          },
          theme: {
            color: "#2FA885",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          toast({
            title: "Payment Failed",
            description: response.error?.description || "Payment could not be processed.",
            variant: "destructive",
          });
          setIsLoading(false);
          resolve();
        });
        rzp.open();
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckout, isLoading };
};

export const usePayWithWallet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const payWithWallet = async (planKey: PlanKey) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pay-with-wallet", {
        body: { plan: planKey },
      });

      if (error) throw new Error(error.message);

      if (data?.error) {
        toast({
          title: "Payment Failed",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "🎉 Pro Activated!",
        description: `${data.plan} activated via wallet. New balance: $${data.new_balance?.toFixed(2)}`,
      });

      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      return true;
    } catch (error: any) {
      console.error("Wallet payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process wallet payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { payWithWallet, isLoading };
};

// No longer needed - kept as stub for compatibility
export const useCustomerPortal = () => {
  return { openPortal: async () => {}, isLoading: false };
};

// Helper to load Razorpay script dynamically
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}