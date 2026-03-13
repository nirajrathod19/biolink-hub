import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DisplayRule } from "@/lib/visitorDetection";

export const useLinkDisplayRules = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["link-display-rules", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_display_rules")
        .select("*")
        .eq("user_id", user!.id)
        .order("priority", { ascending: true });
      if (error) throw error;
      return data as DisplayRule[];
    },
    enabled: !!user,
  });
};

export const usePublicDisplayRules = (userId: string) => {
  return useQuery({
    queryKey: ["public-display-rules", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_display_rules")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("priority", { ascending: true });
      if (error) throw error;
      return data as DisplayRule[];
    },
    enabled: !!userId,
  });
};

export const useCreateDisplayRule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<DisplayRule, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("link_display_rules")
        .insert({ ...rule, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-display-rules", user?.id] });
    },
  });
};

export const useUpdateDisplayRule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DisplayRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("link_display_rules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-display-rules", user?.id] });
    },
  });
};

export const useDeleteDisplayRule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("link_display_rules")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-display-rules", user?.id] });
    },
  });
};

export const useReorderDisplayRules = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedRules: { id: string; priority: number }[]) => {
      for (const rule of orderedRules) {
        const { error } = await supabase
          .from("link_display_rules")
          .update({ priority: rule.priority })
          .eq("id", rule.id)
          .eq("user_id", user!.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-display-rules", user?.id] });
    },
  });
};