import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Revenue constants
const REVENUE_PER_IMPRESSION = 0.002; // $0.002 per impression (CPM ~$2)

interface FraudFlag {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
}

function detectSuspiciousImpressions(
  impressions: any[]
): { clean: any[]; flagged: any[]; flags: FraudFlag[] } {
  const flags: FraudFlag[] = [];
  const clean: any[] = [];
  const flagged: any[] = [];

  // Group by IP
  const ipCounts = new Map<string, number>();
  for (const imp of impressions) {
    const ip = imp.visitor_ip || "unknown";
    ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
  }

  // Flag IPs with > 50 impressions in a day as suspicious
  const suspiciousIPs = new Set<string>();
  for (const [ip, count] of ipCounts) {
    if (count > 50) {
      suspiciousIPs.add(ip);
      flags.push({
        code: "HIGH_IP_FREQUENCY",
        message: `IP ${ip.substring(0, 8)}... had ${count} impressions`,
        severity: "high",
      });
    }
  }

  for (const imp of impressions) {
    if (suspiciousIPs.has(imp.visitor_ip || "unknown")) {
      flagged.push(imp);
    } else {
      clean.push(imp);
    }
  }

  return { clean, flagged, flags };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin caller
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin access required" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Get all Pro users with active subscriptions
    const { data: proProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, user_id, username, is_pro, wallet_balance, pending_revenue, ads_balance")
      .eq("is_pro", true);

    if (profilesError) throw profilesError;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let totalProcessed = 0;
    let totalCreatorShare = 0;
    let totalPlatformShare = 0;
    const results: any[] = [];

    for (const profile of proProfiles || []) {
      // Determine subscription tier
      const { data: walletSub } = await supabase
        .from("wallet_subscriptions")
        .select("plan, status")
        .eq("user_id", profile.user_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no active subscription, skip (expired Pro)
      if (!walletSub) {
        // Also update is_pro to false if subscription expired
        await supabase
          .from("profiles")
          .update({ is_pro: false, updated_at: new Date().toISOString() })
          .eq("user_id", profile.user_id);
        continue;
      }

      // Gate payouts on monetization approval
      const { data: monetization } = await supabase
        .from("creator_monetization")
        .select("status, revenue_share_pct")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (!monetization || monetization.status !== "APPROVED") {
        results.push({
          username: profile.username,
          status: "not_approved",
          monetization_status: monetization?.status ?? "NOT_ELIGIBLE",
        });
        continue;
      }

      const plan = walletSub.plan || "starter";
      // Full Pro = 100% to creator, otherwise use approved share (default 50%)
      const creatorPct = plan === "full" ? 100 : Number(monetization.revenue_share_pct ?? 50);

      // Fetch yesterday's ad impressions for this profile
      const { data: impressions } = await supabase
        .from("ad_impressions")
        .select("*")
        .eq("user_id", profile.user_id)
        .gte("created_at", yesterday + "T00:00:00Z")
        .lt("created_at", today + "T00:00:00Z");

      if (!impressions || impressions.length === 0) continue;

      // Fraud detection
      const { clean, flagged, flags } = detectSuspiciousImpressions(impressions);

      if (clean.length === 0) {
        results.push({
          username: profile.username,
          status: "all_flagged",
          flagged_count: flagged.length,
          flags,
        });
        continue;
      }

      // Calculate revenue from clean impressions
      const grossRevenue = clean.length * REVENUE_PER_IMPRESSION;
      const creatorShare = grossRevenue * (creatorPct / 100);
      const platformShare = grossRevenue - creatorShare;

      // Update creator wallet balance
      await supabase
        .from("profiles")
        .update({
          wallet_balance: (profile.wallet_balance || 0) + creatorShare,
          ads_balance: (profile.ads_balance || 0) + creatorShare,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.user_id);

      // Update adsense_settings
      await supabase
        .from("adsense_settings")
        .upsert(
          {
            user_id: profile.user_id,
            total_impressions: clean.length,
            total_estimated_revenue: grossRevenue,
            creator_earnings: creatorShare,
            last_calculated_at: new Date().toISOString(),
            is_revenue_sharing_enabled: true,
          },
          { onConflict: "user_id" }
        );

      // Immutable ledger entry
      await supabase.from("creator_revenue").insert({
        creator_id: profile.user_id,
        source: "ADS",
        gross_amount: grossRevenue,
        deductions: 0,
        eligible_amount: grossRevenue,
        creator_share: creatorShare,
        platform_share: platformShare,
        currency: "USD",
        period: yesterday,
        status: "AVAILABLE",
        reference_id: `ads-${profile.user_id}-${yesterday}`,
        metadata: {
          impressions: clean.length,
          flagged: flagged.length,
          plan,
          creator_pct: creatorPct,
        },
      });

      // Notify the creator
      await supabase.from("notifications").insert({
        user_id: profile.user_id,
        type: "ad_earning",
        title: "Ad revenue credited",
        body: `You earned $${creatorShare.toFixed(4)} from ${clean.length} ad impressions.`,
        link: "/dashboard/revenue",
        metadata: { period: yesterday, creator_share: creatorShare },
      });

      // Log in ad_earnings_logs
      await supabase.from("ad_earnings_logs").upsert(
        {
          user_id: profile.user_id,
          date: yesterday,
          impressions: clean.length,
          gross_revenue: grossRevenue,
          creator_share: creatorShare,
          platform_share: platformShare,
          revenue_share_pct: creatorPct,
        },
        { onConflict: "user_id,date" }
      );

      // Transparency log in transactions
      await supabase.from("transactions").insert({
        user_id: profile.user_id,
        amount: creatorShare,
        type: "earning",
        description: `AD_REVENUE_SHARE: ${creatorPct}% of $${grossRevenue.toFixed(4)} (${clean.length} impressions, ${plan} plan)`,
      });

      // Security audit log
      await supabase.from("security_audit_log").insert({
        user_id: profile.user_id,
        event_type: "ad_revenue_calculation",
        event_data: {
          plan,
          creator_pct: creatorPct,
          gross_revenue: grossRevenue,
          creator_share: creatorShare,
          platform_share: platformShare,
          clean_impressions: clean.length,
          flagged_impressions: flagged.length,
          fraud_flags: flags,
          date: yesterday,
        },
        success: true,
      });

      totalProcessed++;
      totalCreatorShare += creatorShare;
      totalPlatformShare += platformShare;

      results.push({
        username: profile.username,
        plan,
        creator_pct: creatorPct,
        impressions: clean.length,
        flagged: flagged.length,
        gross_revenue: grossRevenue,
        creator_share: creatorShare,
        platform_share: platformShare,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: totalProcessed,
        total_creator_share: totalCreatorShare,
        total_platform_share: totalPlatformShare,
        total_distributed: totalCreatorShare,
        date: yesterday,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("calculate-ad-revenue error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});