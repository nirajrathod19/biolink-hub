import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Flame, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicDigitalProducts } from "@/hooks/useDigitalProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BioTheme } from "@/lib/bioThemes";

interface DigitalProductsGridProps {
  userId: string;
  themeColor?: string;
  theme?: BioTheme;
  creatorUsername?: string;
}

export const DigitalProductsGrid = ({ userId, themeColor = "#8B5CF6", theme, creatorUsername }: DigitalProductsGridProps) => {
  const { data: products = [], isLoading } = usePublicDigitalProducts(userId);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const accent = theme?.accent || themeColor;

  const loadRazorpay = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const handleBuyNow = async (product: any) => {
    setBuyingId(product.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-checkout", {
        body: {
          productName: product.title,
          productPrice: product.price,
          currency: product.currency || "USD",
          productId: product.id,
          creatorUsername: creatorUsername || "",
        },
      });
      if (error) throw error;
      if (!data?.order_id) throw new Error("No order created");

      await loadRazorpay();

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Brioo Store",
        description: product.title,
        order_id: data.order_id,
        handler: (response: any) => {
          toast.success("Payment successful! You'll receive your download link shortly.");
        },
        theme: { color: accent },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setBuyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 mt-8">
        <div className="h-6 w-40 rounded" style={{ background: `${accent}20` }} />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl" style={{ background: theme?.cardBg }} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}20` }}
        >
          <Package className="w-4 h-4" style={{ color: accent }} />
        </div>
        <h2 className="font-semibold text-lg" style={{ color: theme?.textColor }}>Digital Products</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
            className="rounded-xl overflow-hidden transition-all"
            style={{
              background: theme?.cardBg,
              border: theme ? `1px solid ${theme.cardBorder}` : undefined,
              backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
            }}
          >
            {product.preview_image && (
              <div className="h-32 overflow-hidden">
                <img src={product.preview_image} alt={product.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-medium text-sm mb-1 line-clamp-1" style={{ color: theme?.cardText }}>{product.title}</h3>
              {product.description && (
                <p className="text-xs mb-2 line-clamp-2" style={{ color: theme?.bioTextColor }}>{product.description}</p>
              )}

              {(product as any).is_flash_sale && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>
                    <Flame className="w-3 h-3" /> Flash Sale
                  </span>
                </div>
              )}

              {(product as any).max_quantity && (
                <div className="text-xs mb-2" style={{ color: theme?.bioTextColor }}>
                  {(product as any).copies_sold || 0}/{(product as any).max_quantity} sold
                  <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: `${accent}15` }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (((product as any).copies_sold || 0) / (product as any).max_quantity) * 100)}%`, backgroundColor: accent }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold" style={{ color: accent }}>
                  ${product.price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-semibold min-h-[36px] min-w-[80px]"
                  style={{ backgroundColor: accent, color: "#fff" }}
                  disabled={buyingId === product.id}
                  onClick={() => handleBuyNow(product)}
                >
                  {buyingId === product.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-3 h-3" />
                  )}
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};