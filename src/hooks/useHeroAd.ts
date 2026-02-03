import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroAd {
  id: string;
  title: string;
  url: string;
  image_url: string | null;
  is_active: boolean;
  is_hero: boolean;
  click_count: number;
  category: string;
  created_at: string;
}

// Available interest categories
export const INTEREST_CATEGORIES = [
  { id: "tech", name: "Technology", icon: "💻" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "fashion", name: "Fashion & Beauty", icon: "👗" },
  { id: "fitness", name: "Fitness & Health", icon: "💪" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "food", name: "Food & Cooking", icon: "🍕" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "business", name: "Business & Finance", icon: "💼" },
  { id: "education", name: "Education", icon: "📚" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "art", name: "Art & Design", icon: "🎨" },
];

// Fetch the active hero ad (for public profile pages) - matches user interests
export const useHeroAd = (userInterests?: string[]) => {
  return useQuery({
    queryKey: ["hero-ad", userInterests],
    queryFn: async () => {
      // First, try to find an ad matching user interests
      if (userInterests && userInterests.length > 0) {
        const { data: matchedAd, error: matchError } = await supabase
          .from("ads")
          .select("*")
          .eq("is_hero", true)
          .eq("is_active", true)
          .in("category", userInterests)
          .limit(1)
          .maybeSingle();

        if (!matchError && matchedAd) {
          return matchedAd as HeroAd;
        }
      }

      // Fallback to general hero ad
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("is_hero", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching hero ad:", error);
        return null;
      }

      return data as HeroAd | null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Fetch ads matching user interests for interstitial
export const useInterestAds = (userInterests?: string[]) => {
  return useQuery({
    queryKey: ["interest-ads", userInterests],
    queryFn: async () => {
      let query = supabase
        .from("ads")
        .select("*")
        .eq("is_active", true);

      // Filter by interests if available
      if (userInterests && userInterests.length > 0) {
        query = query.in("category", [...userInterests, "general"]);
      }

      const { data, error } = await query.order("click_count", { ascending: true }).limit(5);

      if (error) {
        console.error("Error fetching interest ads:", error);
        return [];
      }

      return data as HeroAd[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Fetch all ads (for admin management)
export const useAllAds = () => {
  return useQuery({
    queryKey: ["all-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HeroAd[];
    },
  });
};

// Create/Update hero ad
export const useUpsertHeroAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: {
      title: string;
      url: string;
      image_url: string | null;
      is_active: boolean;
      category?: string;
    }) => {
      // First, check if a hero ad already exists
      const { data: existingAd } = await supabase
        .from("ads")
        .select("id")
        .eq("is_hero", true)
        .maybeSingle();

      if (existingAd) {
        // Update existing hero ad
        const { data, error } = await supabase
          .from("ads")
          .update({
            title: ad.title,
            url: ad.url,
            image_url: ad.image_url,
            is_active: ad.is_active,
            category: ad.category || "general",
          })
          .eq("id", existingAd.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new hero ad (let DB generate UUID)
        const { data, error } = await supabase
          .from("ads")
          .insert({
            title: ad.title,
            url: ad.url,
            image_url: ad.image_url,
            is_active: ad.is_active,
            is_hero: true,
            category: ad.category || "general",
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-ad"] });
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      queryClient.invalidateQueries({ queryKey: ["interest-ads"] });
    },
  });
};

// Create new ad
export const useCreateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: {
      title: string;
      url: string;
      image_url: string | null;
      is_active: boolean;
      is_hero: boolean;
      category: string;
    }) => {
      const { data, error } = await supabase
        .from("ads")
        .insert(ad)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-ad"] });
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      queryClient.invalidateQueries({ queryKey: ["interest-ads"] });
    },
  });
};

// Update ad
export const useUpdateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroAd> & { id: string }) => {
      const { data, error } = await supabase
        .from("ads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-ad"] });
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      queryClient.invalidateQueries({ queryKey: ["interest-ads"] });
    },
  });
};

// Track ad click
export const useTrackAdClick = () => {
  return useMutation({
    mutationFn: async (adId: string) => {
      // Get current click count and increment
      const { data: currentAd } = await supabase
        .from("ads")
        .select("click_count")
        .eq("id", adId)
        .single();

      const newCount = (currentAd?.click_count || 0) + 1;

      await supabase
        .from("ads")
        .update({ click_count: newCount })
        .eq("id", adId);
    },
  });
};
