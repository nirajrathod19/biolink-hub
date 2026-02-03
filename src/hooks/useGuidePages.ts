import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GuidePage {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: "image" | "pdf" | "video";
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useGuidePages = () => {
  return useQuery({
    queryKey: ["guide-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guide_pages")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as GuidePage[];
    },
  });
};

export const useAllGuidePages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["guide-pages-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guide_pages")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data as GuidePage[];
    },
    enabled: !!user,
  });
};

export const useCreateGuidePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPage: {
      title: string;
      description?: string;
      file_url: string;
      file_type: "image" | "pdf" | "video";
      position?: number;
    }) => {
      // Get next position
      const { data: existingPages } = await supabase
        .from("guide_pages")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existingPages && existingPages.length > 0
        ? (existingPages[0].position || 0) + 1
        : 0;

      const { data, error } = await supabase
        .from("guide_pages")
        .insert({
          ...newPage,
          position: newPage.position ?? nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide-pages"] });
      queryClient.invalidateQueries({ queryKey: ["guide-pages-admin"] });
    },
  });
};

export const useUpdateGuidePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GuidePage> & { id: string }) => {
      const { data, error } = await supabase
        .from("guide_pages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide-pages"] });
      queryClient.invalidateQueries({ queryKey: ["guide-pages-admin"] });
    },
  });
};

export const useDeleteGuidePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("guide_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide-pages"] });
      queryClient.invalidateQueries({ queryKey: ["guide-pages-admin"] });
    },
  });
};

export const useReorderGuidePages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedPages: { id: string; position: number }[]) => {
      const updates = orderedPages.map(({ id, position }) =>
        supabase
          .from("guide_pages")
          .update({ position })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide-pages"] });
      queryClient.invalidateQueries({ queryKey: ["guide-pages-admin"] });
    },
  });
};

export const useUploadGuideFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `guides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("guide-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("guide-files")
        .getPublicUrl(filePath);

      return publicUrl;
    },
  });
};

export const useDeleteGuideFile = () => {
  return useMutation({
    mutationFn: async (fileUrl: string) => {
      // Extract path from URL
      const urlParts = fileUrl.split("/guide-files/");
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from("guide-files")
        .remove([filePath]);

      if (error) throw error;
    },
  });
};
