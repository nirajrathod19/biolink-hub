import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRO_THRESHOLD = 1000;
const REVENUE_PER_UNIQUE_VIEW = 0.001;
const REFERRAL_COMMISSION_RATE = 0.05;
const CPM_RATE = 2.50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id, track_ad_impression } = await req.json();

    if (!profile_id) {
      return new Response(
        JSON.stringify({ error: "profile_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profile_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid profile_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const visitorIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip") 
      || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const referer = req.headers.get("referer") || null;

    console.log(`[TRACK-VIEW] Tracking view for profile: ${profile_id}, IP: ${visitorIp}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this visitor has already visited
    const { data: existingVisit, error: checkError } = await supabase
      .from("click_logs")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("visitor_ip", visitorIp)
      .eq("user_agent", userAgent)
      .maybeSingle();

    if (checkError) throw checkError;

    const isUnique = !existingVisit;
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";

    const { data: clickLog, error: logError } = await supabase
      .from("click_logs")
      .insert({
        profile_id,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        referer,
        is_unique: isUnique,
        device_type: deviceType,
      })
      .select("id")
      .single();

    if (logError) throw logError;

    // Get profile stats
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id, total_clicks, unique_clicks, is_pro, pending_revenue, referred_by, ads_balance")
      .eq("id", profile_id)
      .limit(1)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newTotalClicks = (profile.total_clicks || 0) + 1;
    const newUniqueClicks = isUnique 
      ? (profile.unique_clicks || 0) + 1 
      : profile.unique_clicks || 0;

    const shouldUnlockPro = !profile.is_pro && newUniqueClicks >= PRO_THRESHOLD;

    // Determine revenue share based on subscription tier
    // Check subscription tier from adsense_settings or default
    let creatorShareRate = 0.5; // Default 50% for starter
    
    // Check if user has a subscription and what tier
    const { data: checkSubData } = await supabase
      .from("adsense_settings")
      .select("is_revenue_sharing_enabled")
      .eq("user_id", profile.user_id)
      .maybeSingle();

    // We'll use is_pro status - full pro gets 100%, starter gets 50%
    // This is simplified; the actual tier check happens via check-subscription
    const isPro = profile.is_pro || shouldUnlockPro;

    let creatorRevenue = 0;
    let newPendingRevenue = profile.pending_revenue || 0;

    if (isUnique) {
      const totalRevenue = REVENUE_PER_UNIQUE_VIEW;
      
      if (isPro) {
        creatorRevenue = totalRevenue * creatorShareRate;
        newPendingRevenue = newPendingRevenue + creatorRevenue;

        // Record earning transaction
        await supabase.from("transactions").insert({
          user_id: profile.user_id,
          type: "earning",
          amount: creatorRevenue,
          description: "Ad revenue from profile view",
          reference_id: clickLog.id,
        });

        // Update daily ad earnings log
        const today = new Date().toISOString().split("T")[0];
        const { data: existingLog } = await supabase
          .from("ad_earnings_logs")
          .select("id, impressions, gross_revenue, creator_share, platform_share")
          .eq("user_id", profile.user_id)
          .eq("date", today)
          .maybeSingle();

        if (existingLog) {
          await supabase
            .from("ad_earnings_logs")
            .update({
              impressions: (existingLog.impressions || 0) + 1,
              gross_revenue: (existingLog.gross_revenue || 0) + totalRevenue,
              creator_share: (existingLog.creator_share || 0) + creatorRevenue,
              platform_share: (existingLog.platform_share || 0) + (totalRevenue - creatorRevenue),
              revenue_share_pct: creatorShareRate * 100,
            })
            .eq("id", existingLog.id);
        } else {
          await supabase.from("ad_earnings_logs").insert({
            user_id: profile.user_id,
            date: today,
            impressions: 1,
            gross_revenue: totalRevenue,
            creator_share: creatorRevenue,
            platform_share: totalRevenue - creatorRevenue,
            revenue_share_pct: creatorShareRate * 100,
          });
        }

        // Process referral commission
        if (profile.referred_by) {
          const { data: referrerProfile } = await supabase
            .from("profiles")
            .select("id, user_id, pending_revenue")
            .eq("id", profile.referred_by)
            .single();

          if (referrerProfile) {
            const platformShare = totalRevenue * (1 - creatorShareRate);
            const referralRevenue = platformShare * REFERRAL_COMMISSION_RATE;

            await supabase
              .from("profiles")
              .update({
                pending_revenue: (referrerProfile.pending_revenue || 0) + referralRevenue,
              })
              .eq("id", referrerProfile.id);

            await supabase.from("transactions").insert({
              user_id: referrerProfile.user_id,
              type: "referral",
              amount: referralRevenue,
              description: `Referral commission from @${profile_id}`,
              reference_id: clickLog.id,
            });
          }
        }
      }
    }

    // Track ad impression if requested
    if (track_ad_impression && isUnique) {
      const estimatedAdRevenue = CPM_RATE / 1000;
      const creatorAdShare = isPro ? estimatedAdRevenue * creatorShareRate : 0;
      
      await supabase.from("ad_impressions").insert({
        profile_id,
        user_id: profile.user_id,
        estimated_revenue: estimatedAdRevenue,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        device_type: deviceType,
      });

      const { data: existingSettings } = await supabase
        .from("adsense_settings")
        .select("total_impressions, total_estimated_revenue, creator_earnings")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (existingSettings) {
        await supabase
          .from("adsense_settings")
          .update({
            total_impressions: (existingSettings.total_impressions || 0) + 1,
            total_estimated_revenue: (existingSettings.total_estimated_revenue || 0) + estimatedAdRevenue,
            creator_earnings: (existingSettings.creator_earnings || 0) + creatorAdShare,
            last_calculated_at: new Date().toISOString(),
          })
          .eq("user_id", profile.user_id);
      } else {
        await supabase.from("adsense_settings").insert({
          user_id: profile.user_id,
          total_impressions: 1,
          total_estimated_revenue: estimatedAdRevenue,
          creator_earnings: creatorAdShare,
          is_revenue_sharing_enabled: isPro,
          last_calculated_at: new Date().toISOString(),
        });
      }
    }

    // Update profile
    await supabase
      .from("profiles")
      .update({
        total_clicks: newTotalClicks,
        unique_clicks: newUniqueClicks,
        pending_revenue: newPendingRevenue,
        ...(shouldUnlockPro && { is_pro: true }),
      })
      .eq("id", profile_id);

    return new Response(
      JSON.stringify({
        success: true,
        total_clicks: newTotalClicks,
        unique_clicks: newUniqueClicks,
        is_unique: isUnique,
        pro_unlocked: shouldUnlockPro,
        revenue_earned: creatorRevenue,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
    console.error("[TRACK-VIEW] Error:", errorMessage, "Full error:", JSON.stringify(error));
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
