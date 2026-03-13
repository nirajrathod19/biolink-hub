import { useState } from "react";
import { ShoppingCart as CartIcon, X, Plus, Minus, Trash2, Ticket, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/profile/CartContext";
import { CartCheckoutForm } from "@/components/profile/CartCheckoutForm";
import { useValidateCoupon } from "@/hooks/useCoupons";
import { CURRENCIES } from "@/hooks/useExchangeRates";
import { BioTheme } from "@/lib/bioThemes";
import { toast } from "sonner";

const getCurrencySymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;

interface Props {
  theme: BioTheme;
  creatorUsername?: string;
}

export const ShoppingCart = ({ theme, creatorUsername }: Props) => {
  const { items, totalItems, totalAmount, removeItem, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon();

  if (totalItems === 0 && !isOpen) return null;

  const currency = items[0]?.currency || "INR";
  const creatorId = items[0]?.creator_id || "";
  const finalAmount = Math.max(0, totalAmount - appliedDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode,
        creatorId,
        orderAmount: totalAmount,
      });
      setAppliedDiscount(result.discount);
      setAppliedCoupon(result.coupon.code);
      toast.success(`Coupon applied! You save ${getCurrencySymbol(currency)}${result.discount.toFixed(2)}`);
    } catch (e: any) {
      toast.error(e.message || "Invalid coupon");
      setAppliedDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
  };

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: theme.accent, color: theme.accentText }}
        onClick={() => setIsOpen(true)}
      >
        <CartIcon className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </motion.button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-display font-bold text-lg">Cart ({totalItems})</h3>
                <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
              </div>

              {showCheckout ? (
                <CartCheckoutForm
                  theme={theme}
                  creatorUsername={creatorUsername}
                  discount={appliedDiscount}
                  couponCode={appliedCoupon}
                  onBack={() => setShowCheckout(false)}
                  onSuccess={() => { setShowCheckout(false); setIsOpen(false); removeCoupon(); }}
                />
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {items.length === 0 ? (
                      <p className="text-center text-muted-foreground py-12">Your cart is empty</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-secondary/30">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              <CartIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-sm font-bold" style={{ color: theme.accent }}>
                              {getCurrencySymbol(item.currency)}{item.price}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button onClick={() => removeItem(item.id)} className="ml-auto">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="p-4 border-t space-y-3">
                      {/* Coupon Section */}
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-500/10 text-green-600">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            <span>{appliedCoupon}</span>
                            <span>(-{getCurrencySymbol(currency)}{appliedDiscount.toFixed(2)})</span>
                          </div>
                          <button onClick={removeCoupon} className="text-xs underline">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Coupon code"
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleApplyCoupon}
                            disabled={validateCoupon.isPending}
                          >
                            <Ticket className="w-4 h-4 mr-1" />
                            Apply
                          </Button>
                        </div>
                      )}

                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{getCurrencySymbol(currency)}{totalAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span style={{ color: theme.accent }}>
                          {getCurrencySymbol(currency)}{finalAmount.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        style={{ background: theme.accent, color: theme.accentText }}
                        onClick={() => setShowCheckout(true)}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};