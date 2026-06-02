import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  PartyPopper,
} from "lucide-react";
import confetti from "canvas-confetti";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useCreateLink } from "@/hooks/useLinks";
import { useCreateSocialLink } from "@/hooks/useSocialLinks";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { useToast } from "@/hooks/use-toast";

import { PROFILE_TYPES, getProfileType } from "../utils/profileTypes";
import { useOnboardingDraft } from "../hooks/useOnboardingDraft";
import { generateProfileFromDraft } from "../services/aiGenerate";
import { StepProgress } from "./StepProgress";
import { LivePreview } from "./LivePreview";
import type { AIGeneratedProfile, SocialPlatform } from "../types";

interface Props {
  open: boolean;
  onComplete: () => void;
  currentUsername?: string;
}

const STEPS = [
  "Profile Type",
  "Basics",
  "Niche & Goals",
  "Socials",
  "AI Generation",
  "Preview",
  "Publish",
];

const SOCIAL_FIELDS: { key: SocialPlatform; label: string; placeholder: string; icon: any }[] = [
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/handle", icon: Instagram },
  { key: "linkedin",  label: "LinkedIn",  placeholder: "linkedin.com/in/you",  icon: Linkedin },
  { key: "youtube",   label: "YouTube",   placeholder: "youtube.com/@channel", icon: Youtube },
  { key: "x",         label: "X",         placeholder: "x.com/handle",         icon: Twitter },
  { key: "website",   label: "Website",   placeholder: "yourdomain.com",       icon: Globe },
];

const normalizeUrl = (raw: string) => {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
};

