import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  is_active: boolean;
  position: number;
  created_at: string;
}

export const useSocialLinks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["social-links", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as SocialLink[];
    },
    enabled: !!user,
  });
};

export const useCreateSocialLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newLink: { platform: string; url: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existingLinks } = await supabase
        .from("social_links")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existingLinks && existingLinks.length > 0 
        ? (existingLinks[0].position || 0) + 1 
        : 0;

      const { data, error } = await supabase
        .from("social_links")
        .insert({
          ...newLink,
          user_id: user.id,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links", user?.id] });
    },
  });
};

export const useUpdateSocialLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialLink> & { id: string }) => {
      const { data, error } = await supabase
        .from("social_links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links", user?.id] });
    },
  });
};

export const useDeleteSocialLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links", user?.id] });
    },
  });
};

export const usePublicSocialLinks = (userId: string) => {
  return useQuery({
    queryKey: ["public-social-links", userId],
    queryFn: async () => {
      // Query social_links directly - RLS now allows public read access for active links
      const { data, error } = await supabase
        .from("social_links")
        .select("id, platform, url, is_active, position, created_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as SocialLink[];
    },
    enabled: !!userId,
  });
};
