// Reusable AI gateway for Brioo AI Studio tools.
// Accepts { tool, input } and routes to the correct prompt.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Tool = "bio" | "link" | "theme" | "seo";

const SYSTEM_PROMPTS: Record<Tool, string> = {
  bio:
    "You are a world-class personal brand copywriter. Given a creator's name, profession and niche, return a JSON object with: bio (≤160 chars, first person, warm + confident), headline (≤60 chars, punchy), cta (≤30 chars, action verb), keywords (array of 6 lowercase SEO keywords). Output ONLY JSON.",
  link:
    "You are a conversion copywriter. Given a link title and optional context, return a JSON object with: description (≤90 chars, benefit-led, no emojis unless natural), variants (array of 3 alternative descriptions). Output ONLY JSON.",
  theme:
    "You are a senior brand designer. Given a creator niche/vibe, return a JSON object with: name (theme name), mood (1 sentence), palette ({ background, surface, primary, accent, text } as hex), font ({ heading, body } web-safe Google Fonts), buttonStyle ('pill'|'rounded'|'square'), gradient (CSS linear-gradient string). Output ONLY JSON.",
  seo:
    "You are an SEO specialist. Given creator name, niche, bio, return a JSON object with: title (≤60 chars), description (≤155 chars), keywords (array of 8), ogTitle, ogDescription, schemaType ('Person'|'Organization'). Output ONLY JSON.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tool, input } = await req.json();
    if (!tool || !SYSTEM_PROMPTS[tool as Tool]) {
      return new Response(JSON.stringify({ error: "Invalid tool" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent =
      typeof input === "string" ? input : JSON.stringify(input ?? {});

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[tool as Tool] },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }
    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-studio error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
