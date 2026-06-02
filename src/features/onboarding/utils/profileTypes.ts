import {
  Sparkles,
  Camera,
  GraduationCap,
  Briefcase,
  Code2,
  Rocket,
  Building2,
  Music2,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { ProfileTypeId } from "../types";

export interface ProfileTypeDef {
  id: ProfileTypeId;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultCategory: string;
  /** HSL pair for gradient halo */
  hue: [string, string];
}

export const PROFILE_TYPES: ProfileTypeDef[] = [
  { id: "creator",    label: "Creator",         description: "Build an audience around your craft.",   icon: Sparkles,      defaultCategory: "Content Creator", hue: ["280 90% 60%", "320 90% 60%"] },
  { id: "influencer", label: "Influencer",      description: "Monetize reach across platforms.",       icon: Camera,        defaultCategory: "Influencer",      hue: ["340 90% 60%", "20 95% 60%"]  },
  { id: "coach",      label: "Coach",           description: "Sell expertise, sessions, programs.",    icon: GraduationCap, defaultCategory: "Coach / Mentor",  hue: ["190 90% 55%", "220 90% 60%"] },
  { id: "freelancer", label: "Freelancer",      description: "Win clients with a clean presence.",     icon: Briefcase,     defaultCategory: "Freelancer",      hue: ["220 90% 60%", "260 90% 60%"] },
  { id: "developer",  label: "Developer",       description: "Showcase work, ship a dev brand.",       icon: Code2,         defaultCategory: "Developer",       hue: ["160 80% 50%", "200 90% 55%"] },
  { id: "founder",    label: "Startup Founder", description: "Tell the story, pull in early users.",   icon: Rocket,        defaultCategory: "Founder",         hue: ["20 95% 60%", "340 90% 60%"]  },
  { id: "agency",     label: "Agency",          description: "Productize services, drive inbound.",    icon: Building2,     defaultCategory: "Agency",          hue: ["250 70% 60%", "200 80% 55%"] },
  { id: "musician",   label: "Musician",        description: "Releases, tour links, streaming.",       icon: Music2,        defaultCategory: "Musician",        hue: ["300 90% 60%", "260 90% 60%"] },
  { id: "store",      label: "Store Owner",     description: "Sell products from one premium page.",   icon: Store,         defaultCategory: "Store",           hue: ["140 70% 50%", "180 80% 55%"] },
];

export const getProfileType = (id?: ProfileTypeId) =>
  PROFILE_TYPES.find((p) => p.id === id) ?? PROFILE_TYPES[0];
