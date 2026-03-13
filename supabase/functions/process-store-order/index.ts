import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const body = await req.json();
    const { cartItems, customer, paymentMethod, transactionId, creatorId } = body;

    // Save order
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      creator_id: creatorId,
      customer_name: customer.name,
      customer_email: customer.email || null,
      customer_phone: customer.phone,
      shipping_address: customer.address || null,
      items: cartItems,
      total_amount: cartItems.reduce((s: number, i: any) => s + i.price * (i.quantity || 1), 0),
      payment_method: paymentMethod,
      status: paymentMethod === "COD" ? "pending" : "paid",
      transaction_id: transactionId || null,
    }).select().single();

    if (orderError) throw orderError;

    // Get creator's whatsapp number
    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_number, display_name, username")
      .eq("user_id", creatorId)
      .single();

    const whatsappNumber = profile?.whatsapp_number?.replace(/\D/g, "");
    let whatsappLink = null;

    if (whatsappNumber) {
      const itemList = cartItems.map((i: any) => `${i.title} x${i.quantity || 1}`).join(", ");
      let msg = `📦 New Order on Brioo!\n\nItems: ${itemList}\nTotal: ₹${order.total_amount}\nMethod: ${paymentMethod}\nAddress: ${customer.address || "N/A"}\nCustomer: ${customer.name}\nPhone: ${customer.phone}`;
      if (transactionId) msg += `\nTransaction ID: ${transactionId}`;
      whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    }

    // Send confirmation email to customer
    if (resendKey && customer.email) {
      const itemList = cartItems.map((i: any) => `${i.title} x${i.quantity || 1}`).join(", ");
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
          <h2>Order Confirmed! 🎉</h2>
          <p>Hi ${customer.name},</p>
          <p>Your order has been placed successfully.</p>
          <hr/>
          <p><strong>Items:</strong> ${itemList}</p>
          <p><strong>Total:</strong> ₹${order.total_amount}</p>
          <p><strong>Payment:</strong> ${paymentMethod}</p>
          ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ""}
          <p><strong>Shipping:</strong> ${customer.address || "N/A"}</p>
          <hr/>
          <p style="color:#888;font-size:12px">Thank you for shopping on Brioo!</p>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "Brioo <orders@brioo.com>",
          to: [customer.email],
          subject: `Order Confirmed - ${itemList.slice(0, 50)}`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, order_id: order.id, whatsapp_link: whatsappLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});