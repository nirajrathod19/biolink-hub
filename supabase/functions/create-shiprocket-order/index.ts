import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");
  if (!email || !password) throw new Error("Shiprocket credentials missing");

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) throw new Error("Shiprocket Auth Failed");
  return data.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Fetch Order Details with Seller ID
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, products(seller_id)") // Product table से सेलर ID लाओ
      .eq("id", orderId)
      .single();

    if (orderErr || !order) throw new Error("Order not found");

    // 2. Fetch Dynamic Seller Pickup Address
    const sellerId = order.seller_id || order.products?.seller_id;
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("user_id", sellerId)
      .single();

    // Pickup Location का नाम सेलर के यूजरनेम पर रखें (इसे Shiprocket में पहले से Register होना चाहिए)
    const dynamicPickupLocation = sellerProfile?.username || "Primary";

    const token = await getShiprocketToken();

    // 3. Map Order Items
    const items = Array.isArray(order.items) ? order.items : [];
    const orderItems = items.map((item: any, idx: number) => ({
      name: item.title || `Item ${idx + 1}`,
      sku: `BRIOO-${item.id?.substring(0, 8) || idx}`,
      units: item.quantity || 1,
      selling_price: item.price || 0,
    }));

    const now = new Date();
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // 4. Final Payload with Dynamic Pickup
    const shiprocketPayload = {
      order_id: order.id.substring(0, 20),
      order_date: orderDate,
      pickup_location: dynamicPickupLocation, // <-- DYNAMIC FIX
      billing_customer_name: order.customer_name,
      billing_last_name: "",
      billing_address: order.address_line1 || "",
      billing_address_2: order.address_line2 || "",
      billing_city: order.city || "",
      billing_pincode: order.pincode || "",
      billing_state: order.state || "",
      billing_country: "India",
      billing_email: order.customer_email || "customer@brioo.in",
      billing_phone: order.customer_phone?.replace(/\D/g, "").slice(-10) || "",
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total: order.total_amount,
      length: 15,
      breadth: 15,
      height: 10,
      weight: 0.5,
    };

    const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketPayload),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      throw new Error(`Shiprocket API Error: ${JSON.stringify(createData)}`);
    }

    // 5. Update Database
    await supabase.from("orders").update({
      shiprocket_order_id: String(createData.order_id || ""),
      status: "confirmed"
    }).eq("id", orderId);

    return new Response(JSON.stringify({ success: true, shiprocket_id: createData.order_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});