import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorSubscriber {
  id: string;
  creator_id: string;
  subscriber_email: string;
  created_at: string;
}

export const useSubscribers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscribers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("creator_subscribers")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CreatorSubscriber[];
    },
    enabled: !!user,
  });
};

export const useAddSubscriber = () => {
  return useMutation({
    mutationFn: async ({ creatorId, email }: { creatorId: string; email: string }) => {
      const { data, error } = await supabase
        .from("creator_subscribers")
        .insert({ creator_id: creatorId, subscriber_email: email })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") throw new Error("You're already subscribed!");
        throw error;
      }
      return data;
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("creator_subscribers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers", user?.id] });
    },
  });
};
