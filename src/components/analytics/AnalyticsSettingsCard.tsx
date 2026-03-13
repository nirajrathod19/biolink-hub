import { useState, useEffect } from "react";
import { Settings, Save, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAnalyticsSettings, useUpdateAnalyticsSettings } from "@/hooks/useAnalyticsSettings";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";

export const AnalyticsSettingsCard = () => {
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: settings, isLoading } = useAnalyticsSettings();
  const updateSettings = useUpdateAnalyticsSettings();

  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [isGaEnabled, setIsGaEnabled] = useState(false);
  const [isMetaEnabled, setIsMetaEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setGaMeasurementId(settings.ga_measurement_id || "");
      setMetaPixelId(settings.meta_pixel_id || "");
      setIsGaEnabled(settings.is_ga_enabled);
      setIsMetaEnabled(settings.is_meta_enabled);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        ga_measurement_id: gaMeasurementId || null,
        meta_pixel_id: metaPixelId || null,
        is_ga_enabled: isGaEnabled,
        is_meta_enabled: isMetaEnabled,
      });
      toast.success("Analytics settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading || roleLoading) {
    return (
      <GlassCard>
        <div className="animate-pulse h-48 bg-secondary/50 rounded" />
      </GlassCard>
    );
  }

  // Non-admin creators see an info message instead
  if (!isAdmin) {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Analytics Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Admin-managed settings
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Analytics integrations (Google Analytics, Meta Pixel) and ad placements are managed by the platform admin. These tracking scripts only run on public bio pages and do not affect your dashboard.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold">Analytics Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect third-party analytics (bio pages only)
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Google Analytics */}
        <div className="p-4 bg-secondary/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center">
                <span className="text-orange-500 font-bold text-sm">GA</span>
              </div>
              <div>
                <Label>Google Analytics 4</Label>
                <p className="text-xs text-muted-foreground">
                  Track detailed visitor behavior
                </p>
              </div>
            </div>
            <Switch checked={isGaEnabled} onCheckedChange={setIsGaEnabled} />
          </div>

          {isGaEnabled && (
            <div className="space-y-2">
              <Label className="text-sm">Measurement ID</Label>
              <Input
                value={gaMeasurementId}
                onChange={(e) => setGaMeasurementId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
              <a
                href="https://support.google.com/analytics/answer/9539598"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                How to find your Measurement ID
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Meta Pixel */}
        <div className="p-4 bg-secondary/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-500 font-bold text-sm">M</span>
              </div>
              <div>
                <Label>Meta Pixel</Label>
                <p className="text-xs text-muted-foreground">
                  Track conversions from Facebook/Instagram
                </p>
              </div>
            </div>
            <Switch checked={isMetaEnabled} onCheckedChange={setIsMetaEnabled} />
          </div>

          {isMetaEnabled && (
            <div className="space-y-2">
              <Label className="text-sm">Pixel ID</Label>
              <Input
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="1234567890123456"
              />
              <a
                href="https://www.facebook.com/business/help/952192354843755"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                How to find your Pixel ID
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          ℹ️ These scripts will only be injected on public bio pages (/:username), not on the dashboard.
        </p>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </GlassCard>
  );
};
