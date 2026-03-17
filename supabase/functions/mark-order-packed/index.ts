import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");
  if (!email || !password) throw new Error("Shiprocket credentials not configured");

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) throw new Error("Shiprocket auth failed");
  return data.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error("orderId is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, shiprocket_order_id, status")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) throw new Error("Order not found");

    const token = await getShiprocketToken();
    const shiprocketOrderId = order.shiprocket_order_id;

    if (!shiprocketOrderId) {
      // If no Shiprocket order, just update status locally
      await supabase.from("orders").update({ status: "packed" }).eq("id", orderId);
      return new Response(JSON.stringify({ success: true, message: "Marked packed locally (no Shiprocket order)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Generate AWB (auto-assign courier)
    const shipmentRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: shiprocketOrderId }),
    });
    const shipmentData = await shipmentRes.json();
    console.log("AWB assignment:", JSON.stringify(shipmentData));

    const awb = shipmentData.response?.data?.awb_code || "";
    const courierName = shipmentData.response?.data?.courier_name || "";

    // Step 2: Generate label
    await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [shiprocketOrderId] }),
    });

    // Step 3: Generate manifest
    await fetch("https://apiv2.shiprocket.in/v1/external/manifests/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [shiprocketOrderId] }),
    });

    // Step 4: Schedule pickup
    await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/pickup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [shiprocketOrderId] }),
    });

    // Update order in database
    await supabase.from("orders").update({
      status: "packed",
      tracking_id: awb || null,
      courier_partner: courierName || null,
      pickup_scheduled_at: new Date().toISOString(),
    }).eq("id", orderId);

    return new Response(JSON.stringify({
      success: true,
      awb,
      courierName,
      message: "Order packed, label generated, pickup scheduled",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("mark-order-packed error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});