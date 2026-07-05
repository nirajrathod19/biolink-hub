// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      slot_id,
      creator_id,
      name,
      email,
      verify,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body ?? {};

    if (!slot_id || typeof slot_id !== "string") return json({ error: "slot_id required" }, 400);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return json({ error: "valid email required" }, 400);
    if (!name || typeof name !== "string" || name.length < 1) return json({ error: "name required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load slot (service role — bypasses RLS)
    const { data: slot, error: slotErr } = await admin
      .from("booking_slots")
      .select("*")
      .eq("id", slot_id)
      .maybeSingle();
    if (slotErr || !slot) return json({ error: "Slot not found" }, 404);
    if (!slot.is_active) return json({ error: "Slot is inactive" }, 400);
    if (slot.is_booked) return json({ error: "Slot already booked" }, 409);
    if (creator_id && slot.creator_id !== creator_id) return json({ error: "Creator mismatch" }, 400);

    const RZP_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RZP_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    // === Verification step (paid slots) ===
    if (verify) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return json({ error: "Missing payment fields" }, 400);
      }
      if (!RZP_KEY_SECRET) return json({ error: "Razorpay not configured" }, 500);

      // HMAC-SHA256 verify
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(RZP_KEY_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode(`${razorpay_order_id}|${razorpay_payment_id}`),
      );
      const expected = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (expected !== razorpay_signature) return json({ error: "Invalid signature" }, 400);

      // Insert order + mark slot booked (atomic-ish)
      const { data: order, error: ordErr } = await admin
        .from("orders")
        .insert({
          user_id: slot.creator_id,
          buyer_email: email,
          buyer_name: name,
          amount: slot.price,
          currency: slot.currency,
          status: "paid",
          payment_method: "razorpay",
          razorpay_order_id,
          razorpay_payment_id,
          product_type: "booking",
          metadata: { slot_id, title: slot.title, slot_date: slot.slot_date, start_time: slot.start_time },
        })
        .select()
        .single();

      const orderId = order?.id ?? null;

      const { error: updErr } = await admin
        .from("booking_slots")
        .update({
          is_booked: true,
          booked_by_email: email,
          booked_by_name: name,
          order_id: orderId,
        })
        .eq("id", slot_id)
        .eq("is_booked", false);
      if (updErr) return json({ error: updErr.message }, 500);

      return json({ success: true, order_id: orderId, order_err: ordErr?.message });
    }

    // === Free slot: book immediately ===
    if (Number(slot.price) === 0) {
      const { error: updErr } = await admin
        .from("booking_slots")
        .update({
          is_booked: true,
          booked_by_email: email,
          booked_by_name: name,
        })
        .eq("id", slot_id)
        .eq("is_booked", false);
      if (updErr) return json({ error: updErr.message }, 500);
      return json({ success: true, free: true });
    }

    // === Paid slot: create Razorpay order ===
    if (!RZP_KEY_ID || !RZP_KEY_SECRET) return json({ error: "Razorpay not configured" }, 500);

    const auth = "Basic " + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);
    const amountPaise = Math.round(Number(slot.price) * 100);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({
        amount: amountPaise,
        currency: slot.currency || "INR",
        notes: { slot_id, creator_id: slot.creator_id, type: "booking" },
      }),
    });
    if (!rzpRes.ok) {
      const t = await rzpRes.text();
      return json({ error: `Razorpay: ${t}` }, 502);
    }
    const rzpOrder = await rzpRes.json();
    return json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      razorpay_key_id: RZP_KEY_ID,
      amount: amountPaise,
      currency: slot.currency,
    });
  } catch (e: any) {
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
