import { useState } from "react";
import { ArrowLeft, Truck, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCart } from "@/components/profile/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { CURRENCIES } from "@/hooks/useExchangeRates";
import { BioTheme } from "@/lib/bioThemes";
import { toast } from "sonner";

const getCurrencySymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;

interface Props {
  theme: BioTheme;
  creatorUsername?: string;
  discount?: number;
  couponCode?: string | null;
  onBack: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CartCheckoutForm = ({ theme, creatorUsername, discount = 0, couponCode, onBack, onSuccess }: Props) => {
  const { items, totalAmount, allAllowCod, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const currency = items[0]?.currency || "INR";
  const creatorId = items[0]?.creator_id || "";
  const finalAmount = Math.max(0, totalAmount - discount);

  const buildWhatsAppMessage = (method: string, transactionId?: string) => {
    const itemList = items.map((i) => `${i.title} x${i.quantity}`).join(", ");
    const fullAddress = [addressLine1, addressLine2, city, state, pincode].filter(Boolean).join(", ");
    let msg = `📦 New Order on Brioo!\n\nItems: ${itemList}\nTotal: ${getCurrencySymbol(currency)}${finalAmount.toFixed(2)}\nMethod: ${method.toUpperCase()}\nAddress: ${fullAddress}\nCustomer: ${name}\nPhone: ${phone}`;
    if (couponCode) msg += `\nCoupon: ${couponCode} (-${getCurrencySymbol(currency)}${discount.toFixed(2)})`;
    if (transactionId) msg += `\nTransaction ID: ${transactionId}`;
    return msg;
  };

  const saveOrder = async (method: string, transactionId?: string) => {
    // Sanitizing method for DB check constraints
    const sanitizedMethod = method.toLowerCase();
    
    const orderItems = items.map((i) => ({ 
      id: i.id, 
      title: i.title, 
      price: i.price, 
      quantity: i.quantity, 
      currency: i.currency 
    }));

    const baseAmount = totalAmount;
    const deliveryCharges = 0;
    const platformFee = 0;
    const sellerPayoutAmount = baseAmount - deliveryCharges;

    const fullAddr = [addressLine1, addressLine2, city, state, pincode].filter(Boolean).join(", ");

    const { data: insertedOrder, error } = await supabase.from("orders").insert({
      creator_id: creatorId,
      customer_name: name,
      customer_email: email || null,
      customer_phone: phone,
      shipping_address: fullAddr,
      address_line1: addressLine1,
      address_line2: addressLine2 || null,
      city: city,
      state: state,
      pincode: pincode,
      items: orderItems,
      total_amount: Number(finalAmount.toFixed(2)),
      payment_method: sanitizedMethod,
      status: sanitizedMethod === "cod" ? "pending" : "paid",
      transaction_id: transactionId || null,
      currency: currency,
      base_amount: baseAmount,
      delivery_charges: deliveryCharges,
      platform_fee: platformFee,
      seller_payout_amount: sellerPayoutAmount,
      payout_status: "pending",
    } as any).select("id");

    if (error) {
      console.error("Order Insert Error:", error);
      throw error;
    }

    // Trigger automated notifications (fire-and-forget)
    const newOrderId = Array.isArray(insertedOrder) ? insertedOrder[0]?.id : (insertedOrder as any)?.id;
    if (newOrderId) {
      // WhatsApp seller notification
      supabase.functions.invoke("notify-seller-whatsapp", { body: { orderId: newOrderId } })
        .catch((e) => console.warn("WhatsApp notification failed:", e));
      // Shiprocket order creation
      supabase.functions.invoke("create-shiprocket-order", { body: { orderId: newOrderId } })
        .catch((e) => console.warn("Shiprocket order creation failed:", e));
    }

    if (couponCode) {
      try {
        const { data: couponData } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("code", couponCode)
          .eq("creator_id", creatorId)
          .single();
        
        await supabase
          .from("coupons")
          .update({ used_count: (couponData?.used_count || 0) + 1 })
          .eq("code", couponCode)
          .eq("creator_id", creatorId);
      } catch (e) {
        console.warn("Coupon update failed", e);
      }
    }
  };

  const openWhatsApp = async (method: string, transactionId?: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_number")
      .eq("user_id", creatorId)
      .single();
    
    const whatsappNumber = (profile as any)?.whatsapp_number;
    if (whatsappNumber) {
      const msg = buildWhatsAppMessage(method, transactionId);
      const cleanNumber = String(whatsappNumber).replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  };

  const handleCOD = async () => {
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    try {
      await saveOrder("cod");
      await openWhatsApp("COD");
      toast.success("Order placed! Pay on delivery.");
      clearCart();
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-checkout", {
        body: {
          productName: items.map((i) => i.title).join(", "),
          productPrice: finalAmount,
          currency: currency,
          productId: items[0]?.id,
          creatorUsername,
          cartItems: items.map((i) => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity })),
        },
      });

      if (error || data?.error) throw new Error(data?.error || "Checkout failed");

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.head.appendChild(script);
        await new Promise((r) => (script.onload = r));
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Brioo Store",
        description: `Order from @${creatorUsername || "store"}`,
        order_id: data.order_id,
        handler: async (response: any) => {
          const txnId = response.razorpay_payment_id;
          try {
            await saveOrder("online", txnId);
            await openWhatsApp("Online", txnId);
            toast.success("Payment successful! Order confirmed.");
            clearCart();
            onSuccess();
          } catch (err) {
            console.error(err);
            toast.error("Payment received but order save failed. Contact support.");
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: theme.accent },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </button>

      <h3 className="font-display font-bold text-lg">Checkout</h3>

      <div className="space-y-3">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div>
          <Label>Address Line 1 *</Label>
          <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="House/Flat No., Street" />
        </div>
        <div>
          <Label>Address Line 2 (Landmark)</Label>
          <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Landmark, Area" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>City *</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </div>
          <div>
            <Label>State *</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
          </div>
        </div>
        <div>
          <Label>Pincode *</Label>
          <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="6-digit pincode" maxLength={6} />
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        {discount > 0 && (
          <>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{getCurrencySymbol(currency)}{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({couponCode})</span>
              <span>-{getCurrencySymbol(currency)}{discount.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span style={{ color: theme.accent }}>{getCurrencySymbol(currency)}{finalAmount.toFixed(2)}</span>
        </div>

        <Button
          className="w-full"
          style={{ background: theme.accent, color: theme.accentText }}
          onClick={handleOnlinePayment}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
          Pay Online
        </Button>

        {allAllowCod && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCOD}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
            Cash on Delivery
          </Button>
        )}
      </div>
    </div>
  );
};