export const OnboardingWizardV2 = ({ open, onComplete, currentUsername }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { draft, patch, setStep, reset, hydrated } = useOnboardingDraft();

  const updateProfile = useUpdateProfile();
  const createLink = useCreateLink();
  const createSocialLink = useCreateSocialLink();

  const isAutoUsername = !currentUsername || currentUsername.startsWith("user_");
  const usernameToCheck = draft.username ?? "";
  const { isAvailable, isChecking } = useUsernameCheck(usernameToCheck);

  const [direction, setDirection] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const step = draft.step ?? 0;
  const type = getProfileType(draft.profileType);

  // Auto-trigger AI generation when reaching step 4
  useEffect(() => {
    if (!open || !hydrated) return;
    if (step !== 4) return;
    if (draft.ai || generating) return;
    let cancelled = false;
    setGenerating(true);
    generateProfileFromDraft(draft)
      .then((ai) => { if (!cancelled) patch({ ai }); })
      .catch((e) => {
        if (!cancelled) toast({ title: "AI hiccup", description: e.message || "Using a smart default.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setGenerating(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, open, hydrated]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!draft.profileType;
      case 1: {
        const nameOk = (draft.name?.trim().length ?? 0) >= 2;
        if (!isAutoUsername) return nameOk;
        const u = draft.username ?? "";
        return nameOk && u.length >= 3 && isAvailable === true;
      }
      case 2: return (draft.niche?.trim().length ?? 0) >= 2;
      case 3: return true; // skippable
      case 4: return !!draft.ai && !generating;
      case 5: return !!draft.ai;
      case 6: return !publishing;
      default: return true;
    }
  }, [step, draft, isAutoUsername, isAvailable, generating, publishing]);

  const next = () => { if (step < STEPS.length - 1) { setDirection(1); setStep(step + 1); } };
  const back = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  const regenerate = async () => {
    setGenerating(true);
    try {
      const ai = await generateProfileFromDraft(draft);
      patch({ ai });
    } catch (e: any) {
      toast({ title: "AI hiccup", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !draft.ai) return;
    setPublishing(true);
    try {
      const updates: Record<string, any> = {
        bio: draft.ai.bio,
        content_track: draft.profileType ?? "creator",
        user_intent: {
          profile_type: draft.profileType,
          name: draft.name,
          niche: draft.niche,
          audience: draft.audience,
          goal: draft.goal,
          theme: draft.ai.theme,
          updated_at: new Date().toISOString(),
        },
      };
      if (draft.name) updates.display_name = draft.name;
      if (isAutoUsername && draft.username && isAvailable) {
        updates.username = draft.username.toLowerCase();
      }
      await updateProfile.mutateAsync(updates as any);

      // Socials
      const socialEntries = Object.entries(draft.socials || {}).filter(([, v]) => v && v.trim());
      for (const [platform, url] of socialEntries) {
        try {
          await createSocialLink.mutateAsync({ platform, url: normalizeUrl(url as string) });
        } catch { /* dedupe collisions ignored */ }
      }

      // Suggested links
      for (const l of draft.ai.suggestedLinks ?? []) {
        if (!l.url || l.url === "#") continue;
        try {
          await createLink.mutateAsync({ title: l.title, url: normalizeUrl(l.url) });
        } catch { /* ignore */ }
      }

      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
      });
      toast({ title: "You're live on Brioo ✨", description: "Your profile is ready to share." });
      reset();
      setTimeout(onComplete, 900);
    } catch (e: any) {
      toast({ title: "Publish failed", description: e.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* locked */ }}>
      <DialogContent
        className="p-0 overflow-hidden border-0 bg-background/95 backdrop-blur-2xl max-w-3xl w-[calc(100vw-1rem)] md:w-full"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="grid md:grid-cols-[1fr_280px] min-h-[560px]">
          {/* LEFT — flow */}
          <div className="flex flex-col">
            <StepProgress total={STEPS.length} current={step} />

            <div className="px-6 pt-3 flex items-center justify-between">
              <p className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
                {STEPS[step]}
              </p>
              <p className="text-[11px] text-muted-foreground">~60s setup</p>
            </div>

            <div className="px-6 pb-4 pt-2 flex-1 flex flex-col min-h-[420px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="flex-1 flex flex-col"
                >
                  {/* STEP 0 — Profile Type */}
                  {step === 0 && (
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight">
                        What best describes you?
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pick one. We'll tailor the rest of setup.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-5">
                        {PROFILE_TYPES.map((t) => {
                          const Icon = t.icon;
                          const selected = draft.profileType === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => patch({ profileType: t.id, category: draft.category ?? t.defaultCategory })}
                              className={cn(
                                "group relative text-left rounded-2xl border p-3 transition-all overflow-hidden",
                                "border-border/60 hover:border-primary/40 hover:bg-muted/40",
                                selected && "border-primary bg-primary/5 ring-2 ring-primary/30"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-105",
                                  selected ? "text-white" : "text-foreground bg-muted"
                                )}
                                style={selected ? { background: `linear-gradient(135deg, hsl(${t.hue[0]}), hsl(${t.hue[1]}))` } : undefined}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <p className="text-sm font-semibold">{t.label}</p>
                              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                                {t.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 1 — Basics */}
                  {step === 1 && (
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight">
                        The basics
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your name and your link. Take five seconds.
                      </p>
                      <div className="space-y-4 mt-5">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Your name</label>
                          <Input
                            value={draft.name ?? ""}
                            onChange={(e) => patch({ name: e.target.value })}
                            placeholder="e.g. Aarav Patel"
                            className="mt-1 h-11"
                            maxLength={60}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Username</label>
                          {isAutoUsername ? (
                            <>
                              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 h-11">
                                <span className="text-muted-foreground text-sm">brioo.in/</span>
                                <Input
                                  value={draft.username ?? ""}
                                  onChange={(e) => patch({ username: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() })}
                                  placeholder="yourname"
                                  className="border-0 bg-transparent p-0 h-auto text-base focus-visible:ring-0"
                                />
                              </div>
                              {usernameToCheck.length >= 3 && (
                                <p className={cn(
                                  "text-xs mt-1.5 flex items-center gap-1",
                                  isAvailable ? "text-green-500" : isAvailable === false ? "text-destructive" : "text-muted-foreground"
                                )}>
                                  {isChecking ? "Checking…" : isAvailable ? <><Check className="w-3 h-3" /> Available</> : "Taken — try another"}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="mt-1 rounded-xl border border-primary/20 bg-primary/5 px-3 h-11 flex items-center">
                              <p className="text-sm font-medium">brioo.in/{currentUsername}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Category</label>
                          <Input
                            value={draft.category ?? type.defaultCategory}
                            onChange={(e) => patch({ category: e.target.value })}
                            className="mt-1 h-11"
                            maxLength={60}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 — Niche & Goals */}
                  {step === 2 && (
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight">
                        What's your world about?
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        The clearer this is, the better the AI nails your profile.
                      </p>
                      <div className="space-y-4 mt-5">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Niche / topic</label>
                          <Input
                            value={draft.niche ?? ""}
                            onChange={(e) => patch({ niche: e.target.value })}
                            placeholder="e.g. Travel filmmaking, fintech SaaS, hip-hop production"
                            className="mt-1 h-11"
                            maxLength={80}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Who's your audience?</label>
                          <Input
                            value={draft.audience ?? ""}
                            onChange={(e) => patch({ audience: e.target.value })}
                            placeholder="e.g. Gen Z creators in India"
                            className="mt-1 h-11"
                            maxLength={80}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Your main goal</label>
                          <Textarea
                            value={draft.goal ?? ""}
                            onChange={(e) => patch({ goal: e.target.value })}
                            placeholder="What do you want visitors to do?"
                            className="mt-1 resize-none min-h-[80px]"
                            maxLength={160}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 — Socials */}
                  {step === 3 && (
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight">
                        Connect your presence
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        All optional. Skip and add later.
                      </p>
                      <div className="space-y-2.5 mt-5">
                        {SOCIAL_FIELDS.map((f) => {
                          const Icon = f.icon;
                          const value = draft.socials?.[f.key] ?? "";
                          return (
                            <div key={f.key} className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 h-11 focus-within:border-primary/50 transition-colors">
                              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <Input
                                value={value}
                                onChange={(e) => patch({ socials: { ...(draft.socials ?? {}), [f.key]: e.target.value } })}
                                placeholder={f.placeholder}
                                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 4 — AI Generation */}
                  {step === 4 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                      {generating ? (
                        <>
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center animate-pulse">
                              <Sparkles className="w-9 h-9 text-white" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl -z-10" />
                          </div>
                          <h2 className="mt-6 text-xl md:text-2xl font-display font-semibold tracking-tight">
                            Composing your profile…
                          </h2>
                          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                            Bio, headline, CTA, theme, suggested links — all written for you.
                          </p>
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-4" />
                        </>
                      ) : draft.ai ? (
                        <div className="w-full text-left space-y-3">
                          <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight">
                            Here's your draft
                          </h2>
                          <p className="text-sm text-muted-foreground">Edit anything you want. Not perfect? Regenerate.</p>
                          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Headline</label>
                              <Input
                                value={draft.ai.headline}
                                onChange={(e) => patch({ ai: { ...draft.ai!, headline: e.target.value } })}
                                className="mt-1 h-9"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Bio</label>
                              <Textarea
                                value={draft.ai.bio}
                                onChange={(e) => patch({ ai: { ...draft.ai!, bio: e.target.value } })}
                                className="mt-1 resize-none min-h-[70px]"
                                maxLength={160}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wide text-muted-foreground">CTA</label>
                              <Input
                                value={draft.ai.cta}
                                onChange={(e) => patch({ ai: { ...draft.ai!, cta: e.target.value } })}
                                className="mt-1 h-9"
                                maxLength={30}
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={regenerate} className="gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Regenerate
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={regenerate} className="gap-2">
                          <Sparkles className="w-4 h-4" /> Generate
                        </Button>
                      )}
                    </div>
                  )}

                  {/* STEP 5 — Preview */}
                  {step === 5 && (
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight">
                        Live preview
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        This is what visitors will see at brioo.in/{draft.username || currentUsername}.
                      </p>
                      <div className="md:hidden mt-4 flex justify-center">
                        <LivePreview draft={draft} ai={draft.ai} />
                      </div>
                      <div className="hidden md:flex mt-4 items-center gap-3 rounded-xl border border-dashed border-border p-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">
                          See your profile rendered on the right. Looks good? Hit Publish.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 6 — Publish */}
                  {step === 6 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl">
                        <PartyPopper className="w-8 h-8" />
                      </div>
                      <h2 className="mt-5 text-xl md:text-2xl font-display font-semibold tracking-tight">
                        Ready to go live?
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        We'll publish your profile, add your socials, and seed your first links.
                      </p>
                      <Button
                        size="lg"
                        onClick={handlePublish}
                        disabled={publishing}
                        className="mt-6 gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <>Publish profile <ArrowRight className="w-4 h-4" /></>}
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Nav */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                <Button variant="ghost" size="sm" onClick={back} disabled={step === 0 || publishing} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  {step === 3 && (
                    <Button variant="ghost" size="sm" onClick={next}>Skip</Button>
                  )}
                  {step < STEPS.length - 1 && (
                    <Button
                      onClick={next}
                      size="sm"
                      disabled={!canProceed}
                      className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      {step === 4 ? "Looks good" : "Continue"} <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — desktop preview rail */}
          <div className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-muted/40 via-background to-muted/20 border-l border-border/60 p-6">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
            <LivePreview draft={draft} ai={draft.ai} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
