import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAY-WITH-WALLET] ${step}${detailsStr}`);
};

const WALLET_PLANS: Record<string, { name: string; price: number; stripePlan: string }> = {
  starter: { name: "Starter Pro", price: 3, stripePlan: "starter" },
  full: { name: "Full Pro", price: 5, stripePlan: "full" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan } = await req.json();

    if (!plan || !WALLET_PLANS[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan. Must be 'starter' or 'full'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selectedPlan = WALLET_PLANS[plan];
    logStep("Processing wallet payment", { plan, price: selectedPlan.price });

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

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Get profile with advisory lock to prevent race conditions
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, wallet_balance, is_pro")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((profile.wallet_balance || 0) < selectedPlan.price) {
      return new Response(
        JSON.stringify({
          error: "Insufficient wallet balance",
          balance: profile.wallet_balance,
          required: selectedPlan.price,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct from wallet and activate Pro
    const newBalance = (profile.wallet_balance || 0) - selectedPlan.price;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance, is_pro: true })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    // Cancel any existing wallet subscription for this user
    await supabase
      .from("wallet_subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active");

    // Create new wallet subscription record for auto-renewal
    const nextRenewal = new Date();
    nextRenewal.setDate(nextRenewal.getDate() + 30);

    const { error: subError } = await supabase.from("wallet_subscriptions").insert({
      user_id: userId,
      plan,
      price: selectedPlan.price,
      status: "active",
      next_renewal_at: nextRenewal.toISOString(),
    });

    if (subError) {
      logStep("Error creating wallet subscription record", { subError });
    }

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "subscription",
      amount: -selectedPlan.price,
      description: `${selectedPlan.name} subscription via wallet`,
    });

    // Audit log
    await supabase.from("security_audit_log").insert({
      user_id: userId,
      event_type: "wallet_subscription_purchase",
      event_data: { plan, price: selectedPlan.price, new_balance: newBalance },
      success: true,
    });

    logStep("Subscription activated", { plan, newBalance, nextRenewal: nextRenewal.toISOString() });

    return new Response(
      JSON.stringify({
        success: true,
        plan: selectedPlan.name,
        price: selectedPlan.price,
        new_balance: newBalance,
        next_renewal: nextRenewal.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
