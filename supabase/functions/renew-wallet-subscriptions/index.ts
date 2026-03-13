import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[RENEW-WALLET-SUBS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    logStep("Starting auto-renewal check");

    // Find all active wallet subscriptions due for renewal
    const now = new Date().toISOString();
    const { data: dueSubs, error: fetchError } = await supabase
      .from("wallet_subscriptions")
      .select("id, user_id, plan, price")
      .eq("status", "active")
      .lte("next_renewal_at", now);

    if (fetchError) throw fetchError;

    if (!dueSubs || dueSubs.length === 0) {
      logStep("No subscriptions due for renewal");
      return new Response(
        JSON.stringify({ success: true, renewed: 0, expired: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Found subscriptions due", { count: dueSubs.length });

    let renewed = 0;
    let expired = 0;

    for (const sub of dueSubs) {
      // Get current wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", sub.user_id)
        .single();

      if (!profile || (profile.wallet_balance || 0) < sub.price) {
        // Insufficient balance - expire subscription
        logStep("Insufficient balance, expiring", { userId: sub.user_id, balance: profile?.wallet_balance, required: sub.price });

        await supabase
          .from("wallet_subscriptions")
          .update({ status: "expired", cancelled_at: now })
          .eq("id", sub.id);

        // Remove Pro status (only if no active Stripe subscription)
        // We set is_pro = false; if they have a Stripe sub, check-subscription will re-enable it
        await supabase
          .from("profiles")
          .update({ is_pro: false })
          .eq("user_id", sub.user_id);

        await supabase.from("transactions").insert({
          user_id: sub.user_id,
          type: "subscription_expired",
          amount: 0,
          description: `Wallet subscription expired - insufficient balance ($${profile?.wallet_balance || 0} < $${sub.price})`,
        });

        expired++;
        continue;
      }

      // Deduct and renew
      const newBalance = (profile.wallet_balance || 0) - sub.price;
      const nextRenewal = new Date();
      nextRenewal.setDate(nextRenewal.getDate() + 30);

      await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", sub.user_id);

      await supabase
        .from("wallet_subscriptions")
        .update({ next_renewal_at: nextRenewal.toISOString() })
        .eq("id", sub.id);

      await supabase.from("transactions").insert({
        user_id: sub.user_id,
        type: "subscription_renewal",
        amount: -sub.price,
        description: `Auto-renewal: ${sub.plan === 'full' ? 'Full Pro' : 'Starter Pro'} via wallet`,
      });

      logStep("Renewed subscription", { userId: sub.user_id, newBalance, nextRenewal: nextRenewal.toISOString() });
      renewed++;
    }

    logStep("Auto-renewal complete", { renewed, expired });

    return new Response(
      JSON.stringify({ success: true, renewed, expired }),
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
