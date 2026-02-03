import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, x-supabase-client-platform, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const RATE_LIMIT_WINDOW_MINUTES = 15;

interface SecurityCheckRequest {
  action: "check_lockout" | "record_attempt" | "log_event" | "get_stats";
  email?: string;
  success?: boolean;
  failure_reason?: string;
  event_type?: string;
  event_data?: Record<string, unknown>;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client info from headers
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const body: SecurityCheckRequest = await req.json();
    const { action, email, success, failure_reason, event_type, event_data, user_id } = body;

    if (action === "check_lockout") {
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if account is locked
      const { data: lockout } = await supabase
        .from("account_lockouts")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (lockout && new Date(lockout.locked_until) > new Date()) {
        const remainingMinutes = Math.ceil(
          (new Date(lockout.locked_until).getTime() - Date.now()) / 60000
        );
        
        console.log(`Account ${email} is locked. ${remainingMinutes} minutes remaining`);
        
        return new Response(
          JSON.stringify({ 
            locked: true, 
            remaining_minutes: remainingMinutes,
            failed_attempts: lockout.failed_attempts,
            message: `Account temporarily locked. Try again in ${remainingMinutes} minutes.`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check recent failed attempts
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60000).toISOString();
      
      const { count } = await supabase
        .from("login_attempts")
        .select("*", { count: "exact", head: true })
        .eq("email", email.toLowerCase())
        .eq("success", false)
        .gte("created_at", windowStart);

      return new Response(
        JSON.stringify({ 
          locked: false, 
          recent_failed_attempts: count || 0,
          max_attempts: MAX_LOGIN_ATTEMPTS,
          attempts_remaining: MAX_LOGIN_ATTEMPTS - (count || 0)
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "record_attempt") {
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const normalizedEmail = email.toLowerCase();

      // Record the login attempt
      await supabase.from("login_attempts").insert({
        email: normalizedEmail,
        ip_address: clientIP,
        user_agent: userAgent,
        success: success || false,
        failure_reason: failure_reason || null,
      });

      console.log(`Login attempt for ${normalizedEmail}: ${success ? "SUCCESS" : "FAILED"}`);

      if (!success) {
        // Count recent failed attempts
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60000).toISOString();
        
        const { count } = await supabase
          .from("login_attempts")
          .select("*", { count: "exact", head: true })
          .eq("email", normalizedEmail)
          .eq("success", false)
          .gte("created_at", windowStart);

        const failedCount = count || 0;

        // Lock account if too many attempts
        if (failedCount >= MAX_LOGIN_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
          
          await supabase.from("account_lockouts").upsert({
            email: normalizedEmail,
            locked_until: lockedUntil.toISOString(),
            failed_attempts: failedCount,
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

          console.log(`Account ${normalizedEmail} locked until ${lockedUntil.toISOString()}`);

          // Log security event
          await supabase.from("security_audit_log").insert({
            event_type: "ACCOUNT_LOCKED",
            event_data: { 
              email: normalizedEmail, 
              failed_attempts: failedCount,
              locked_until: lockedUntil.toISOString()
            },
            ip_address: clientIP,
            user_agent: userAgent,
            success: false,
          });

          return new Response(
            JSON.stringify({ 
              locked: true,
              locked_until: lockedUntil.toISOString(),
              message: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            locked: false,
            attempts_remaining: MAX_LOGIN_ATTEMPTS - failedCount,
            message: `${MAX_LOGIN_ATTEMPTS - failedCount} attempts remaining before lockout.`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Successful login - clear lockout if exists
      await supabase
        .from("account_lockouts")
        .delete()
        .eq("email", normalizedEmail);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "log_event") {
      if (!event_type) {
        return new Response(
          JSON.stringify({ error: "Event type required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.from("security_audit_log").insert({
        user_id: user_id || null,
        event_type,
        event_data: event_data || {},
        ip_address: clientIP,
        user_agent: userAgent,
        success: success ?? true,
      });

      console.log(`Security event logged: ${event_type} for user ${user_id || "anonymous"}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_stats") {
      // Get security statistics for admin dashboard
      const last24h = new Date(Date.now() - 24 * 60 * 60000).toISOString();
      const last7d = new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString();

      // Failed login attempts in last 24h
      const { count: failedAttempts24h } = await supabase
        .from("login_attempts")
        .select("*", { count: "exact", head: true })
        .eq("success", false)
        .gte("created_at", last24h);

      // Current locked accounts
      const { count: lockedAccounts } = await supabase
        .from("account_lockouts")
        .select("*", { count: "exact", head: true })
        .gte("locked_until", new Date().toISOString());

      // Security events in last 7 days
      const { data: recentEvents } = await supabase
        .from("security_audit_log")
        .select("*")
        .gte("created_at", last7d)
        .order("created_at", { ascending: false })
        .limit(50);

      // Suspicious IPs (multiple failed attempts from same IP)
      const { data: suspiciousIPs } = await supabase
        .from("login_attempts")
        .select("ip_address")
        .eq("success", false)
        .gte("created_at", last24h);

      const ipCounts: Record<string, number> = {};
      suspiciousIPs?.forEach((attempt) => {
        if (attempt.ip_address) {
          ipCounts[attempt.ip_address] = (ipCounts[attempt.ip_address] || 0) + 1;
        }
      });

      const flaggedIPs = Object.entries(ipCounts)
        .filter(([, count]) => count >= 3)
        .map(([ip, count]) => ({ ip, attempts: count }));

      return new Response(
        JSON.stringify({
          failed_attempts_24h: failedAttempts24h || 0,
          locked_accounts: lockedAccounts || 0,
          recent_events: recentEvents || [],
          flagged_ips: flaggedIPs,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in security-check:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
