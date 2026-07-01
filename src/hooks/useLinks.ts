import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string | null;
  badge: string | null;
  is_active: boolean;
  position: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  animation?: string | null;
  is_highlighted?: boolean;
  lock_type?: string | null;
  lock_password?: string | null;
}

export const useLinks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["links", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Link[];
    },
    enabled: !!user,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newLink: { title: string; url: string; icon?: string; badge?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existingLinks } = await supabase
        .from("links")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existingLinks && existingLinks.length > 0 
        ? (existingLinks[0].position || 0) + 1 
        : 0;

      const { data, error } = await supabase
        .from("links")
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
      queryClient.invalidateQueries({ queryKey: ["links", user?.id] });
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Link> & { id: string }) => {
      const { data, error } = await supabase
        .from("links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.id] });
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.id] });
    },
  });
};

export const useReorderLinks = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderedLinks: { id: string; position: number }[]) => {
      if (!user) throw new Error("Not authenticated");

      // Update each link's position
      const updates = orderedLinks.map(({ id, position }) =>
        supabase
          .from("links")
          .update({ position })
          .eq("id", id)
          .eq("user_id", user.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", user?.id] });
    },
  });
};

export const usePublicLinks = (userId: string) => {
  return useQuery({
    queryKey: ["public-links", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) throw error;

      // Client-side schedule window filter: hide links outside [scheduled_start, scheduled_end].
      const now = Date.now();
      return (data as Link[]).filter((l) => {
        const startOk = !l.scheduled_start || new Date(l.scheduled_start).getTime() <= now;
        const endOk = !l.scheduled_end || new Date(l.scheduled_end).getTime() >= now;
        return startOk && endOk;
      });
    },
    // Refresh every minute so scheduled links appear/disappear without a full reload.
    refetchInterval: 60_000,
    enabled: !!userId,
  });
};