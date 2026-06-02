export type ProfileTypeId =
  | "creator"
  | "influencer"
  | "coach"
  | "freelancer"
  | "developer"
  | "founder"
  | "agency"
  | "musician"
  | "store";

export type SocialPlatform = "instagram" | "linkedin" | "youtube" | "x" | "website";

export interface OnboardingDraft {
  profileType?: ProfileTypeId;
  name?: string;
  username?: string;
  category?: string;
  niche?: string;
  audience?: string;
  goal?: string;
  socials?: Partial<Record<SocialPlatform, string>>;
  ai?: AIGeneratedProfile;
  step: number;
  updatedAt: number;
}

export interface AIGeneratedProfile {
  bio: string;
  headline: string;
  cta: string;
  suggestedLinks: { title: string; url: string }[];
  theme: {
    name: string;
    palette: { background: string; surface: string; primary: string; accent: string; text: string };
    font: { heading: string; body: string };
    gradient: string;
  };
}
