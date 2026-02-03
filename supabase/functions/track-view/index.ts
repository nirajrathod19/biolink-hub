import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_THRESHOLD = 1000;
const REVENUE_PER_UNIQUE_VIEW = 0.001; // $0.001 per unique view
const CREATOR_SHARE = 0.5; // 50% to creator when Pro
const REFERRAL_COMMISSION_RATE = 0.05; // 5% Level 1 referral commission

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id } = await req.json();

    if (!profile_id) {
      console.error("Missing profile_id in request");
      return new Response(
        JSON.stringify({ error: "profile_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get visitor information from headers
    const visitorIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip") 
      || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const referer = req.headers.get("referer") || null;

    console.log(`[TRACK-VIEW] Tracking view for profile: ${profile_id}, IP: ${visitorIp}`);

    // Create Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this visitor has already visited this profile
    const { data: existingVisit, error: checkError } = await supabase
      .from("click_logs")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("visitor_ip", visitorIp)
      .eq("user_agent", userAgent)
      .maybeSingle();

    if (checkError) {
      console.error("[TRACK-VIEW] Error checking existing visit:", checkError);
      throw checkError;
    }

    const isUnique = !existingVisit;
    console.log(`[TRACK-VIEW] Visitor is unique: ${isUnique}`);

    // Log the click
    const { data: clickLog, error: logError } = await supabase
      .from("click_logs")
      .insert({
        profile_id,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        referer,
        is_unique: isUnique,
      })
      .select("id")
      .single();

    if (logError) {
      console.error("[TRACK-VIEW] Error logging click:", logError);
      throw logError;
    }

    // Get current profile stats including user_id and referrer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id, total_clicks, unique_clicks, is_pro, pending_revenue, referred_by")
      .eq("id", profile_id)
      .single();

    if (profileError) {
      console.error("[TRACK-VIEW] Error fetching profile:", profileError);
      throw profileError;
    }

    const newTotalClicks = (profile.total_clicks || 0) + 1;
    const newUniqueClicks = isUnique 
      ? (profile.unique_clicks || 0) + 1 
      : profile.unique_clicks || 0;

    // Check if should unlock Pro
    const shouldUnlockPro = !profile.is_pro && newUniqueClicks >= PRO_THRESHOLD;
    
    if (shouldUnlockPro) {
      console.log(`[TRACK-VIEW] 🎉 Profile ${profile_id} unlocked Pro status!`);
    }

    // Calculate revenue only for unique views
    let creatorRevenue = 0;
    let referralRevenue = 0;
    let newPendingRevenue = profile.pending_revenue || 0;

    if (isUnique) {
      const totalRevenue = REVENUE_PER_UNIQUE_VIEW;
      
      // Check if creator is Pro (or just became Pro)
      const isPro = profile.is_pro || shouldUnlockPro;
      
      if (isPro) {
        // 50% to creator, 50% to platform
        creatorRevenue = totalRevenue * CREATOR_SHARE;
        newPendingRevenue = newPendingRevenue + creatorRevenue;
        console.log(`[TRACK-VIEW] Pro creator earns: $${creatorRevenue.toFixed(4)}`);

        // Record earning transaction
        await supabase.from("transactions").insert({
          user_id: profile.user_id,
          type: "earning",
          amount: creatorRevenue,
          description: "Ad revenue from profile view",
          reference_id: clickLog.id,
        });

        // Process Level 1 referral commission
        if (profile.referred_by) {
          // Get referrer's profile
          const { data: referrerProfile, error: referrerError } = await supabase
            .from("profiles")
            .select("id, user_id, pending_revenue")
            .eq("id", profile.referred_by)
            .single();

          if (!referrerError && referrerProfile) {
            // 5% of platform's share (which is 50%)
            const platformShare = totalRevenue * (1 - CREATOR_SHARE);
            referralRevenue = platformShare * REFERRAL_COMMISSION_RATE;
            
            console.log(`[TRACK-VIEW] Referrer earns commission: $${referralRevenue.toFixed(4)}`);

            // Update referrer's pending revenue
            await supabase
              .from("profiles")
              .update({
                pending_revenue: (referrerProfile.pending_revenue || 0) + referralRevenue,
              })
              .eq("id", referrerProfile.id);

            // Record referral transaction for referrer
            await supabase.from("transactions").insert({
              user_id: referrerProfile.user_id,
              type: "referral",
              amount: referralRevenue,
              description: `Referral commission from @${profile_id}`,
              reference_id: clickLog.id,
            });

            // Update referrals table commission_earned
            await supabase
              .from("referrals")
              .update({
                commission_earned: supabase.rpc("increment_commission", {
                  referral_id: profile.referred_by,
                  amount: referralRevenue,
                }),
              })
              .eq("referrer_id", referrerProfile.id)
              .eq("referred_id", profile.id);
          }
        }
      } else {
        console.log(`[TRACK-VIEW] Non-Pro creator - 100% revenue to platform`);
      }
    }

    // Update profile with new counts and revenue
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        total_clicks: newTotalClicks,
        unique_clicks: newUniqueClicks,
        pending_revenue: newPendingRevenue,
        ...(shouldUnlockPro && { is_pro: true }),
      })
      .eq("id", profile_id);

    if (updateError) {
      console.error("[TRACK-VIEW] Error updating profile:", updateError);
      throw updateError;
    }

    console.log(`[TRACK-VIEW] Successfully tracked view. Total: ${newTotalClicks}, Unique: ${newUniqueClicks}, Revenue: $${creatorRevenue.toFixed(4)}`);

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[TRACK-VIEW] Error tracking view:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
