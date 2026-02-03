import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Moves pending_revenue to wallet_balance for all profiles
// Can be called manually by admin or via cron job
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[MOVE-PENDING] Starting pending revenue transfer");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all profiles with pending revenue > 0
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, user_id, pending_revenue, wallet_balance")
      .gt("pending_revenue", 0);

    if (fetchError) {
      console.error("[MOVE-PENDING] Error fetching profiles:", fetchError);
      throw fetchError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("[MOVE-PENDING] No pending revenue to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[MOVE-PENDING] Processing ${profiles.length} profiles with pending revenue`);

    let processedCount = 0;
    let totalMoved = 0;

    for (const profile of profiles) {
      const pendingAmount = profile.pending_revenue || 0;
      const currentBalance = profile.wallet_balance || 0;

      // Move pending to wallet
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          wallet_balance: currentBalance + pendingAmount,
          pending_revenue: 0,
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error(`[MOVE-PENDING] Error updating profile ${profile.id}:`, updateError);
        continue;
      }

      processedCount++;
      totalMoved += pendingAmount;
      console.log(`[MOVE-PENDING] Moved $${pendingAmount.toFixed(4)} for profile ${profile.id}`);
    }

    console.log(`[MOVE-PENDING] Completed. Processed: ${processedCount}, Total moved: $${totalMoved.toFixed(2)}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        total_moved: totalMoved,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[MOVE-PENDING] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
