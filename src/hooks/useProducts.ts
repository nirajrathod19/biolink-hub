import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  slug?: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  preview_image_url: string | null;
  file_url: string | null;
  category: string | null;
  allow_cod: boolean;
  active: boolean;
  created_at: string;
}

export const useProducts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });
};

export const usePublicProducts = (creatorId: string) => {
  return useQuery({
    queryKey: ["public-products", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", creatorId)
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!creatorId,
  });
};

export const useProductCategories = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["product-categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("creator_id", user!.id)
        .not("category", "is", null);
      if (error) throw error;
      const unique = [...new Set(data.map((d) => d.category).filter(Boolean))] as string[];
      return unique;
    },
    enabled: !!user,
  });
};

export const useCreateProduct = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "creator_id" | "created_at">) => {
      const { error } = await supabase.from("products").insert({
        ...product,
        creator_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", user?.id] }),
  });
};

export const useUpdateProduct = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", user?.id] }),
  });
};

export const useDeleteProduct = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", user?.id] }),
  });
};