import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, x-supabase-client-platform, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, user_id, password } = await req.json();
    
    if (action === "setup") {
      // Set up admin password (first time or change)
      if (!user_id || !password) {
        return new Response(
          JSON.stringify({ error: "User ID and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is an admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id)
        .single();
      
      if (roleError || roleData?.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Unauthorized - Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Hash the password using bcrypt with 12 rounds
      const hashedPassword = await bcrypt.hash(password, 12);

      // Store or update admin password in admin_settings
      const { error: upsertError } = await supabase
        .from("admin_settings")
        .upsert(
          { 
            setting_key: "admin_password", 
            setting_value: hashedPassword,
            updated_by: user_id,
            updated_at: new Date().toISOString()
          },
          { onConflict: "setting_key" }
        );

      if (upsertError) {
        console.error("Error setting password:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to set password" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Admin password set/updated by user ${user_id}`);

      return new Response(
        JSON.stringify({ success: true, message: "Admin password set successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "verify") {
      // Verify admin password
      if (!user_id || !password) {
        return new Response(
          JSON.stringify({ error: "User ID and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is an admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id)
        .single();
      
      if (roleError || roleData?.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Unauthorized - Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get stored password hash
      const { data: settingData, error: settingError } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "admin_password")
        .single();

      if (settingError || !settingData?.setting_value) {
        // No password set yet - first time setup needed
        return new Response(
          JSON.stringify({ error: "Admin password not set. Please set up a password first.", needs_setup: true }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify password using bcrypt compare
      const isValid = await bcrypt.compare(password, settingData.setting_value);
      
      if (!isValid) {
        console.log(`Failed admin login attempt for user ${user_id}`);
        return new Response(
          JSON.stringify({ error: "Invalid password" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create session record
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const sessionToken = Array.from(tokenBytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      await supabase
        .from("admin_sessions")
        .insert({
          user_id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      console.log(`Admin session verified for user ${user_id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          user_id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check_setup") {
      // Check if admin password has been set up
      const { data: settingData } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "admin_password")
        .single();

      return new Response(
        JSON.stringify({ 
          has_password: !!settingData?.setting_value 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in admin-magic-link:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});