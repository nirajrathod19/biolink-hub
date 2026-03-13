import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Plus,
  Trash2,
  Settings,
  ExternalLink,
  Power,
  Lock,
  Crown,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useStoreIntegrations,
  PLATFORM_CONFIG,
  StorePlatform,
  StoreConfig,
} from "@/hooks/useStoreIntegrations";
import { useSubscription } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui/skeleton";

// Platform-specific setup instructions
const PLATFORM_INSTRUCTIONS: Record<StorePlatform, {
  steps: string[];
  link: string;
  linkText: string;
}> = {
  shopify: {
    steps: [
      "Log in to your Shopify Admin",
      "Go to Settings → Apps and sales channels → Develop apps",
      "Click 'Create an app' and give it a name",
      "Click 'Configure Storefront API scopes' and enable 'unauthenticated_read_product_listings'",
      "Click 'Install app' and copy the Storefront Access Token",
    ],
    link: "https://shopify.dev/docs/api/storefront",
    linkText: "Shopify API Docs",
  },
  wix: {
    steps: [
      "Log in to your Wix Dashboard",
      "Go to Settings → API Keys",
      "Click 'Generate API Key'",
      "Copy the API Key and store it securely",
      "Enter your Wix store URL (e.g., yourstore.wixsite.com)",
    ],
    link: "https://dev.wix.com/api/rest/getting-started",
    linkText: "Wix API Docs",
  },
  bigcommerce: {
    steps: [
      "Log in to your BigCommerce Control Panel",
      "Go to Settings → API Accounts → Create API Account",
      "Select 'Create V2/V3 API Token'",
      "Set OAuth Scopes: Products (read-only)",
      "Save and copy your API credentials",
    ],
    link: "https://developer.bigcommerce.com/api-docs",
    linkText: "BigCommerce API Docs",
  },
  ebay: {
    steps: [
      "Go to eBay Developer Program (developer.ebay.com)",
      "Create or log in to your developer account",
      "Go to Application Keys and create a new keyset",
      "Copy your App ID (Client ID) and Cert ID (Client Secret)",
      "Enter your eBay seller username as the store domain",
    ],
    link: "https://developer.ebay.com/api-docs/static/gs_create-app.html",
    linkText: "eBay Developer Portal",
  },
  facebook: {
    steps: [
      "Go to Meta for Developers (developers.facebook.com)",
      "Create a new app and select 'Business' type",
      "Add the 'Facebook Commerce' product to your app",
      "Generate an Access Token with 'catalog_management' permissions",
      "Enter your Facebook Page URL as the store domain",
    ],
    link: "https://developers.facebook.com/docs/commerce-platform",
    linkText: "Meta Commerce API",
  },
  etsy: {
    steps: [
      "Go to Etsy Developers (etsy.com/developers)",
      "Create a new app in the Developer Portal",
      "Copy your API Key (Keystring)",
      "Enter your Etsy shop name as the store domain",
      "Note: Read-only access for displaying products",
    ],
    link: "https://developers.etsy.com/documentation/",
    linkText: "Etsy API Docs",
  },
  amazon: {
    steps: [
      "Log in to Amazon Seller Central",
      "Go to Apps & Services → Develop Apps",
      "Register as a developer if not already",
      "Create a new app and request API access",
      "Enter your Amazon seller ID as the store domain",
    ],
    link: "https://developer-docs.amazon.com/sp-api/",
    linkText: "Amazon SP-API Docs",
  },
};
 
 export const StoreIntegrationManager = () => {
   const { integrations, isLoading, addIntegration, deleteIntegration, toggleIntegration } = useStoreIntegrations();
   const { isSubscribed } = useSubscription();
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [selectedPlatform, setSelectedPlatform] = useState<StorePlatform | "">("");
   const [formData, setFormData] = useState<Partial<StoreConfig>>({});
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedPlatform) return;
 
     await addIntegration.mutateAsync({
       platform: selectedPlatform,
       ...formData,
     });
 
     setIsDialogOpen(false);
     setSelectedPlatform("");
     setFormData({});
   };
 
  const renderSetupInstructions = () => {
    if (!selectedPlatform) return null;

    const instructions = PLATFORM_INSTRUCTIONS[selectedPlatform];
    const config = PLATFORM_CONFIG[selectedPlatform];

    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="instructions" className="border-primary/20">
          <AccordionTrigger className="text-sm py-2 hover:no-underline">
            <span className="flex items-center gap-2 text-primary">
              <HelpCircle className="w-4 h-4" />
              How to get {config.name} credentials
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <ol className="space-y-2 text-sm text-muted-foreground">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <a
                href={instructions.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {instructions.linkText}
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  const renderFormFields = () => {
    if (!selectedPlatform) return null;

    const config = PLATFORM_CONFIG[selectedPlatform];
    
    return (
      <div className="space-y-4">
        {/* Store URL - always shown, simplified */}
        <div className="space-y-2">
          <Label htmlFor="store_domain">Store URL / Link</Label>
          <Input
            id="store_domain"
            placeholder={config.domainSuffix ? `yourstore${config.domainSuffix}` : "https://yourstore.com"}
            value={formData.store_domain || ""}
            onChange={(e) => setFormData({ ...formData, store_domain: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Paste your store link — visitors will be redirected here from your bio page
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_name">Display Name</Label>
          <Input
            id="store_name"
            placeholder={`My ${config.name} Store`}
            value={formData.store_name || ""}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
          />
        </div>

        {/* Advanced: API credentials (collapsed) */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced" className="border-muted">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4" />
                Advanced: API Credentials (optional)
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Only needed if you want to display live product data from your store.
                </p>
                {config.fields.includes("access_token") && (
                  <div className="space-y-1">
                    <Label htmlFor="access_token" className="text-xs">Access Token</Label>
                    <Input
                      id="access_token"
                      type="password"
                      placeholder="shpat_xxxxxxxxxxxxx"
                      value={formData.access_token || ""}
                      onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                    />
                  </div>
                )}
                {config.fields.includes("api_key") && (
                  <div className="space-y-1">
                    <Label htmlFor="api_key" className="text-xs">API Key</Label>
                    <Input
                      id="api_key"
                      type="password"
                      placeholder="API Key"
                      value={formData.api_key || ""}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    />
                  </div>
                )}
                {config.fields.includes("api_secret") && (
                  <div className="space-y-1">
                    <Label htmlFor="api_secret" className="text-xs">API Secret</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      placeholder="API Secret"
                      value={formData.api_secret || ""}
                      onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                    />
                  </div>
                )}
                {renderSetupInstructions()}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };
 
   // Premium gate
   if (!isSubscribed) {
     return (
       <Card className="border-dashed border-2 border-muted">
         <CardContent className="pt-6">
           <div className="text-center py-8">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
               <Lock className="w-8 h-8 text-primary" />
             </div>
             <h3 className="font-semibold text-lg mb-2">Premium Feature</h3>
             <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
               Upgrade to Premium to connect your e-commerce stores and display products on your bio page.
             </p>
             <Button variant="default" className="gap-2">
               <Crown className="w-4 h-4" />
               Upgrade to Premium
             </Button>
           </div>
         </CardContent>
       </Card>
     );
   }
 
   if (isLoading) {
     return (
       <Card>
         <CardHeader>
           <Skeleton className="h-6 w-40" />
           <Skeleton className="h-4 w-60" />
         </CardHeader>
         <CardContent className="space-y-4">
           <Skeleton className="h-20 w-full" />
           <Skeleton className="h-20 w-full" />
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
               <Store className="w-5 h-5 text-primary" />
             </div>
             <div>
               <CardTitle className="text-lg">Store Integrations</CardTitle>
               <CardDescription>
                 Connect your e-commerce stores to display products
               </CardDescription>
             </div>
           </div>
           <Badge variant="secondary" className="bg-primary/10 text-primary">
             Premium
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Existing integrations */}
         <AnimatePresence>
           {integrations.map((integration) => {
             const platform = PLATFORM_CONFIG[integration.platform];
             return (
               <motion.div
                 key={integration.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
               >
                 <div className="flex items-center gap-3">
                   <span className="text-2xl">{platform.icon}</span>
                   <div>
                     <p className="font-medium">
                       {integration.store_name || platform.name}
                     </p>
                     {integration.store_domain && (
                       <p className="text-sm text-muted-foreground">
                         {integration.store_domain}
                       </p>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Switch
                     checked={integration.is_active}
                     onCheckedChange={(checked) =>
                       toggleIntegration.mutate({ id: integration.id, is_active: checked })
                     }
                   />
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => deleteIntegration.mutate(integration.id)}
                   >
                     <Trash2 className="w-4 h-4 text-destructive" />
                   </Button>
                 </div>
               </motion.div>
             );
           })}
         </AnimatePresence>
 
         {integrations.length === 0 && (
           <div className="text-center py-6 text-muted-foreground">
             <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
             <p>No stores connected yet</p>
             <p className="text-sm">Add your first e-commerce store integration</p>
           </div>
         )}
 
         {/* Add new integration */}
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button variant="outline" className="w-full gap-2">
               <Plus className="w-4 h-4" />
               Add Store Integration
             </Button>
           </DialogTrigger>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle>Connect Store</DialogTitle>
               <DialogDescription>
                 Connect your e-commerce platform to display products on your bio page.
               </DialogDescription>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label>Platform</Label>
                 <Select
                   value={selectedPlatform}
                   onValueChange={(value) => {
                     setSelectedPlatform(value as StorePlatform);
                     setFormData({});
                   }}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select a platform" />
                   </SelectTrigger>
                   <SelectContent>
                     {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                       <SelectItem key={key} value={key}>
                         <span className="flex items-center gap-2">
                           <span>{config.icon}</span>
                           <span>{config.name}</span>
                         </span>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 {selectedPlatform && (
                   <p className="text-xs text-muted-foreground">
                     {PLATFORM_CONFIG[selectedPlatform].description}
                   </p>
                 )}
               </div>
 
               {renderFormFields()}
 
               <div className="flex gap-2 pt-4">
                 <Button
                   type="button"
                   variant="outline"
                   className="flex-1"
                   onClick={() => setIsDialogOpen(false)}
                 >
                   Cancel
                 </Button>
                 <Button
                   type="submit"
                   className="flex-1"
                   disabled={!selectedPlatform || addIntegration.isPending}
                 >
                   {addIntegration.isPending ? "Connecting..." : "Connect Store"}
                 </Button>
               </div>
             </form>
           </DialogContent>
         </Dialog>
       </CardContent>
     </Card>
   );
 };