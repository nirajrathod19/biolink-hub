import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Order {
  id: string;
  creator_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string | null;
  items: any;
  total_amount: number;
  payment_method: string | null;
  status: string | null;
  transaction_id: string | null;
  created_at: string;
  currency: string | null;
  tracking_id: string | null;
  courier_partner: string | null;
  package_weight_kg: number | null;
  base_amount: number | null;
  delivery_charges: number | null;
  platform_fee: number | null;
  seller_payout_amount: number | null;
  payout_status: string | null;
}

export const useCreatorOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["creator-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });
};