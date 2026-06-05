/**
 * Public profile link variant detection.
 * Maps a link's `link_type` + `url` to a presentation variant,
 * without requiring any schema changes.
 */
export type LinkVariant =
  | "standard"
  | "social"
  | "product"
  | "video"
  | "download"
  | "cta";

const SOCIAL_HOSTS = [
  "instagram.com", "youtube.com", "youtu.be", "tiktok.com", "twitter.com", "x.com",
  "linkedin.com", "facebook.com", "github.com", "snapchat.com", "threads.net",
  "pinterest.com", "discord.gg", "twitch.tv",
];
const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com", "loom.com", "wistia.com"];
const DOWNLOAD_EXT = /\.(pdf|zip|epub|mp3|wav|dmg|exe|apk|csv|xlsx|docx|pptx)(\?|$)/i;
const CTA_KEYWORDS = /(book|call|hire|contact|subscribe|join|signup|sign-up|register|buy|shop|order|donate|tip|apply)/i;

export const detectLinkVariant = (link: {
  link_type?: string | null;
  url?: string | null;
  title?: string | null;
}): LinkVariant => {
  const explicit = (link.link_type || "").toLowerCase();
  if (explicit === "product") return "product";
  if (explicit === "video" || explicit === "audio") return "video";
  if (explicit === "download" || explicit === "file") return "download";
  if (explicit === "social") return "social";
  if (explicit === "cta") return "cta";

  const url = (link.url || "").toLowerCase();
  let host = "";
  try {
    host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch { /* noop */ }

  if (DOWNLOAD_EXT.test(url)) return "download";
  if (VIDEO_HOSTS.some((h) => host.endsWith(h))) return "video";
  if (SOCIAL_HOSTS.some((h) => host.endsWith(h))) return "social";
  if (CTA_KEYWORDS.test(link.title || "")) return "cta";
  return "standard";
};

export const extractYouTubeId = (url: string): string | null => {
  const m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/.exec(url || "");
  return m?.[1] ?? null;
};
