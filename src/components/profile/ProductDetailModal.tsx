import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { CURRENCIES } from "@/hooks/useExchangeRates";
import { BioTheme } from "@/lib/bioThemes";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface Props {
  product: Product;
  theme: BioTheme;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

const getCurrencySymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;

export const ProductDetailModal = ({ product, theme, onClose, onAddToCart }: Props) => {
  const images = product.images?.length ? product.images : product.preview_image_url ? [product.preview_image_url] : [];

  const getAlignment = (idx: number, total: number) => {
    if (total <= 1) return "center";
    if (idx === 0) return "flex-start";
    if (idx === total - 1) return "flex-end";
    return "center";
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0">
        <VisuallyHidden.Root>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>Product details for {product.title}</DialogDescription>
        </VisuallyHidden.Root>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto p-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 snap-center rounded-xl overflow-hidden"
                style={{
                  width: images.length === 1 ? "100%" : "80%",
                  alignSelf: getAlignment(idx, images.length),
                }}
              >
                <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-64 object-cover rounded-xl" />
              </div>
            ))}
          </div>
        )}

        <div className="p-5 pt-0 space-y-4">
          <div>
            <h2 className="text-xl font-display font-bold">{product.title}</h2>
            <p className="text-2xl font-bold mt-1" style={{ color: theme.accent }}>
              {getCurrencySymbol(product.currency || "INR")}{product.price}
            </p>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {product.allow_cod && (
            <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
              COD Available
            </span>
          )}

          <Button
            className="w-full"
            style={{ background: theme.accent, color: theme.accentText }}
            onClick={() => { onAddToCart(product); onClose(); }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};