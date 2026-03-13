import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QAQuestion {
  id: string;
  creator_user_id: string;
  question: string;
  asker_name: string;
  asker_email: string | null;
  is_paid: boolean;
  tip_amount: number;
  answer_text: string | null;
  answer_video_url: string | null;
  is_public: boolean;
  is_answered: boolean;
  created_at: string;
  answered_at: string | null;
}

// Public: view answered questions on a creator's bio page
export const usePublicQA = (creatorUserId: string) => {
  return useQuery({
    queryKey: ["public-qa", creatorUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qa_questions")
        .select("*")
        .eq("creator_user_id", creatorUserId)
        .eq("is_public", true)
        .eq("is_answered", true)
        .order("answered_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as QAQuestion[];
    },
    enabled: !!creatorUserId,
  });
};

// Submit a question (visitor)
export const useSubmitQuestion = () => {
  return useMutation({
    mutationFn: async ({
      creatorUserId,
      question,
      askerName,
      askerEmail,
    }: {
      creatorUserId: string;
      question: string;
      askerName?: string;
      askerEmail?: string;
    }) => {
      const { data, error } = await supabase
        .from("qa_questions")
        .insert({
          creator_user_id: creatorUserId,
          question,
          asker_name: askerName || "Anonymous",
          asker_email: askerEmail || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};

// Creator: fetch all their questions
export const useCreatorQuestions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["creator-questions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("qa_questions")
        .select("*")
        .eq("creator_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as QAQuestion[];
    },
    enabled: !!user,
  });
};

// Creator: answer a question
export const useAnswerQuestion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      answer_text,
      is_public,
    }: {
      id: string;
      answer_text: string;
      is_public?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("qa_questions")
        .update({
          answer_text,
          is_answered: true,
          is_public: is_public ?? true,
          answered_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-questions", user?.id] });
    },
  });
};

// Creator: delete a question
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("qa_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-questions", user?.id] });
    },
  });
};
