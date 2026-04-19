import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) throw new Error("Razorpay not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tip_id } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tip_id) {
      throw new Error("Missing payment fields");
    }

    const expected = createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) throw new Error("Invalid signature");

    // Mark tip as paid
    const { data: tip, error: tipErr } = await supabase
      .from("tip_transactions")
      .update({ status: "paid", payment_id: razorpay_payment_id })
      .eq("id", tip_id)
      .select()
      .single();
    if (tipErr || !tip) throw new Error("Tip not found");

    // Credit the creator's pending revenue (90% creator / 10% platform)
    const creatorShare = Number((tip.amount * 0.9).toFixed(2));
    const { data: profile } = await supabase
      .from("profiles")
      .select("pending_revenue")
      .eq("user_id", tip.creator_id)
      .maybeSingle();

    const newPending = Number(profile?.pending_revenue || 0) + creatorShare;
    await supabase.from("profiles").update({ pending_revenue: newPending }).eq("user_id", tip.creator_id);

    await supabase.from("transactions").insert({
      user_id: tip.creator_id,
      type: "tip",
      amount: creatorShare,
      description: `Tip from ${tip.supporter_name || "Anonymous"}`,
      reference_id: tip.id,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("[verify-tip-payment]", e?.message);
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
