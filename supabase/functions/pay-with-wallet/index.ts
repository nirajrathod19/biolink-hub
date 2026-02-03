import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for logging
const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAY-WITH-WALLET] ${step}${detailsStr}`);
};

// Subscription plans with prices
const SUBSCRIPTION_PLANS: Record<string, { name: string; price: number; durationDays: number }> = {
  monthly: { name: "Pro Monthly", price: 3, durationDays: 30 },
  quarterly: { name: "Pro 4 Months", price: 11, durationDays: 120 },
  annual: { name: "Pro Annual", price: 30, durationDays: 365 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan } = await req.json();

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan. Must be 'monthly', 'quarterly', or 'annual'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    logStep("Processing wallet payment", { plan, price: selectedPlan.price });

    // Verify auth
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

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Auth failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid auth token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, wallet_balance, is_pro")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      logStep("Profile not found", { profileError });
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has enough balance
    if (profile.wallet_balance < selectedPlan.price) {
      logStep("Insufficient balance", { balance: profile.wallet_balance, required: selectedPlan.price });
      return new Response(
        JSON.stringify({ 
          error: "Insufficient wallet balance",
          balance: profile.wallet_balance,
          required: selectedPlan.price,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct from wallet balance and set pro status
    const newBalance = profile.wallet_balance - selectedPlan.price;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        wallet_balance: newBalance,
        is_pro: true,
      })
      .eq("user_id", userId);

    if (updateError) {
      logStep("Error updating profile", { updateError });
      throw updateError;
    }

    // Record subscription transaction
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "subscription",
      amount: -selectedPlan.price,
      description: `${selectedPlan.name} subscription via wallet`,
    });

    if (txError) {
      logStep("Error recording transaction", { txError });
      // Don't throw, just log - the subscription was already activated
    }

    logStep("Subscription activated successfully", { 
      plan, 
      price: selectedPlan.price, 
      newBalance,
      durationDays: selectedPlan.durationDays,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: selectedPlan.name,
        price: selectedPlan.price,
        new_balance: newBalance,
        duration_days: selectedPlan.durationDays,
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
