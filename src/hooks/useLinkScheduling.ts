import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type LinkAnimation = 'none' | 'pulse' | 'bounce' | 'shake' | 'glow' | 'wobble';

export interface LinkSchedule {
  id: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  animation: LinkAnimation | null;
  is_highlighted: boolean;
}

export const useUpdateLinkSchedule = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      scheduled_start, 
      scheduled_end, 
      animation, 
      is_highlighted 
    }: LinkSchedule) => {
      const { data, error } = await supabase
        .from("links")
        .update({
          scheduled_start,
          scheduled_end,
          animation,
          is_highlighted,
        })
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

// Check if a link should be visible based on schedule
export const isLinkScheduledActive = (
  scheduledStart: string | null,
  scheduledEnd: string | null
): boolean => {
  const now = new Date();
  
  if (scheduledStart && new Date(scheduledStart) > now) {
    return false; // Not yet started
  }
  
  if (scheduledEnd && new Date(scheduledEnd) < now) {
    return false; // Already ended
  }
  
  return true;
};

// Get animation class for link
export const getLinkAnimationClass = (animation: string | null): string => {
  switch (animation) {
    case 'pulse':
      return 'animate-pulse';
    case 'bounce':
      return 'animate-bounce';
    case 'shake':
      return 'animate-[shake_0.5s_ease-in-out_infinite]';
    case 'glow':
      return 'animate-[glow_1.5s_ease-in-out_infinite]';
    case 'wobble':
      return 'animate-[wobble_1s_ease-in-out_infinite]';
    default:
      return '';
  }
};
