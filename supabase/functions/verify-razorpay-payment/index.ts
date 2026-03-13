import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-RAZORPAY-SUB] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) throw new Error("Razorpay secret not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid auth token");

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      throw new Error("Missing payment verification data");
    }

    // Verify signature using Web Crypto API
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(message)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      logStep("Signature verification failed");
      throw new Error("Payment signature verification failed");
    }

    logStep("Signature verified", { razorpay_payment_id, plan });

    // Activate Pro status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_pro: true })
      .eq("user_id", userId);

    if (updateError) throw updateError;
    logStep("Profile updated to Pro");

    // Cancel any existing wallet subscription
    await supabase
      .from("wallet_subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active");

    // Create subscription record
    const nextRenewal = new Date();
    nextRenewal.setDate(nextRenewal.getDate() + 30);

    await supabase.from("wallet_subscriptions").insert({
      user_id: userId,
      plan,
      price: plan === "full" ? 5 : 3,
      status: "active",
      next_renewal_at: nextRenewal.toISOString(),
    });

    // Record transaction
    const price = plan === "full" ? 5 : 3;
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "subscription",
      amount: -price,
      description: `${plan === "full" ? "Full Pro" : "Starter Pro"} subscription via Razorpay`,
      reference_id: null,
    });

    // Enable revenue sharing
    await supabase
      .from("adsense_settings")
      .upsert({
        user_id: userId,
        is_revenue_sharing_enabled: true,
      }, { onConflict: "user_id" });

    // Audit log
    await supabase.from("security_audit_log").insert({
      user_id: userId,
      event_type: "razorpay_subscription_purchase",
      event_data: { plan, razorpay_payment_id, razorpay_order_id },
      success: true,
    });

    logStep("Subscription activated successfully");

    return new Response(JSON.stringify({
      success: true,
      plan: plan === "full" ? "Full Pro" : "Starter Pro",
      next_renewal: nextRenewal.toISOString(),
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