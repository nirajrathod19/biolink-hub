import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { creator_id, email, name, product_id } = await req.json();
    if (!creator_id || !email || !product_id) throw new Error("Missing required fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");

    // Load product (must belong to creator + active + have a file)
    const { data: product, error: prodErr } = await supabase
      .from("digital_products")
      .select("id, title, description, file_url, user_id")
      .eq("id", product_id)
      .eq("user_id", creator_id)
      .eq("is_active", true)
      .maybeSingle();
    if (prodErr) throw prodErr;
    if (!product || !product.file_url) throw new Error("Product not available");

    // Load creator basics
    const { data: creator } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", creator_id)
      .maybeSingle();
    const creatorName = creator?.display_name || creator?.username || "Brioo Creator";

    // Persist lead
    await supabase.from("leads").insert({
      creator_id,
      email: email.trim().toLowerCase(),
      name: name || "Subscriber",
      message: `Requested lead-magnet: ${product.title}`,
      digital_product_id: product.id,
    });

    // Send via Resend
    const html = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7fb;padding:24px;color:#111">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eee">
    <div style="background:linear-gradient(135deg,#8B5CF6,#EC4899);padding:24px;color:#fff">
      <h1 style="margin:0;font-size:22px">Your free download is ready 🎁</h1>
      <p style="margin:6px 0 0;opacity:.9">Sent by ${creatorName} via Brioo</p>
    </div>
    <div style="padding:24px">
      <p>Hi ${name || "there"},</p>
      <p>Thanks for subscribing! Your copy of <strong>${product.title}</strong> is ready to download.</p>
      ${product.description ? `<p style="color:#555">${product.description}</p>` : ""}
      <p style="text-align:center;margin:28px 0">
        <a href="${product.file_url}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600">Download now</a>
      </p>
      <p style="color:#888;font-size:12px">If the button doesn't work, copy this URL: <br>${product.file_url}</p>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #eee;color:#999;font-size:12px;text-align:center">
      You received this because you requested a download on a Brioo creator page.
    </div>
  </div>
</body></html>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Brioo <noreply@brioo.in>",
        to: [email],
        subject: `Your download: ${product.title}`,
        html,
        reply_to: undefined,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[send-digital-file] Resend error", txt);
      // Fall back: still return success with URL so user gets file
      return new Response(
        JSON.stringify({ success: true, fallback_url: product.file_url, email_sent: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, fallback_url: product.file_url, email_sent: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    console.error("[send-digital-file]", e?.message);
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
