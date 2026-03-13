import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorPost {
  id: string;
  user_id: string;
  content: string;
  hearts_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  visitor_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

// Public: fetch posts for a creator's bio page
export const usePublicCreatorPosts = (userId: string) => {
  return useQuery({
    queryKey: ["public-creator-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_posts")
        .select("*")
        .eq("user_id", userId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as CreatorPost[];
    },
    enabled: !!userId,
  });
};

// Creator: fetch own posts
export const useCreatorPosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["creator-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("creator_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CreatorPost[];
    },
    enabled: !!user,
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("creator_posts")
        .insert({ user_id: user.id, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-posts", user?.id] });
    },
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("creator_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-posts", user?.id] });
    },
  });
};

// Toggle pin
export const useTogglePin = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase
        .from("creator_posts")
        .update({ is_pinned })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-posts", user?.id] });
    },
  });
};

// Heart a post (visitor action)
export const useHeartPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, visitorIp }: { postId: string; visitorIp: string }) => {
      // Insert reaction (unique constraint prevents duplicates)
      const { error: reactError } = await supabase
        .from("post_reactions")
        .insert({ post_id: postId, visitor_ip: visitorIp });

      if (reactError) {
        if (reactError.code === "23505") return; // Already reacted
        throw reactError;
      }

      // Increment hearts_count via direct SQL update
      const { data: post } = await supabase
        .from("creator_posts")
        .select("hearts_count")
        .eq("id", postId)
        .single();

      if (post) {
        await supabase
          .from("creator_posts")
          .update({ hearts_count: (post.hearts_count || 0) + 1 })
          .eq("id", postId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["public-creator-posts"] });
    },
  });
};

// Public comments for a post
export const usePublicComments = (postId: string) => {
  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .eq("is_approved", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as PostComment[];
    },
    enabled: !!postId,
  });
};

// Submit a comment
export const useSubmitComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, visitorName }: { postId: string; content: string; visitorName?: string }) => {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          content,
          visitor_name: visitorName || "Anonymous",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] });
    },
  });
};

// Creator: manage comments (approve/delete)
export const useManageComments = () => {
  const queryClient = useQueryClient();

  return {
    approve: useMutation({
      mutationFn: async (commentId: string) => {
        const { error } = await supabase
          .from("post_comments")
          .update({ is_approved: true })
          .eq("id", commentId);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["post-comments"] });
        queryClient.invalidateQueries({ queryKey: ["pending-comments"] });
      },
    }),
    remove: useMutation({
      mutationFn: async (commentId: string) => {
        const { error } = await supabase
          .from("post_comments")
          .delete()
          .eq("id", commentId);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["post-comments"] });
        queryClient.invalidateQueries({ queryKey: ["pending-comments"] });
      },
    }),
  };
};
