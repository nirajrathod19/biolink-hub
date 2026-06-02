import type { OnboardingDraft } from "../types";

const KEY = "brioo:onboarding:v2";

export const loadDraft = (userId?: string): OnboardingDraft | null => {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(`${KEY}:${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
};

export const saveDraft = (userId: string | undefined, draft: OnboardingDraft) => {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${KEY}:${userId}`, JSON.stringify(draft));
  } catch {
    /* quota */
  }
};

export const clearDraft = (userId?: string) => {
  if (typeof window === "undefined" || !userId) return;
  localStorage.removeItem(`${KEY}:${userId}`);
};
