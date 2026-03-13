import { useState } from "react";
import { Palette, Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIColorMatcherProps {
  avatarUrl: string | null;
  onApplyColor: (color: string) => void;
}

export const AIColorMatcher = ({ avatarUrl, onApplyColor }: AIColorMatcherProps) => {
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState<string[] | null>(null);
  const { toast } = useToast();

  const analyzeAvatar = async () => {
    if (!avatarUrl) {
      toast({ title: "No avatar", description: "Upload an avatar first to use AI Color Matcher.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-color-matcher", {
        body: { avatar_url: avatarUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.colors && Array.isArray(data.colors)) {
        setPalette(data.colors.slice(0, 3));
      }
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message || "Could not analyze avatar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-sm">AI Color Matcher</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Analyze your avatar and get a matching 3-color palette suggestion.
      </p>

      <GradientButton
        onClick={analyzeAvatar}
        disabled={loading || !avatarUrl}
        className="w-full gap-2 mb-4"
        size="sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Analyzing..." : "Generate Palette"}
      </GradientButton>

      {palette && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suggested palette — click to apply as theme color:</p>
          <div className="flex gap-3">
            {palette.map((color, i) => (
              <button
                key={i}
                onClick={() => onApplyColor(color)}
                className="flex-1 h-12 rounded-xl border-2 border-transparent hover:border-primary transition-all hover:scale-105 shadow-sm"
                style={{ background: color }}
                title={`Apply ${color}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {palette.map((color, i) => (
              <span key={i} className="flex-1 text-center text-[10px] font-mono text-muted-foreground">
                {color}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};