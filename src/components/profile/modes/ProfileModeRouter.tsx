import { ReactNode } from "react";
import { InstagramMode } from "./InstagramMode";
import { YouTubeMode } from "./YouTubeMode";
import { CoachMode } from "./CoachMode";
import { MusicianMode } from "./MusicianMode";

export type CreatorMode = "instagram" | "youtube" | "coach" | "musician" | "default";

export interface ProfileModeContext {
  displayName: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  socialLinks: Array<{ id: string; platform: string; url: string }>;
  links: Array<{ id: string; title?: string | null; url: string; link_type?: string | null; thumbnail_url?: string | null }>;
  themeAccent: string;
  isPro?: boolean;
}

interface Props {
  mode: CreatorMode;
  ctx: ProfileModeContext;
  children: ReactNode;
}

/**
 * Resolves a profile.content_track (or explicit override) to a CreatorMode.
 */
export const resolveCreatorMode = (track?: string | null): CreatorMode => {
  switch ((track || "").toLowerCase()) {
    case "instagram":
    case "influencer":
    case "fashion":
      return "instagram";
    case "youtube":
    case "video":
      return "youtube";
    case "coach":
    case "freelancer":
    case "consultant":
      return "coach";
    case "musician":
    case "audio":
    case "music":
      return "musician";
    default:
      return "default";
  }
};

export const ProfileModeRouter = ({ mode, ctx, children }: Props) => {
  switch (mode) {
    case "instagram":
      return <InstagramMode ctx={ctx}>{children}</InstagramMode>;
    case "youtube":
      return <YouTubeMode ctx={ctx}>{children}</YouTubeMode>;
    case "coach":
      return <CoachMode ctx={ctx}>{children}</CoachMode>;
    case "musician":
      return <MusicianMode ctx={ctx}>{children}</MusicianMode>;
    default:
      return <>{children}</>;
  }
};
