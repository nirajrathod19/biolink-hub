import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadDraft, saveDraft, clearDraft } from "../utils/draft";
import type { OnboardingDraft } from "../types";

const empty: OnboardingDraft = { step: 0, updatedAt: Date.now() };

export const useOnboardingDraft = () => {
  const { user } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!user) return;
    const existing = loadDraft(user.id);
    if (existing) setDraft(existing);
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    saveDraft(user.id, draft);
  }, [draft, hydrated, user]);

  const patch = useCallback((p: Partial<OnboardingDraft>) => {
    setDraft((d) => ({ ...d, ...p, updatedAt: Date.now() }));
  }, []);

  const setStep = useCallback((step: number) => {
    setDraft((d) => ({ ...d, step, updatedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => {
    clearDraft(user?.id);
    setDraft({ ...empty, updatedAt: Date.now() });
  }, [user]);

  return { draft, patch, setStep, reset, hydrated };
};
