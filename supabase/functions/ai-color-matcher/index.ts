import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { avatar_url } = await req.json();
    if (!avatar_url) throw new Error("No avatar URL provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a color palette expert. Given an avatar image URL, analyze its dominant colors and suggest a harmonious 3-color palette for a profile page. Return exactly 3 hex color codes.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this avatar image and suggest 3 complementary hex colors for a profile theme. Return ONLY a JSON object with a 'colors' array of 3 hex strings like [\"#FF5733\", \"#33FF57\", \"#3357FF\"]. No other text." },
              { type: "image_url", image_url: { url: avatar_url } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_palette",
              description: "Return a 3-color hex palette",
              parameters: {
                type: "object",
                properties: {
                  colors: {
                    type: "array",
                    items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["colors"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_palette" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ colors: parsed.colors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: parse from content
    const content = data.choices?.[0]?.message?.content || "";
    const hexMatches = content.match(/#[0-9A-Fa-f]{6}/g);
    if (hexMatches && hexMatches.length >= 3) {
      return new Response(JSON.stringify({ colors: hexMatches.slice(0, 3) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not extract color palette from AI response");
  } catch (e) {
    console.error("ai-color-matcher error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});