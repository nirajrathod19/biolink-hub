import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DigitalProduct {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  file_url: string | null;
  preview_image: string | null;
  download_count: number;
  is_active: boolean;
  upsell_product_ids?: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useDigitalProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["digital-products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("digital_products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DigitalProduct[];
    },
    enabled: !!user,
  });
};

export const usePublicDigitalProducts = (userId: string) => {
  return useQuery({
    queryKey: ["public-digital-products", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_products")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DigitalProduct[];
    },
    enabled: !!userId,
  });
};

export const useCreateDigitalProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (product: Omit<DigitalProduct, "id" | "user_id" | "download_count" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("digital_products")
        .insert({
          ...product,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-products", user?.id] });
    },
  });
};

export const useUpdateDigitalProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DigitalProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from("digital_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-products", user?.id] });
    },
  });
};

export const useDeleteDigitalProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("digital_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-products", user?.id] });
    },
  });
};
