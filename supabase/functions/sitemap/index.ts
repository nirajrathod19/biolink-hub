import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://brioo.in";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Fetch all public profiles
    const { data: profiles, error } = await supabase
      .from("profiles_public")
      .select("username, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SITEMAP] Error fetching profiles:", error);
      return new Response("Error generating sitemap", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/login", priority: "0.5", changefreq: "monthly" },
      { url: "/signup", priority: "0.6", changefreq: "monthly" },
      { url: "/demo", priority: "0.7", changefreq: "weekly" },
    ];

    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Profile pages
    if (profiles) {
      for (const profile of profiles) {
        if (!profile.username) continue;
        const lastmod = profile.updated_at
          ? new Date(profile.updated_at).toISOString().split("T")[0]
          : now;
        xml += `  <url>
    <loc>${BASE_URL}/${profile.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[SITEMAP] Error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
