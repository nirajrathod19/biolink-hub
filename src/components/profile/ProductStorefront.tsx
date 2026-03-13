import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Plus } from "lucide-react";
import { usePublicProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/components/profile/CartContext";
import { ProductDetailModal } from "@/components/profile/ProductDetailModal";
import { CURRENCIES } from "@/hooks/useExchangeRates";
import { BioTheme } from "@/lib/bioThemes";
import { toast } from "sonner";

interface Props {
  userId: string;
  theme: BioTheme;
  creatorUsername?: string;
}

const getCurrencySymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;

export const ProductStorefront = ({ userId, theme, creatorUsername }: Props) => {
  const { data: products = [], isLoading } = usePublicProducts(userId);
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach((p) => {
      const cat = p.category || "Products";
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return Object.entries(map);
  }, [products]);

  const handleAddToCart = (p: Product) => {
    addItem({
      id: p.id,
      title: p.title,
      price: p.price,
      currency: p.currency || "INR",
      image_url: p.images?.[0] || p.preview_image_url || null,
      allow_cod: p.allow_cod || false,
      creator_id: p.creator_id,
    });
    toast.success(`${p.title} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 my-6">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-5 w-32 bg-secondary/50 rounded mb-3" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-36 h-48 bg-secondary/50 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section aria-label="Store products" className="my-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag className="w-5 h-5" style={{ color: theme.accent }} />
        <h2 className="text-lg font-display font-bold" style={{ color: theme.textColor }}>Shop</h2>
      </div>

      {grouped.map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold mb-3 px-1" style={{ color: theme.bioTextColor }}>
            {category}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {items.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="w-36 flex-shrink-0 snap-start rounded-xl overflow-hidden cursor-pointer group"
                style={{ background: theme.cardBg, border: `1px solid ${theme.accent}20` }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="w-full h-36 overflow-hidden">
                  {(product.images?.[0] || product.preview_image_url) ? (
                    <img
                      src={product.images?.[0] || product.preview_image_url || ""}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `${theme.accent}15` }}>
                      <ShoppingBag className="w-8 h-8" style={{ color: theme.accent }} />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate" style={{ color: theme.textColor }}>{product.title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: theme.accent }}>
                    {getCurrencySymbol(product.currency || "INR")}{product.price}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-lg transition-opacity hover:opacity-80"
                    style={{ background: theme.accent, color: theme.accentText }}
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          theme={theme}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
};