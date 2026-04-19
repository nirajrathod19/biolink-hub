import { Plus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CURRENCIES } from "@/hooks/useExchangeRates";
import { useCart } from "@/components/profile/CartContext";
import type { BioTheme } from "@/lib/bioThemes";

const sym = (c: string) => CURRENCIES.find((x) => x.code === c)?.symbol || c;

interface CartUpsellProps {
  theme: BioTheme;
  cartProductIds: string[];
  creatorId: string;
}

export const CartUpsell = ({ theme, cartProductIds, creatorId }: CartUpsellProps) => {
  const { addItem } = useCart();

  const { data: suggestions = [] } = useQuery({
    queryKey: ["cart-upsells", creatorId, cartProductIds.sort().join(",")],
    queryFn: async () => {
      if (!creatorId || cartProductIds.length === 0) return [];

      // 1. Try explicit upsell_product_ids on the products in cart
      const { data: cartProducts } = await supabase
        .from("digital_products")
        .select("upsell_product_ids")
        .in("id", cartProductIds);

      const explicit = Array.from(
        new Set(((cartProducts || []) as any[]).flatMap((p) => p.upsell_product_ids || []))
      ).filter((id: string) => !cartProductIds.includes(id));

      if (explicit.length > 0) {
        const { data } = await supabase
          .from("digital_products")
          .select("id, title, price, currency, preview_image, file_url")
          .in("id", explicit)
          .eq("is_active", true)
          .limit(3);
        if (data && data.length) return data;
      }

      // 2. Fallback: other active products from same creator
      const { data: fallback } = await supabase
        .from("digital_products")
        .select("id, title, price, currency, preview_image, file_url")
        .eq("user_id", creatorId)
        .eq("is_active", true)
        .not("id", "in", `(${cartProductIds.join(",")})`)
        .order("copies_sold", { ascending: false })
        .limit(3);
      return fallback || [];
    },
    enabled: !!creatorId && cartProductIds.length > 0,
    staleTime: 60_000,
  });

  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t bg-secondary/20">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accent }} />
        <p className="text-xs font-semibold">Frequently bought together</p>
      </div>
      <div className="space-y-2">
        {suggestions.map((p: any) => (
          <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/60">
            {p.preview_image ? (
              <img src={p.preview_image} alt={p.title} className="w-10 h-10 rounded-md object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-md bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{p.title}</p>
              <p className="text-xs font-bold" style={{ color: theme.accent }}>
                {sym(p.currency || "INR")}{p.price}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() =>
                addItem({
                  id: p.id,
                  title: p.title,
                  price: Number(p.price),
                  currency: p.currency || "INR",
                  image_url: p.preview_image,
                  allow_cod: false,
                  creator_id: creatorId,
                })
              }
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
