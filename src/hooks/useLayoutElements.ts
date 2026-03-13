import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LayoutElement {
  id: string;
  user_id: string;
  element_type: string;
  element_id: string | null;
  position_x: number;
  position_y: number;
  z_index: number;
  opacity: number;
  width: number;
  height: number;
  is_absolute: boolean;
  custom_asset_url: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useLayoutElements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["layout-elements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("profile_layout_elements")
        .select("*")
        .eq("user_id", user.id)
        .order("z_index", { ascending: true });
      if (error) throw error;
      return data as LayoutElement[];
    },
    enabled: !!user,
  });
};

export const usePublicLayoutElements = (userId: string) => {
  return useQuery({
    queryKey: ["public-layout-elements", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_layout_elements")
        .select("*")
        .eq("user_id", userId)
        .order("z_index", { ascending: true });
      if (error) throw error;
      return data as LayoutElement[];
    },
    enabled: !!userId,
  });
};

export const useUpsertLayoutElement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (element: Partial<LayoutElement> & { id?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const payload = { ...element, user_id: user.id };

      if (element.id) {
        const { data, error } = await supabase
          .from("profile_layout_elements")
          .update(payload)
          .eq("id", element.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("profile_layout_elements")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout-elements", user?.id] });
    },
  });
};

export const useDeleteLayoutElement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profile_layout_elements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout-elements", user?.id] });
    },
  });
};