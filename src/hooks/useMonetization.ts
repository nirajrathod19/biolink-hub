import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type MonetizationStatus =
  | "NOT_ELIGIBLE"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "SUSPENDED"
  | "REJECTED";

export interface CreatorMonetization {
  id: string;
  user_id: string;
  status: MonetizationStatus;
  revenue_share_pct: number;
  applied_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export const useMonetizationStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["creator-monetization", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("creator_monetization")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as CreatorMonetization) || null;
    },
    enabled: !!user,
  });
};

export const useApplyForMonetization = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("creator_monetization").insert({
        user_id: user.id,
        status: "PENDING_REVIEW",
        applied_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-monetization", user?.id] });
      toast({
        title: "Application submitted",
        description: "Your monetization application is under review.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Could not apply", description: error.message, variant: "destructive" });
    },
  });
};

/* ---------------- Admin ---------------- */

export const useAllMonetizationApplications = () => {
  return useQuery({
    queryKey: ["admin-monetization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_monetization")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as CreatorMonetization[];
    },
  });
};

export const useReviewMonetization = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: MonetizationStatus;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("creator_monetization")
        .update({
          status,
          review_notes: notes ?? null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-monetization"] });
      toast({ title: "Monetization status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
};
