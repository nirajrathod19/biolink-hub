import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { runFraudCheck } from "@/lib/fraudDetection";

export interface Transaction {
  id: string;
  user_id: string;
  type: "earning" | "referral" | "withdrawal" | "subscription";
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface WithdrawalRequest {
  amount: number;
  payment_method: "paypal" | "bank_transfer";
  payment_details: {
    paypal_email?: string;
    bank_name?: string;
    account_number?: string;
    routing_number?: string;
    account_holder?: string;
  };
}

export const useTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`transactions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
};

export const useWithdrawals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["withdrawals", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useRequestWithdrawal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: WithdrawalRequest) => {
      if (!user) throw new Error("Not authenticated");

      // First check wallet balance and get profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance, created_at, total_clicks")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile || profile.wallet_balance < request.amount) {
        throw new Error("Insufficient wallet balance");
      }

      if (request.amount < 3) {
        throw new Error("Minimum withdrawal amount is $3");
      }

      // Get previous withdrawals for fraud check
      const { data: previousWithdrawals } = await supabase
        .from("withdrawals")
        .select("amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Run fraud detection
      const fraudResult = runFraudCheck({
        paypalEmail: request.payment_details.paypal_email,
        amount: request.amount,
        walletBalance: profile.wallet_balance,
        previousWithdrawals: previousWithdrawals || [],
        accountCreatedAt: profile.created_at,
        totalClicks: profile.total_clicks || 0,
      });

      // Create withdrawal request with fraud flags
      const { data, error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user.id,
          amount: request.amount,
          payment_method: request.payment_method,
          payment_details: request.payment_details,
          status: "pending",
          fraud_flags: fraudResult.flags.length > 0 ? JSON.parse(JSON.stringify(fraudResult.flags)) : null,
          fraud_score: fraudResult.score,
          is_flagged: fraudResult.isFlagged,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { ...data, fraudResult };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      
      if (data.fraudResult?.isFlagged) {
        toast({
          title: "Withdrawal requested",
          description: "Your request is under review and may take longer to process.",
        });
      } else {
        toast({
          title: "Withdrawal requested",
          description: "Your withdrawal request has been submitted for approval.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useProcessWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawal_id, action }: { withdrawal_id: string; action: "approve" | "reject" }) => {
      const { data, error } = await supabase.functions.invoke("process-withdrawal", {
        body: { withdrawal_id, action },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] });
      toast({
        title: variables.action === "approve" ? "Withdrawal approved" : "Withdrawal rejected",
        description: variables.action === "approve" 
          ? "The withdrawal has been processed." 
          : "The withdrawal has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error processing withdrawal",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePayWithWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: "monthly" | "quarterly" | "annual") => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("pay-with-wallet", {
        body: { plan },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast({
        title: "Pro activated!",
        description: `Your ${data.plan} subscription is now active. $${data.price} deducted from wallet.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMovePendingToWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("move-pending-to-wallet");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "Revenue transferred",
        description: `Moved $${data.total_moved?.toFixed(2) || 0} from pending to wallet for ${data.processed || 0} users.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
