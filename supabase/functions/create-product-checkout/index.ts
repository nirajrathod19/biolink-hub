import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRODUCT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const body = await req.json();
    const { productName, productPrice, currency, productId, creatorUsername } = body;

    if (!productName || productPrice == null || productPrice <= 0) {
      throw new Error("Invalid product details");
    }

    logStep("Checkout request", { productName, productPrice, currency, productId, creatorUsername });

    // Create Razorpay order
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: Math.round(productPrice * 100),
        currency: (currency || "INR").toUpperCase(),
        receipt: `prod_${(productId || "unknown").slice(0, 8)}_${Date.now()}`,
        notes: {
          product_id: productId || "",
          product_name: productName,
          creator_username: creatorUsername || "",
        },
      }),
    });

    if (!orderResponse.ok) {
      const errBody = await orderResponse.text();
      logStep("Razorpay API error", { status: orderResponse.status, body: errBody });
      throw new Error(`Razorpay order creation failed: ${errBody}`);
    }

    const order = await orderResponse.json();
    logStep("Order created", { orderId: order.id });

    return new Response(JSON.stringify({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});