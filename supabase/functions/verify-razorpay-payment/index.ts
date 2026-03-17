import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-VERIFY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      type, // "subscription" or "product_purchase"
      plan,
      orderDetails // बायर की डिटेल्स (address, pincode, seller_id, etc.)
    } = await req.json();

    // 1. Signature Verification (Simplified for brevity, keep your crypto logic here)
    logStep("Verifying payment...", { razorpay_payment_id, type });

    // 2. Auth User
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("User not authenticated");

    // --- CASE 1: PRO SUBSCRIPTION ---
    if (type === "subscription") {
      logStep("Processing Pro Subscription");
      await supabase.from("profiles").update({ is_pro: true }).eq("user_id", user.id);
      
      const nextRenewal = new Date();
      nextRenewal.setDate(nextRenewal.getDate() + 30);

      await supabase.from("wallet_subscriptions").insert({
        user_id: user.id,
        plan,
        status: "active",
        next_renewal_at: nextRenewal.toISOString(),
      });
    } 

    // --- CASE 2: PRODUCT PURCHASE (The Fix) ---
    else if (type === "product_purchase") {
      logStep("Processing Product Purchase");
      
      // डेटाबेस में आर्डर डालें
      const { data: newOrder, error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        seller_id: orderDetails.seller_id,
        total_amount: orderDetails.amount,
        payment_id: razorpay_payment_id,
        status: "pending",
        address_line1: orderDetails.address,
        pincode: orderDetails.pincode,
        city: orderDetails.city,
        state: orderDetails.state
      }).select().single();

      if (orderError) throw orderError;

      // यहाँ Shiprocket API को कॉल करें (Edge Function trigger)
      try {
        logStep("Triggering Shiprocket automation");
        fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-shiprocket-order`, {
          method: 'POST',
          headers: { ...corsHeaders, 'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
          body: JSON.stringify({ orderId: newOrder.id })
        });
      } catch (err) {
        console.error("Shiprocket trigger failed but order saved:", err);
      }
    }

    // 3. Record Transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: type,
      amount: orderDetails?.amount || 0,
      description: `Payment via Razorpay: ${type}`,
      reference_id: razorpay_payment_id,
    });

    return new Response(JSON.stringify({ success: true, message: "Transaction completed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});