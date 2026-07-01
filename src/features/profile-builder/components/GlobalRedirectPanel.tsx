import { useEffect, useState } from "react";
import { ExternalLink, Lock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/hooks/useProfile";

interface Props {
  profile: any;
}

/**
 * GlobalRedirectPanel — Pro-only full-page bypass.
 * When enabled with a valid URL, ProfilePage replaces the storefront
 * with a redirect to the destination.
 *
 * Scoped strictly to the signed-in creator via useUpdateProfile
 * (RLS enforces user_id = auth.uid()).
 */
export const GlobalRedirectPanel = ({ profile }: Props) => {
  const { toast } = useToast();
  const update = useUpdateProfile();
  const isPro = !!profile?.is_pro;

  const [enabled, setEnabled] = useState<boolean>(!!profile?.enable_global_redirect);
  const [url, setUrl] = useState<string>(profile?.global_redirect_url || "");

  useEffect(() => {
    setEnabled(!!profile?.enable_global_redirect);
    setUrl(profile?.global_redirect_url || "");
  }, [profile?.enable_global_redirect, profile?.global_redirect_url]);

  const dirty =
    enabled !== !!profile?.enable_global_redirect ||
    (url || "") !== (profile?.global_redirect_url || "");

  const validate = (raw: string): string | null => {
    if (!raw) return null;
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") return "URL must start with http:// or https://";
      return null;
    } catch {
      return "Enter a valid URL";
    }
  };

  const handleSave = async () => {
    if (enabled && !url.trim()) {
      toast({ title: "Missing URL", description: "Add a destination URL to enable redirect.", variant: "destructive" });
      return;
    }
    const err = enabled ? validate(url.trim()) : null;
    if (err) {
      toast({ title: "Invalid URL", description: err, variant: "destructive" });
      return;
    }
    try {
      await update.mutateAsync({
        enable_global_redirect: enabled,
        global_redirect_url: url.trim() || null,
      } as any);
      toast({ title: "Saved", description: enabled ? "Your page now redirects visitors." : "Redirect disabled." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl grid place-items-center bg-primary/10 text-primary flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold tracking-tight text-sm">Global Redirect</h3>
              <Badge variant="outline" className="text-[10px] gap-1">
                <Lock className="w-2.5 h-2.5" /> Pro
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Forward every visitor to another URL — perfect for a temporary takeover.
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={!isPro}
          aria-label="Enable global redirect"
        />
      </div>

      {!isPro ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Upgrade to <span className="font-semibold text-foreground">Brioo Pro</span> to unlock full-page redirects.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-main-site.com"
              className="pl-9 h-9 text-sm"
              disabled={!enabled && !url}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={!dirty || update.isPending}
            size="sm"
            className="h-9"
          >
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
};
