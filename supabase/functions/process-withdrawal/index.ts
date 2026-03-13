import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-WITHDRAWAL] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { withdrawal_id, action } = await req.json();

    if (!withdrawal_id || !["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "withdrawal_id and action (approve|reject) required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep(`Processing ${action} for withdrawal: ${withdrawal_id}`);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid auth token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch withdrawal
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawal_id)
      .in("status", ["pending", "processing"])
      .single();

    if (fetchError || !withdrawal) {
      return new Response(
        JSON.stringify({ error: "Pending withdrawal not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_id, wallet_balance, display_name, username")
      .eq("user_id", withdrawal.user_id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "approve") {
      // Mark as completed (admin transfers manually via their bank app)
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal",
        amount: -withdrawal.amount,
        description: `Withdrawal via ${withdrawal.payment_method} (manual transfer)`,
        reference_id: withdrawal_id,
      });

      await supabase
        .from("profiles")
        .update({ total_withdrawn: (profile as any).total_withdrawn + withdrawal.amount })
        .eq("user_id", withdrawal.user_id);

      await supabase
        .from("withdrawals")
        .update({ status: "approved", processed_at: new Date().toISOString() })
        .eq("id", withdrawal_id);

      // Audit log
      await supabase.from("security_audit_log").insert({
        user_id: userData.user.id,
        event_type: "withdrawal_approved",
        event_data: { withdrawal_id, amount: withdrawal.amount, creator: profile.username },
        success: true,
      });

      logStep(`Approved $${withdrawal.amount} for @${profile.username}`);

    } else {
      // Reject: refund wallet
      await supabase
        .from("profiles")
        .update({ wallet_balance: (profile.wallet_balance || 0) + withdrawal.amount })
        .eq("user_id", withdrawal.user_id);

      await supabase
        .from("withdrawals")
        .update({ status: "rejected", processed_at: new Date().toISOString() })
        .eq("id", withdrawal_id);

      await supabase.from("security_audit_log").insert({
        user_id: userData.user.id,
        event_type: "withdrawal_rejected",
        event_data: { withdrawal_id, amount: withdrawal.amount, creator: profile.username },
        success: true,
      });

      logStep(`Rejected & refunded $${withdrawal.amount} to @${profile.username}`);
    }

    return new Response(
      JSON.stringify({ success: true, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { error: msg });
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});