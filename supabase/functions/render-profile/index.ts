import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common crawler user agents
const CRAWLER_UA = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discordbot|slackbot|applebot|pinterestbot|redditbot|embedly|quora|outbrain|semrushbot|ahrefsbot/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return new Response(JSON.stringify({ error: "username required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the request is from a crawler
    const userAgent = req.headers.get("user-agent") || "";
    const isCrawler = url.searchParams.get("force") === "true" || CRAWLER_UA.test(userAgent);

    if (!isCrawler) {
      // Not a crawler, redirect to the SPA
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: `https://brioo.in/${username}` },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Fetch profile
    const { data: profile, error } = await supabase
      .from("profiles_public")
      .select("username, display_name, bio, avatar_url, interests")
      .eq("username", username)
      .maybeSingle();

    if (error || !profile) {
      return new Response(generateNotFoundHTML(username), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Fetch links
    const { data: links = [] } = await supabase
      .from("links_public")
      .select("title, url")
      .eq("user_id", profile.user_id || "")
      .eq("is_active", true)
      .order("position", { ascending: true })
      .limit(50);

    const html = generateProfileHTML(profile, links || []);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("[PROFILE-SSR] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateProfileHTML(
  profile: { username: string; display_name: string | null; bio: string | null; avatar_url: string | null },
  links: { title: string | null; url: string | null }[]
): string {
  const name = profile.display_name || `@${profile.username}`;
  const description = profile.bio
    ? `${profile.bio.slice(0, 160)}`
    : `Check out ${name}'s links and content on Brioo`;
  const profileUrl = `https://brioo.in/${profile.username}`;
  const avatarUrl = profile.avatar_url || "";

  const linksHTML = links
    .filter((l) => l.title && l.url)
    .map((l) => `<li><a href="${escapeHtml(l.url!)}">${escapeHtml(l.title!)}</a></li>`)
    .join("\n");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name,
    description,
    url: profileUrl,
    ...(avatarUrl && { image: avatarUrl }),
    mainEntity: {
      "@type": "Person",
      name,
      url: profileUrl,
    },
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name)} | Brioo</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${profileUrl}">

  <meta property="og:title" content="${escapeHtml(name)} | Brioo">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${profileUrl}">
  ${avatarUrl ? `<meta property="og:image" content="${escapeHtml(avatarUrl)}">` : ""}
  <meta property="og:site_name" content="Brioo">

  <meta name="twitter:card" content="${avatarUrl ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${escapeHtml(name)} | Brioo">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${avatarUrl ? `<meta name="twitter:image" content="${escapeHtml(avatarUrl)}">` : ""}

  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <main>
    <header>
      ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}'s avatar" width="112" height="112">` : ""}
      <h1>${escapeHtml(name)}</h1>
      ${profile.bio ? `<p>${escapeHtml(profile.bio)}</p>` : ""}
    </header>
    <nav>
      <ul>${linksHTML}</ul>
    </nav>
    <footer>
      <p>Powered by <a href="https://brioo.in">Brioo</a></p>
    </footer>
  </main>
  <script>
    // Redirect non-crawlers to the SPA
    if (!/bot|crawler|spider|slurp|facebook|twitter|linkedin|whatsapp|telegram|discord/i.test(navigator.userAgent)) {
      window.location.replace("${profileUrl}");
    }
  </script>
</body>
</html>`;
}

function generateNotFoundHTML(username: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Profile Not Found | Brioo</title>
  <meta name="description" content="This profile was not found on Brioo.">
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Profile Not Found</h1>
  <p>The profile @${escapeHtml(username)} does not exist on Brioo.</p>
  <a href="https://brioo.in">Create your own Brioo page</a>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
