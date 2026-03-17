import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Shiprocket webhook status mapping
const statusMap: Record<string, string> = {
  "1": "pending",
  "2": "confirmed",
  "3": "packed",
  "4": "shipped",
  "5": "in_transit",
  "6": "out_for_delivery",
  "7": "delivered",
  "8": "cancelled",
  "9": "rto_initiated",
  "10": "rto_delivered",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Accept both GET (health check) and POST (webhook)
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", service: "order-status-sync" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    console.log("Shiprocket webhook received:", JSON.stringify(payload));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Shiprocket sends various webhook formats
    const orderId = payload.order_id || payload.shiprocket_order_id;
    const statusCode = String(payload.current_status_id || payload.status_id || "");
    const trackingNumber = payload.awb || payload.awb_code || payload.tracking_number || "";
    const courierName = payload.courier_name || payload.courier_company_name || "";
    const newStatus = statusMap[statusCode] || payload.current_status?.toLowerCase() || "unknown";

    if (!orderId) {
      return new Response(JSON.stringify({ error: "No order_id in payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Find order by shiprocket_order_id
    const { data: order, error: findErr } = await supabase
      .from("orders")
      .select("id, customer_phone, customer_name")
      .eq("shiprocket_order_id", String(orderId))
      .single();

    if (findErr || !order) {
      console.warn("Order not found for shiprocket_order_id:", orderId);
      // Try matching by our order ID prefix
      return new Response(JSON.stringify({ warning: "Order not found", orderId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order status
    const updateData: any = { status: newStatus };
    if (trackingNumber) updateData.tracking_id = trackingNumber;
    if (courierName) updateData.courier_partner = courierName;

    await supabase.from("orders").update(updateData).eq("id", order.id);

    // Log the status change
    await supabase.from("security_audit_log").insert({
      event_type: "shiprocket_status_update",
      event_data: { orderId: order.id, shiprocketOrderId: orderId, newStatus, trackingNumber, courierName },
      success: true,
    });

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("order-status-sync error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});