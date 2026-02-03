import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Price IDs from Stripe
export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: "price_1SuH89RcxPa7mlJfqKm9CWlu",
    name: "Monthly",
    price: 3,
    interval: "month",
    savings: null,
  },
  quarterly: {
    priceId: "price_1SuH8ZRcxPa7mlJfs7ynvtqr",
    name: "4 Months",
    price: 11,
    interval: "4 months",
    savings: "Save $1",
  },
  annual: {
    priceId: "price_1SuH8oRcxPa7mlJfPoWSNpQH",
    name: "Annual",
    price: 30,
    interval: "year",
    savings: "Save $6",
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

interface SubscriptionStatus {
  subscribed: boolean;
  plan: string | null;
  subscription_end: string | null;
  price_id: string | null;
}

export const useSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus, isLoading, refetch } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        return { subscribed: false, plan: null, subscription_end: null, price_id: null };
      }
      
      return data;
    },
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: true,
  });

  return {
    subscriptionStatus,
    isLoading,
    refetch,
    isSubscribed: subscriptionStatus?.subscribed ?? false,
    currentPlan: subscriptionStatus?.plan ?? null,
    subscriptionEnd: subscriptionStatus?.subscription_end ?? null,
  };
};

export const useCreateCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createCheckout = async (planKey: PlanKey) => {
    setIsLoading(true);
    try {
      const plan = SUBSCRIPTION_PLANS[planKey];
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.priceId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Open checkout in new tab
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckout, isLoading };
};

export const useCustomerPortal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const openPortal = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Customer portal error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { openPortal, isLoading };
};
