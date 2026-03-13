import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Coupon {
  id: string;
  creator_id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export const useCoupons = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["coupons", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!user,
  });
};

export const useCreateCoupon = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, "id" | "creator_id" | "used_count" | "created_at">) => {
      const { error } = await supabase.from("coupons").insert({
        ...coupon,
        creator_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons", user?.id] }),
  });
};

export const useUpdateCoupon = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { error } = await supabase.from("coupons").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons", user?.id] }),
  });
};

export const useDeleteCoupon = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons", user?.id] }),
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, creatorId, orderAmount }: { code: string; creatorId: string; orderAmount: number }) => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("creator_id", creatorId)
        .eq("code", code.toUpperCase().trim())
        .eq("is_active", true)
        .single();
      if (error || !data) throw new Error("Invalid coupon code");
      
      const coupon = data as Coupon;
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) throw new Error("Coupon has expired");
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) throw new Error("Coupon usage limit reached");
      if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) throw new Error(`Minimum order amount is ${coupon.min_order_amount}`);

      const discount = coupon.type === "percentage"
        ? (orderAmount * coupon.value) / 100
        : Math.min(coupon.value, orderAmount);

      return { coupon, discount: Math.round(discount * 100) / 100 };
    },
  });
};