import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  email: string;
  type: "verification" | "password_reset";
  user_id?: string;
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const SITE_URL = "https://brioo.in";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, user_id }: EmailRequest = await req.json();
    console.log(`Sending ${type} email to ${email}`);

    if (!email || !type) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: email and type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // --- Find the user by email ---
    let profileUserId = user_id;
    if (!profileUserId) {
      // Primary: use auth admin API
      try {
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (!listError && listData?.users) {
          const foundUser = listData.users.find(
            (u: any) => u.email?.toLowerCase() === email.toLowerCase()
          );
          if (foundUser) {
            profileUserId = foundUser.id;
          }
        }
      } catch (lookupErr) {
        console.error("User lookup error:", lookupErr);
      }
    }

    if (!profileUserId) {
      return new Response(
        JSON.stringify({ success: false, error: "No account found with this email address." }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject: string;
    let html: string;

    if (type === "verification") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          verification_token: token,
          verification_token_expires_at: expiresAt,
        })
        .eq("user_id", profileUserId);

      if (updateError) {
        console.error("Failed to store verification token:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to store verification token" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const verifyLink = `${SITE_URL}/verify-email?token=${token}&user_id=${profileUserId}&email=${encodeURIComponent(email)}`;

      subject = "Verify your Brioo account";
      html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 40px 30px;">
                <span style="font-size:24px;font-weight:700;color:white;">Brioo</span>
              </div>
              <div style="padding:40px;">
                <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#1a1a1a;">Verify your email</h1>
                <p style="margin:0 0 32px;font-size:16px;color:#666;line-height:1.6;">
                  Welcome to Brioo! Click the button below to verify your email address and start creating your bio link page.
                </p>
                <a href="${verifyLink}" style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;text-decoration:none;font-weight:600;font-size:16px;border-radius:12px;box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                  Verify Email Address
                </a>
                <p style="margin:32px 0 0;font-size:14px;color:#999;">
                  This link expires in 15 minutes. If you didn't create a Brioo account, you can safely ignore this email.
                </p>
              </div>
              <div style="padding:24px 40px;background:#fafafa;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                  © ${new Date().getFullYear()} Brioo. All rights reserved.<br>
                  <a href="${SITE_URL}" style="color:#10b981;">brioo.in</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (type === "password_reset") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          reset_token: token,
          reset_token_expires_at: expiresAt,
        })
        .eq("user_id", profileUserId);

      if (updateError) {
        console.error("Failed to store reset token:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to store reset token" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const resetLink = `${SITE_URL}/reset-password?token=${token}&user_id=${profileUserId}`;

      subject = "Reset your Brioo password";
      html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 40px 30px;">
                <span style="font-size:24px;font-weight:700;color:white;">Brioo</span>
              </div>
              <div style="padding:40px;">
                <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#1a1a1a;">Reset your password</h1>
                <p style="margin:0 0 32px;font-size:16px;color:#666;line-height:1.6;">
                  We received a request to reset your Brioo password. Click the button below to create a new password.
                </p>
                <a href="${resetLink}" style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;text-decoration:none;font-weight:600;font-size:16px;border-radius:12px;box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                  Reset Password
                </a>
                <p style="margin:32px 0 16px;font-size:14px;color:#999;">This link will expire in 15 minutes.</p>
                <p style="margin:0;font-size:14px;color:#999;">If you didn't request a password reset, you can safely ignore this email.</p>
              </div>
              <div style="padding:24px 40px;background:#fafafa;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                  © ${new Date().getFullYear()} Brioo. All rights reserved.<br>
                  <a href="${SITE_URL}" style="color:#10b981;">brioo.in</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // --- Send email via Resend ---
    try {
      const emailResponse = await resend.emails.send({
        from: "Brioo <noreply@brioo.in>",
        to: [email],
        reply_to: "support@brioo.in",
        subject,
        html,
      });

      console.log("Resend API response:", JSON.stringify(emailResponse));

      // Resend returns { data: null, error: { ... } } on failure
      if (emailResponse.error) {
        console.error("Resend API error:", JSON.stringify(emailResponse.error));
        const resendErr = emailResponse.error as any;
        return new Response(
          JSON.stringify({
            success: false,
            error: `Email delivery failed: ${resendErr.message || "Unknown Resend error"}`,
            resend_code: resendErr.name || resendErr.statusCode || null,
          }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: emailResponse }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (sendErr: any) {
      console.error("Resend send() threw:", sendErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Email service error: ${sendErr.message || "Unknown"}`,
          resend_code: sendErr?.statusCode || null,
        }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);