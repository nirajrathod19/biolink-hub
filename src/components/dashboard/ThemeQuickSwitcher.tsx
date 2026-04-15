import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const THEME_PRESETS = [
  {
    id: "minimal-mono",
    label: "Minimalist",
    description: "Clean & simple",
    preview: "bg-background border-border",
    dot: "bg-foreground",
  },
  {
    id: "neon-purple",
    label: "Neon",
    description: "Bold & electric",
    preview: "bg-[#0D0D0D] border-purple-500/30",
    dot: "bg-purple-500",
  },
  {
    id: "corporate-blue",
    label: "Corporate",
    description: "Professional & trustworthy",
    preview: "bg-[#F8FAFC] border-blue-200",
    dot: "bg-blue-600",
  },
] as const;

export const ThemeQuickSwitcher = () => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [applying, setApplying] = useState<string | null>(null);
  const currentTheme = profile?.template || "minimal-mono";

  const handleSwitch = async (themeId: string) => {
    if (themeId === currentTheme) return;
    setApplying(themeId);
    try {
      await updateProfile.mutateAsync({ template: themeId });
      toast.success(`Switched to ${THEME_PRESETS.find((t) => t.id === themeId)?.label} theme`);
    } catch {
      toast.error("Failed to switch theme");
    } finally {
      setApplying(null);
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Quick Theme</span>
      </div>
      <div className="flex gap-2">
        {THEME_PRESETS.map((preset) => {
          const isActive = currentTheme === preset.id;
          return (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              disabled={applying !== null}
              onClick={() => handleSwitch(preset.id)}
              className={`flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1 transition-all ${
                isActive ? "ring-2 ring-primary border-primary" : ""
              }`}
            >
              <div className={`w-5 h-5 rounded-full ${preset.dot} flex items-center justify-center`}>
                {isActive && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-[10px] font-medium">{preset.label}</span>
            </Button>
          );
        })}
      </div>
    </GlassCard>
  );
};
