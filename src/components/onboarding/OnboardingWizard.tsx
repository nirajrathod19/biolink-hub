import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Upload, Link as LinkIcon, Sparkles, User } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useCreateLink } from "@/hooks/useLinks";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  currentUsername?: string;
}

const steps = [
  { title: "Claim your unique Brioo link", icon: LinkIcon },
  { title: "Make it yours", icon: User },
  { title: "Add your first link", icon: Sparkles },
];

export const OnboardingWizard = ({ open, onComplete, currentUsername }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();
  const createLink = useCreateLink();
  const { isAvailable, isChecking } = useUsernameCheck(username);

  const isAutoUsername = currentUsername?.startsWith("user_");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {};

      // Step 1: Username
      if (username && username.length >= 3 && isAvailable) {
        updates.username = username.toLowerCase();
      }

      // Step 2: Bio
      if (bio.trim()) updates.bio = bio.trim();

      // Upload avatar
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          updates.avatar_url = urlData.publicUrl;
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile.mutateAsync(updates as any);
      }

      // Step 3: First link
      if (linkTitle.trim() && linkUrl.trim()) {
        let url = linkUrl.trim();
        if (!url.startsWith("http")) url = `https://${url}`;
        await createLink.mutateAsync({ title: linkTitle.trim(), url });
      }

      // Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
      });

      toast({ title: "Welcome to Brioo! 🎉", description: "Your profile is ready to share." });
      setTimeout(onComplete, 1200);
    } catch (err: any) {
      toast({ title: "Setup error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) {
      if (!isAutoUsername) return true; // already has custom username
      return username.length >= 3 && isAvailable === true;
    }
    return true;
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (step < 2) { setDirection(1); setStep(step + 1); }
  };
  const goBack = () => {
    if (step > 0) { setDirection(-1); setStep(step - 1); }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-background/95 backdrop-blur-xl" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress */}
        <div className="flex gap-1 px-6 pt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{ background: i <= step ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
            />
          ))}
        </div>

        <div className="px-6 pb-6 pt-4 min-h-[340px] flex flex-col">
          {/* Step indicator */}
          <p className="text-xs text-muted-foreground mb-1">Step {step + 1} of 3</p>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {step === 0 && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-xl font-display font-bold mb-1">Claim your unique Brioo link</h2>
                    <p className="text-sm text-muted-foreground">This will be your profile URL</p>
                  </div>
                  {isAutoUsername ? (
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                        <span className="text-muted-foreground text-sm">brioo.in/</span>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                          placeholder="yourname"
                          className="border-0 bg-transparent p-0 h-auto text-base focus-visible:ring-0"
                        />
                      </div>
                      {username.length >= 3 && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-sm flex items-center gap-1 ${isAvailable ? "text-green-500" : isAvailable === false ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {isChecking ? "Checking..." : isAvailable ? <><Check className="w-3.5 h-3.5" /> Available!</> : "Username taken"}
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center">
                      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 w-full">
                        <p className="text-sm text-muted-foreground">Your link</p>
                        <p className="text-lg font-semibold">brioo.in/{currentUsername}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-display font-bold mb-1">Make it yours</h2>
                  <p className="text-sm text-muted-foreground mb-4">Add a photo and bio so people know it's you</p>

                  <div className="flex flex-col items-center gap-4 flex-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden hover:border-primary transition-colors"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <p className="text-xs text-muted-foreground">{avatarPreview ? "Tap to change" : "Upload a profile photo"}</p>

                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the world about yourself..."
                      className="resize-none flex-1 min-h-[80px]"
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground self-end">{bio.length}/160</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-display font-bold mb-1">Add your first link</h2>
                  <p className="text-sm text-muted-foreground mb-4">Share your most important link</p>

                  <div className="space-y-3 flex-1">
                    <Input
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="e.g. My Website, Instagram, YouTube"
                    />
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-muted-foreground">You can skip this and add links later</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={goBack} disabled={step === 0} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < 2 ? (
              <Button onClick={goNext} disabled={!canProceed()} size="sm" className="gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={saving} size="sm" className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                {saving ? "Setting up..." : <>Finish <Sparkles className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
