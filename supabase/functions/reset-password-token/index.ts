import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, user_id, new_password } = await req.json();

    if (!token || !user_id || !new_password) {
      throw new Error("Missing required fields");
    }

    if (new_password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify reset token
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("reset_token, reset_token_expires_at")
      .eq("user_id", user_id)
      .single();

    if (fetchError || !profile) {
      throw new Error("Profile not found");
    }

    if (profile.reset_token !== token) {
      throw new Error("Invalid reset token");
    }

    if (new Date(profile.reset_token_expires_at) < new Date()) {
      throw new Error("Reset token has expired. Please request a new one.");
    }

    // Update password via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
      password: new_password,
    });

    if (updateError) {
      throw new Error("Failed to update password: " + updateError.message);
    }

    // Clear reset token
    await supabase
      .from("profiles")
      .update({
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq("user_id", user_id);

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
