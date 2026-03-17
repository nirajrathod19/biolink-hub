import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    if (!accessToken || !phoneId) {
      throw new Error("WhatsApp credentials not configured");
    }

    // Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) throw new Error("Order not found: " + orderId);

    const sellerPhone = "917875642075";
    const shortId = order.id.substring(0, 8).toUpperCase();
    const items = Array.isArray(order.items)
      ? order.items.map((i: any) => `${i.title} x${i.quantity}`).join(", ")
      : "N/A";

    // Send WhatsApp text message (no template needed for test numbers)
    const messageBody = {
      messaging_product: "whatsapp",
      to: sellerPhone,
      type: "text",
      text: {
        body: `🚀 *New Order on Brioo!*\n\n📦 Order ID: ${shortId}\n💰 Amount: ₹${order.total_amount}\n👤 Customer: ${order.customer_name}\n📞 Phone: ${order.customer_phone}\n📍 Address: ${order.address_line1 || ""}, ${order.city || ""}, ${order.state || ""} ${order.pincode || ""}\n🛒 Items: ${items}\n💳 Payment: ${order.payment_method?.toUpperCase()}\n\nLogin to dashboard to process: https://brioo.in/admin`
      }
    };

    const waRes = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      }
    );

    const waData = await waRes.json();

    if (!waRes.ok) {
      console.error("WhatsApp API error:", JSON.stringify(waData));
      // Log error but don't crash
      await supabase.from("security_audit_log").insert({
        event_type: "whatsapp_notification_failed",
        event_data: { orderId, error: waData },
        success: false,
      });
      return new Response(JSON.stringify({ success: false, error: waData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, messageId: waData.messages?.[0]?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("notify-seller-whatsapp error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});