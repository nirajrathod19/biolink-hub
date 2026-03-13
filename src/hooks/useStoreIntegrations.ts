 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useToast } from "@/hooks/use-toast";
 
 export type StorePlatform = "shopify" | "wix" | "bigcommerce" | "ebay" | "facebook" | "etsy" | "amazon";
 
 export interface StoreIntegration {
   id: string;
   user_id: string;
   platform: StorePlatform;
   store_domain: string | null;
   store_name: string | null;
   access_token: string | null;
   api_key: string | null;
   api_secret: string | null;
   is_active: boolean;
   settings: Record<string, any>;
   created_at: string;
   updated_at: string;
 }
 
 export interface StoreConfig {
   platform: StorePlatform;
   store_domain?: string;
   store_name?: string;
   access_token?: string;
   api_key?: string;
   api_secret?: string;
   settings?: Record<string, any>;
 }
 
type PlatformField = "store_domain" | "access_token" | "api_key" | "api_secret";

interface PlatformConfigItem {
  name: string;
  icon: string;
  fields: PlatformField[];
  domainSuffix?: string;
  description: string;
}

export const PLATFORM_CONFIG: Record<StorePlatform, PlatformConfigItem> = {
   shopify: {
     name: "Shopify",
     icon: "🛍️",
    fields: ["store_domain", "access_token"] as PlatformField[],
     domainSuffix: ".myshopify.com",
     description: "Connect your Shopify store to display products",
   },
   wix: {
     name: "Wix eCommerce",
     icon: "🌐",
    fields: ["store_domain", "api_key", "api_secret"] as PlatformField[],
     description: "Connect your Wix store with API credentials",
   },
   bigcommerce: {
     name: "BigCommerce",
     icon: "🏪",
    fields: ["store_domain", "access_token", "api_key"] as PlatformField[],
     description: "Connect your BigCommerce store",
   },
   ebay: {
     name: "eBay",
     icon: "🏷️",
    fields: ["api_key", "api_secret"] as PlatformField[],
     description: "Connect your eBay seller account",
   },
   facebook: {
     name: "Facebook Shop",
     icon: "📘",
    fields: ["access_token"] as PlatformField[],
     description: "Connect your Facebook Shop catalog",
   },
   etsy: {
     name: "Etsy",
     icon: "🎨",
    fields: ["api_key", "api_secret"] as PlatformField[],
     description: "Connect your Etsy shop",
   },
   amazon: {
     name: "Amazon",
     icon: "📦",
    fields: ["api_key", "api_secret"] as PlatformField[],
     description: "Connect your Amazon seller account",
   },
};
 
 export const useStoreIntegrations = () => {
   const { user } = useAuth();
   const { toast } = useToast();
   const queryClient = useQueryClient();
 
   const { data: integrations, isLoading } = useQuery({
     queryKey: ["store-integrations", user?.id],
     queryFn: async () => {
       if (!user?.id) return [];
 
       const { data, error } = await supabase
         .from("store_integrations")
         .select("*")
         .eq("user_id", user.id)
         .order("created_at", { ascending: true });
 
       if (error) throw error;
       return data as StoreIntegration[];
     },
     enabled: !!user?.id,
   });
 
   const addIntegration = useMutation({
     mutationFn: async (config: StoreConfig) => {
       if (!user?.id) throw new Error("Not authenticated");
 
       const { data, error } = await supabase
         .from("store_integrations")
         .insert({
           user_id: user.id,
           platform: config.platform,
           store_domain: config.store_domain || null,
           store_name: config.store_name || null,
           access_token: config.access_token || null,
           api_key: config.api_key || null,
           api_secret: config.api_secret || null,
           settings: config.settings || {},
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["store-integrations"] });
       toast({
         title: "Store connected!",
         description: "Your store integration has been added successfully.",
       });
     },
     onError: (error: any) => {
       toast({
         title: "Error",
         description: error.message || "Failed to add store integration.",
         variant: "destructive",
       });
     },
   });
 
   const updateIntegration = useMutation({
     mutationFn: async ({ id, ...config }: Partial<StoreConfig> & { id: string }) => {
       if (!user?.id) throw new Error("Not authenticated");
 
       const { data, error } = await supabase
         .from("store_integrations")
         .update({
           store_domain: config.store_domain,
           store_name: config.store_name,
           access_token: config.access_token,
           api_key: config.api_key,
           api_secret: config.api_secret,
           settings: config.settings,
         })
         .eq("id", id)
         .eq("user_id", user.id)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["store-integrations"] });
       toast({
         title: "Store updated!",
         description: "Your store integration has been updated.",
       });
     },
     onError: (error: any) => {
       toast({
         title: "Error",
         description: error.message || "Failed to update store integration.",
         variant: "destructive",
       });
     },
   });
 
   const deleteIntegration = useMutation({
     mutationFn: async (id: string) => {
       if (!user?.id) throw new Error("Not authenticated");
 
       const { error } = await supabase
         .from("store_integrations")
         .delete()
         .eq("id", id)
         .eq("user_id", user.id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["store-integrations"] });
       toast({
         title: "Store removed",
         description: "The store integration has been removed.",
       });
     },
     onError: (error: any) => {
       toast({
         title: "Error",
         description: error.message || "Failed to remove store integration.",
         variant: "destructive",
       });
     },
   });
 
   const toggleIntegration = useMutation({
     mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
       if (!user?.id) throw new Error("Not authenticated");
 
       const { error } = await supabase
         .from("store_integrations")
         .update({ is_active })
         .eq("id", id)
         .eq("user_id", user.id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["store-integrations"] });
     },
   });
 
   return {
     integrations: integrations || [],
     isLoading,
     addIntegration,
     updateIntegration,
     deleteIntegration,
     toggleIntegration,
   };
 };