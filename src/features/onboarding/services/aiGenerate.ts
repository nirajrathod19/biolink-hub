import { supabase } from "@/integrations/supabase/client";
import type { AIGeneratedProfile, OnboardingDraft } from "../types";
import { getProfileType } from "../utils/profileTypes";

interface AIResponse<T = unknown> {
  result?: T;
  error?: string;
}

const callTool = async <T>(tool: "bio" | "theme" | "link", input: unknown): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("ai-studio", {
    body: { tool, input },
  });
  if (error) throw new Error(error.message);
  const payload = data as AIResponse<T>;
  if (payload?.error) throw new Error(payload.error);
  if (!payload?.result) throw new Error("Empty AI response");
  return payload.result;
};

const fallbackProfile = (draft: OnboardingDraft): AIGeneratedProfile => {
  const type = getProfileType(draft.profileType);
  const name = draft.name || "Creator";
  const niche = draft.niche || type.label;
  return {
    bio: `${name} — ${niche}. ${draft.goal || "Helping people level up one link at a time."}`.slice(0, 160),
    headline: `${name} · ${type.label}`,
    cta: "Explore my world",
    suggestedLinks: [
      { title: "My Latest Work", url: "https://example.com" },
      { title: "Get In Touch", url: "mailto:hello@example.com" },
    ],
    theme: {
      name: `${type.label} Premium`,
      palette: { background: "#0B0B12", surface: "#15151F", primary: "#8B5CF6", accent: "#EC4899", text: "#F8FAFC" },
      font: { heading: "Inter", body: "Inter" },
      gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)",
    },
  };
};

export const generateProfileFromDraft = async (
  draft: OnboardingDraft
): Promise<AIGeneratedProfile> => {
  const type = getProfileType(draft.profileType);
  const bioInput = {
    name: draft.name,
    profession: type.label,
    niche: draft.niche || draft.category || type.defaultCategory,
    audience: draft.audience,
    goal: draft.goal,
  };
  const themeInput = {
    industry: type.label,
    style: `${draft.niche || type.label}, premium, modern, cinematic`,
  };

  const [bioRes, themeRes] = await Promise.allSettled([
    callTool<{ bio: string; headline: string; cta: string; keywords?: string[] }>("bio", bioInput),
    callTool<{
      name: string;
      palette: { background: string; surface: string; primary: string; accent: string; text: string };
      font: { heading: string; body: string };
      gradient: string;
    }>("theme", themeInput),
  ]);

  const fallback = fallbackProfile(draft);

  const bio = bioRes.status === "fulfilled" ? bioRes.value : null;
  const theme = themeRes.status === "fulfilled" ? themeRes.value : null;

  const suggestedLinks: { title: string; url: string }[] = [];
  if (draft.socials?.website) suggestedLinks.push({ title: "Website", url: draft.socials.website });
  if (draft.socials?.youtube) suggestedLinks.push({ title: "YouTube Channel", url: draft.socials.youtube });
  if (suggestedLinks.length < 2) suggestedLinks.push(...fallback.suggestedLinks.slice(0, 2 - suggestedLinks.length));

  return {
    bio: bio?.bio || fallback.bio,
    headline: bio?.headline || fallback.headline,
    cta: bio?.cta || fallback.cta,
    suggestedLinks,
    theme: theme
      ? {
          name: theme.name,
          palette: theme.palette,
          font: theme.font,
          gradient: theme.gradient,
        }
      : fallback.theme,
  };
};
