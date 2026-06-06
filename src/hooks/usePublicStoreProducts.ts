import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  image_url?: string;
  checkout_url: string;
  platform: string;
}

export interface StoreIntegrationPublic {
  id: string;
  platform: string;
  store_domain: string | null;
  store_name: string | null;
  is_active: boolean;
}

// Fetch active store integrations for a user
export const usePublicStoreIntegrations = (userId: string) => {
  return useQuery({
    queryKey: ["public-store-integrations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("store_integrations_public" as any)
        .select("id, platform, store_domain, store_name, is_active")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;
      return data as StoreIntegrationPublic[];
    },
    enabled: !!userId,
  });
};

// Build checkout URL for different platforms
export const getCheckoutUrl = (
  platform: string,
  storeDomain: string | null,
  productId?: string,
  productHandle?: string
): string => {
  switch (platform) {
    case "shopify":
      if (!storeDomain) return "#";
      // Shopify product page URL
      const shopifyDomain = storeDomain.includes("myshopify.com")
        ? storeDomain.replace(".myshopify.com", "")
        : storeDomain;
      return productHandle
        ? `https://${shopifyDomain}.myshopify.com/products/${productHandle}`
        : `https://${shopifyDomain}.myshopify.com`;

    case "wix":
      return storeDomain ? `https://${storeDomain}` : "#";

    case "bigcommerce":
      return storeDomain ? `https://${storeDomain}` : "#";

    case "ebay":
      return productId ? `https://www.ebay.com/itm/${productId}` : "https://www.ebay.com";

    case "etsy":
      return storeDomain
        ? `https://www.etsy.com/shop/${storeDomain}`
        : "https://www.etsy.com";

    case "amazon":
      return productId
        ? `https://www.amazon.com/dp/${productId}`
        : "https://www.amazon.com";

    case "facebook":
      return "https://www.facebook.com/marketplace";

    default:
      return "#";
  }
};

// Get platform-specific branding
export const getPlatformBranding = (platform: string) => {
  const brands: Record<string, { name: string; icon: string; color: string }> = {
    shopify: { name: "Shopify", icon: "🛍️", color: "#96bf48" },
    wix: { name: "Wix", icon: "🌐", color: "#0C6EFC" },
    bigcommerce: { name: "BigCommerce", icon: "🏪", color: "#121118" },
    ebay: { name: "eBay", icon: "🏷️", color: "#E53238" },
    etsy: { name: "Etsy", icon: "🎨", color: "#F56400" },
    amazon: { name: "Amazon", icon: "📦", color: "#FF9900" },
    facebook: { name: "Facebook Shop", icon: "📘", color: "#1877F2" },
  };

  return brands[platform] || { name: platform, icon: "🏪", color: "#8B5CF6" };
};
