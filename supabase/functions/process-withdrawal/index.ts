import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for logging
const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-WITHDRAWAL] ${step}${detailsStr}`);
};

// Get PayPal access token
const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  // Use production URL for live payments
  const baseUrl = "https://api-m.paypal.com";

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    logStep("PayPal auth error", { status: response.status, error: errorText });
    throw new Error(`PayPal authentication failed: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

// Process PayPal payout
const processPayPalPayout = async (
  accessToken: string,
  withdrawal: {
    id: string;
    amount: number;
    payment_details: { email?: string; paypal_email?: string };
  }
): Promise<{ success: boolean; payoutBatchId?: string; error?: string }> => {
  const paypalEmail = withdrawal.payment_details?.email || withdrawal.payment_details?.paypal_email;

  if (!paypalEmail) {
    return { success: false, error: "PayPal email not provided" };
  }

  // Use production URL for live payments
  const baseUrl = "https://api-m.paypal.com";

  const payoutRequest = {
    sender_batch_header: {
      sender_batch_id: `BRIOO_${withdrawal.id}_${Date.now()}`,
      email_subject: "You have received a payment from Brioo",
      email_message: "Thank you for being a Brioo creator! Your withdrawal has been processed.",
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: {
          value: withdrawal.amount.toFixed(2),
          currency: "USD",
        },
        receiver: paypalEmail,
        note: `Brioo withdrawal - ID: ${withdrawal.id}`,
        sender_item_id: withdrawal.id,
      },
    ],
  };

  logStep("Sending PayPal payout request", { 
    email: paypalEmail, 
    amount: withdrawal.amount,
    batchId: payoutRequest.sender_batch_header.sender_batch_id 
  });

  const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payoutRequest),
  });

  const responseData = await response.json();

  if (!response.ok) {
    logStep("PayPal payout error", { status: response.status, response: responseData });
    return { 
      success: false, 
      error: responseData.message || responseData.error_description || "PayPal payout failed" 
    };
  }

  logStep("PayPal payout successful", { 
    batchId: responseData.batch_header?.payout_batch_id,
    status: responseData.batch_header?.batch_status 
  });

  return { 
    success: true, 
    payoutBatchId: responseData.batch_header?.payout_batch_id 
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { withdrawal_id, action } = await req.json();

    if (!withdrawal_id || !action) {
      return new Response(
        JSON.stringify({ error: "withdrawal_id and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "action must be 'approve' or 'reject'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep(`Processing ${action} for withdrawal: ${withdrawal_id}`);

    // Verify admin auth
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
      return new Response(
        JSON.stringify({ error: "Invalid auth token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase
      .rpc("has_role", { _user_id: userData.user.id, _role: "admin" });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get withdrawal details - accept both "pending" and "processing" statuses
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawal_id)
      .in("status", ["pending", "processing"])
      .single();

    if (fetchError || !withdrawal) {
      logStep("Withdrawal not found", { fetchError });
      return new Response(
        JSON.stringify({ error: "Pending withdrawal not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's profile for balance check
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id, wallet_balance")
      .eq("user_id", withdrawal.user_id)
      .single();

    if (profileError || !profile) {
      logStep("Profile not found", { profileError });
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "approve") {
      // If status is "pending", just move to "processing" (under process)
      if (withdrawal.status === "pending") {
        const { error: updateError } = await supabase
          .from("withdrawals")
          .update({
            status: "processing",
          })
          .eq("id", withdrawal_id);

        if (updateError) {
          logStep("Error updating withdrawal to processing", { updateError });
          throw updateError;
        }

        logStep(`Marked withdrawal ${withdrawal_id} as processing (under process)`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            action: "marked_processing",
            message: "Withdrawal marked as under process. Click approve again to send PayPal payout." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If already in "processing" status, complete the withdrawal with PayPal
      // Verify user still has sufficient balance
      if (profile.wallet_balance < withdrawal.amount) {
        return new Response(
          JSON.stringify({ error: "Insufficient wallet balance" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Process PayPal payout for PayPal withdrawals
      if (withdrawal.payment_method === "paypal") {
        try {
          const accessToken = await getPayPalAccessToken();
          const payoutResult = await processPayPalPayout(accessToken, {
            id: withdrawal.id,
            amount: withdrawal.amount,
            payment_details: withdrawal.payment_details || {},
          });

          if (!payoutResult.success) {
            return new Response(
              JSON.stringify({ 
                error: `PayPal payout failed: ${payoutResult.error}` 
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          logStep("PayPal payout sent successfully", { 
            batchId: payoutResult.payoutBatchId 
          });
        } catch (paypalError) {
          const errorMessage = paypalError instanceof Error ? paypalError.message : "Unknown PayPal error";
          logStep("PayPal error", { error: errorMessage });
          return new Response(
            JSON.stringify({ error: `PayPal error: ${errorMessage}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Deduct from wallet balance
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({
          wallet_balance: profile.wallet_balance - withdrawal.amount,
        })
        .eq("user_id", withdrawal.user_id);

      if (balanceError) {
        logStep("Error updating balance", { balanceError });
        throw balanceError;
      }

      // Record withdrawal transaction
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal",
        amount: -withdrawal.amount,
        description: `Withdrawal via ${withdrawal.payment_method}`,
        reference_id: withdrawal_id,
      });

      // Update withdrawal status to completed
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "approved",
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawal_id);

      if (updateError) {
        logStep("Error updating withdrawal", { updateError });
        throw updateError;
      }

      logStep(`Approved withdrawal of $${withdrawal.amount} for user ${withdrawal.user_id}`);
    } else {
      // Reject - just update status
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "rejected",
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawal_id);

      if (updateError) {
        logStep("Error updating withdrawal", { updateError });
        throw updateError;
      }

      logStep(`Rejected withdrawal ${withdrawal_id}`);
    }

    return new Response(
      JSON.stringify({ success: true, action }),
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
