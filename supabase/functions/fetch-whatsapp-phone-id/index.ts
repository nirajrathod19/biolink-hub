import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("WHATSAPP_ACCESS_TOKEN not configured");
    }

    const businessId = "2424612421383883";
    const results: any = {};

    // Step 1: Find WhatsApp Business Accounts (WABA) owned by this Business
    const wabaRes = await fetch(
      `https://graph.facebook.com/v21.0/${businessId}/owned_whatsapp_business_accounts?access_token=${accessToken}`
    );
    const wabaData = await wabaRes.json();
    results.step1_waba = wabaData;

    // Step 2: If WABAs found, get phone numbers from each
    if (wabaData.data && wabaData.data.length > 0) {
      results.phone_numbers = [];
      for (const waba of wabaData.data) {
        const phoneRes = await fetch(
          `https://graph.facebook.com/v21.0/${waba.id}/phone_numbers?access_token=${accessToken}`
        );
        const phoneData = await phoneRes.json();
        results.phone_numbers.push({
          waba_id: waba.id,
          waba_name: waba.name,
          phones: phoneData,
        });
      }
    } else {
      // Step 2b: Try client_whatsapp_business_accounts
      const clientWabaRes = await fetch(
        `https://graph.facebook.com/v21.0/${businessId}/client_whatsapp_business_accounts?access_token=${accessToken}`
      );
      const clientWabaData = await clientWabaRes.json();
      results.step2_client_waba = clientWabaData;

      if (clientWabaData.data && clientWabaData.data.length > 0) {
        results.phone_numbers = [];
        for (const waba of clientWabaData.data) {
          const phoneRes = await fetch(
            `https://graph.facebook.com/v21.0/${waba.id}/phone_numbers?access_token=${accessToken}`
          );
          const phoneData = await phoneRes.json();
          results.phone_numbers.push({
            waba_id: waba.id,
            waba_name: waba.name,
            phones: phoneData,
          });
        }
      }
    }

    // Step 3: Also try directly querying the token's own info
    const meRes = await fetch(
      `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    const meData = await meRes.json();
    results.token_debug = meData;

    return new Response(JSON.stringify({ success: true, results }), {
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