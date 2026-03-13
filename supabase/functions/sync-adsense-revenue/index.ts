import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REVENUE_SHARE_PCT = 50;
const ADSENSE_API_BASE = "https://adsense.googleapis.com/v2";

// --- Google Service Account JWT Auth ---

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function createSignedJwt(
  credentials: { client_email: string; private_key: string },
  scopes: string[]
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: credentials.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(credentials.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsignedToken))
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const jwt = await createSignedJwt(credentials, [
    "https://www.googleapis.com/auth/adsense.readonly",
  ]);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Google OAuth token error: ${res.status} – ${errBody}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

// --- AdSense API helpers ---

async function listAccounts(accessToken: string): Promise<string> {
  const res = await fetch(`${ADSENSE_API_BASE}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`AdSense accounts error: ${res.status} – ${errBody}`);
  }
  const data = await res.json();
  if (!data.accounts || data.accounts.length === 0) {
    throw new Error("No AdSense accounts found for this service account");
  }
  return data.accounts[0].name; // e.g. "accounts/pub-1234567890"
}

interface AdSenseReportRow {
  cells: { value: string }[];
}

async function fetchRevenueByUrl(
  accessToken: string,
  accountName: string,
  startDate: string,
  endDate: string
): Promise<Map<string, number>> {
  // Use URL channels dimension to attribute revenue per creator page
  const params = new URLSearchParams({
    "dateRange": "CUSTOM",
    "startDate.year": startDate.split("-")[0],
    "startDate.month": startDate.split("-")[1],
    "startDate.day": startDate.split("-")[2],
    "endDate.year": endDate.split("-")[0],
    "endDate.month": endDate.split("-")[1],
    "endDate.day": endDate.split("-")[2],
    "metrics": "ESTIMATED_EARNINGS",
    "dimensions": "URL_CHANNEL_NAME",
    "reportingTimeZone": "ACCOUNT_TIME_ZONE",
  });

  const res = await fetch(
    `${ADSENSE_API_BASE}/${accountName}/reports:generate?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`AdSense report error: ${res.status} – ${errBody}`);
  }

  const data = await res.json();
  const revenueMap = new Map<string, number>();

  if (data.rows) {
    for (const row of data.rows as AdSenseReportRow[]) {
      const urlChannel = row.cells[0]?.value || "";
      const earnings = parseFloat(row.cells[1]?.value || "0");
      if (urlChannel && earnings > 0) {
        revenueMap.set(urlChannel, earnings);
      }
    }
  }

  return revenueMap;
}

function extractUsernameFromUrl(urlChannel: string): string | null {
  // Match patterns like "/username" or "domain.com/username"
  const match = urlChannel.match(/\/([a-zA-Z0-9_-]+)\/?$/);
  return match ? match[1].toLowerCase() : null;
}

