import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { creator_id, amount, supporter_name, supporter_email, message } = await req.json();
    if (!creator_id || !amount || amount < 1) throw new Error("Invalid creator or amount");
    if (amount > 100000) throw new Error("Amount too large");

    // Persist a pending tip row
    const { data: tipRow, error: tipErr } = await supabase
      .from("tip_transactions")
      .insert({
        creator_id,
        amount,
        currency: "INR",
        supporter_name: supporter_name || "Anonymous",
        supporter_email: supporter_email || null,
        message: message || null,
        status: "pending",
      })
      .select()
      .single();
    if (tipErr) throw tipErr;

    const orderResp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `tip_${tipRow.id.slice(0, 8)}_${Date.now()}`,
        notes: { tip_id: tipRow.id, creator_id, type: "tip" },
      }),
    });

    if (!orderResp.ok) {
      const txt = await orderResp.text();
      throw new Error(`Razorpay error: ${txt}`);
    }
    const order = await orderResp.json();

    await supabase.from("tip_transactions").update({ order_id: order.id }).eq("id", tipRow.id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: razorpayKeyId,
        tip_id: tipRow.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    console.error("[create-tip-order]", e?.message);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
