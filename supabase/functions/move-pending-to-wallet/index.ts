import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Moves pending_revenue to wallet_balance for all profiles
// Requires admin authentication
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[MOVE-PENDING] Starting pending revenue transfer");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentication check - require Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[MOVE-PENDING] Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify the user from the token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error("[MOVE-PENDING] Invalid token:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin"
    });

    if (roleError || !isAdmin) {
      console.error("[MOVE-PENDING] Admin access denied for user:", userData.user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[MOVE-PENDING] Authorized admin: ${userData.user.id}`);

    // Log the action to security audit
    await supabase.from("security_audit_log").insert({
      user_id: userData.user.id,
      event_type: "admin_move_pending_to_wallet",
      event_data: { action: "initiated" },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
      success: true
    });

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

    // Log completion
    await supabase.from("security_audit_log").insert({
      user_id: userData.user.id,
      event_type: "admin_move_pending_to_wallet",
      event_data: { 
        action: "completed",
        processed_count: processedCount,
        total_moved: totalMoved
      },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
      success: true
    });

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