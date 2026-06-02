import { Instagram, Linkedin, Youtube, Twitter, Globe } from "lucide-react";
import type { AIGeneratedProfile, OnboardingDraft } from "../types";
import { getProfileType } from "../utils/profileTypes";

interface Props {
  draft: OnboardingDraft;
  ai?: AIGeneratedProfile;
  compact?: boolean;
}

const socialIcons = {
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  x: Twitter,
  website: Globe,
} as const;

export const LivePreview = ({ draft, ai, compact }: Props) => {
  const type = getProfileType(draft.profileType);
  const theme = ai?.theme;
  const bg = theme?.palette.background ?? "#0B0B12";
  const surface = theme?.palette.surface ?? "#15151F";
  const text = theme?.palette.text ?? "#F8FAFC";
  const primary = theme?.palette.primary ?? "#8B5CF6";
  const accent = theme?.palette.accent ?? "#EC4899";
  const gradient = theme?.gradient ?? `linear-gradient(135deg, ${primary}, ${accent})`;
  const name = draft.name || "Your Name";
  const handle = draft.username || "yourhandle";
  const bio = ai?.bio || draft.goal || `${type.label} · ${draft.niche || "Tell your story"}`;
  const cta = ai?.cta || "Explore";

  const socials = draft.socials || {};
  const links = ai?.suggestedLinks ?? [];

  return (
    <div
      className="relative w-full max-w-[260px] mx-auto aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: bg, color: text }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1/2 opacity-50"
        style={{ background: gradient, filter: "blur(40px)" }}
      />
      <div className="relative h-full flex flex-col p-5">
        <div className="flex flex-col items-center text-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: gradient }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-[10px] opacity-60">@{handle}</p>
          </div>
          <p className="text-[11px] opacity-80 leading-snug line-clamp-3">{bio}</p>
          <div className="flex gap-2 mt-1">
            {(Object.keys(socials) as (keyof typeof socialIcons)[])
              .filter((k) => socials[k])
              .slice(0, 5)
              .map((k) => {
                const Icon = socialIcons[k];
                return (
                  <div
                    key={k}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: surface }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-hidden">
          {(links.length ? links : [{ title: "Your first link", url: "#" }, { title: "Another link", url: "#" }]).slice(0, compact ? 2 : 3).map((l, i) => (
            <div
              key={i}
              className="w-full rounded-xl px-3 py-2.5 text-[11px] font-medium text-center truncate"
              style={{ background: surface, border: `1px solid ${primary}33` }}
            >
              {l.title}
            </div>
          ))}
        </div>

        <button
          className="w-full rounded-xl py-2 text-[11px] font-semibold mt-2"
          style={{ background: gradient, color: "#fff" }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
};