// --- Main handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify admin caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Load Google Service Account credentials from secret ---
    const credsRaw = Deno.env.get("GOOGLE_ADSENSE_CREDENTIALS");
    if (!credsRaw) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_ADSENSE_CREDENTIALS secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let credentials: { client_email: string; private_key: string };
    try {
      credentials = JSON.parse(credsRaw);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid GOOGLE_ADSENSE_CREDENTIALS JSON" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse optional body
    const body = await req.json().catch(() => ({}));
    const mode: string = body.mode || "auto"; // "auto" = fetch from AdSense API, "manual" = use provided entries

    let processedCount = 0;
    let totalDistributed = 0;

    if (mode === "manual" && body.entries?.length > 0) {
      // ---- Manual fallback: admin provides revenue per creator ----
      const manualEntries: { user_id?: string; username?: string; gross_revenue: number; description?: string }[] = body.entries;

      for (const entry of manualEntries) {
        let userId = entry.user_id;

        // Resolve username to user_id if needed
        if (!userId && entry.username) {
          const { data: foundProfile } = await supabase
            .from("profiles")
            .select("user_id")
            .ilike("username", entry.username)
            .maybeSingle();
          if (!foundProfile) {
            console.log(`No profile found for username: ${entry.username}`);
            continue;
          }
          userId = foundProfile.user_id;
        }

        if (!userId) continue;

        const creatorShare = (entry.gross_revenue * REVENUE_SHARE_PCT) / 100;
        const platformShare = entry.gross_revenue - creatorShare;

        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_balance, ads_balance")
          .eq("user_id", userId)
          .maybeSingle();

        if (!profile) continue;

        await supabase
          .from("profiles")
          .update({
            wallet_balance: (profile.wallet_balance || 0) + creatorShare,
            ads_balance: (profile.ads_balance || 0) + creatorShare,
          })
          .eq("user_id", userId);

        await supabase.from("ad_earnings_logs").insert({
          user_id: userId,
          date: new Date().toISOString().split("T")[0],
          gross_revenue: entry.gross_revenue,
          creator_share: creatorShare,
          platform_share: platformShare,
          revenue_share_pct: REVENUE_SHARE_PCT,
          impressions: 0,
        });

        await supabase.from("transactions").insert({
          user_id: userId,
          amount: creatorShare,
          type: "earning",
          description: entry.description || `AdSense revenue share (${REVENUE_SHARE_PCT}%)`,
        });

        processedCount++;
        totalDistributed += creatorShare;
      }
    } else {
      // ---- Auto mode: fetch from Google AdSense API ----
      let accountName: string | null = null;
      let accessToken: string | null = null;

      try {
        console.log("Authenticating with Google Service Account...");
        accessToken = await getAccessToken(credentials);
        console.log("Listing AdSense accounts...");
        accountName = await listAccounts(accessToken);
        console.log(`Using account: ${accountName}`);
      } catch (adsenseErr) {
        const errMsg = (adsenseErr as Error).message || "";
        const isNoAccount = errMsg.includes("No AdSense accounts found");
        console.warn(`AdSense API unavailable: ${errMsg}`);

        // Return a friendly response instead of crashing
        return new Response(
          JSON.stringify({
            success: false,
            error: isNoAccount
              ? "No AdSense account is linked to the service account. Please use Manual Revenue Entry instead, or invite the service account email to your AdSense account."
              : `AdSense API error: ${errMsg}. Please use Manual Revenue Entry as a fallback.`,
            fallback: "manual",
            hint: "Use the Manual Revenue Entry form below to credit creators directly.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch yesterday's revenue (standard AdSense reporting delay)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];

      console.log(`Fetching revenue for date: ${dateStr}`);
      const revenueByUrl = await fetchRevenueByUrl(accessToken!, accountName!, dateStr, dateStr);
      console.log(`Found ${revenueByUrl.size} URL channels with revenue`);

      // Match URL channels to creator usernames
      for (const [urlChannel, grossRevenue] of revenueByUrl) {
        const username = extractUsernameFromUrl(urlChannel);
        if (!username) {
          console.log(`Could not extract username from URL channel: ${urlChannel}`);
          continue;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, wallet_balance, ads_balance, username")
          .ilike("username", username)
          .maybeSingle();

        if (!profile) {
          console.log(`No profile found for username: ${username}`);
          continue;
        }

        const creatorShare = (grossRevenue * REVENUE_SHARE_PCT) / 100;
        const platformShare = grossRevenue - creatorShare;

        const { data: existing } = await supabase
          .from("ad_earnings_logs")
          .select("id")
          .eq("user_id", profile.user_id)
          .eq("date", dateStr)
          .maybeSingle();

        if (existing) {
          console.log(`Already synced for ${profile.username} on ${dateStr}, skipping`);
          continue;
        }

        await supabase
          .from("profiles")
          .update({
            wallet_balance: (profile.wallet_balance || 0) + creatorShare,
            ads_balance: (profile.ads_balance || 0) + creatorShare,
          })
          .eq("user_id", profile.user_id);

        await supabase.from("ad_earnings_logs").insert({
          user_id: profile.user_id,
          date: dateStr,
          gross_revenue: grossRevenue,
          creator_share: creatorShare,
          platform_share: platformShare,
          revenue_share_pct: REVENUE_SHARE_PCT,
          impressions: 0,
        });

        await supabase.from("transactions").insert({
          user_id: profile.user_id,
          amount: creatorShare,
          type: "earning",
          description: `AdSense revenue share (${REVENUE_SHARE_PCT}%) – ${dateStr}`,
        });

        console.log(`Credited $${creatorShare.toFixed(2)} to ${profile.username}`);
        processedCount++;
        totalDistributed += creatorShare;
      }
    }

    // Audit log
    await supabase.from("security_audit_log").insert({
      user_id: userData.user.id,
      event_type: "adsense_revenue_sync",
      event_data: {
        mode,
        processed_count: processedCount,
        total_distributed: totalDistributed,
        revenue_share_pct: REVENUE_SHARE_PCT,
      },
      success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        processed: processedCount,
        total_distributed: totalDistributed,
        revenue_share_pct: REVENUE_SHARE_PCT,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AdSense sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
