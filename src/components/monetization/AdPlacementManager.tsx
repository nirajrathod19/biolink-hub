import { useMemo, useState, useEffect } from "react";
import { Megaphone, ImageIcon, Link2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  AD_PLACEMENTS,
  useMyAdConfigs,
  useUpsertAdConfig,
  type AdConfig,
  type AdPlacement,
} from "@/hooks/useAdConfigurations";

const PLACEMENT_META: Record<AdPlacement, { title: string; hint: string }> = {
  top_banner: {
    title: "Top Banner",
    hint: "Appears above your profile header. High visibility.",
  },
  in_between: {
    title: "Native (In-Between)",
    hint: "Blends between your links and content sections.",
  },
  sticky_bottom: {
    title: "Sticky Bottom",
    hint: "Pinned to the bottom of your profile on mobile.",
  },
};

const isSafeUrl = (u: string) => /^https?:\/\//i.test(u.trim());

export const AdPlacementManager = () => {
  const { data: configs = [], isLoading } = useMyAdConfigs();
  const map = useMemo(() => {
    const m = new Map<AdPlacement, AdConfig>();
    for (const c of configs) m.set(c.placement as AdPlacement, c);
    return m;
  }, [configs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Ad Placements
        </CardTitle>
        <CardDescription>
          Run your own sponsors or affiliate banners in three native slots on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top_banner">
          <TabsList className="grid grid-cols-3 w-full">
            {AD_PLACEMENTS.map((p) => (
              <TabsTrigger key={p} value={p} className="text-xs">
                {PLACEMENT_META[p].title}
              </TabsTrigger>
            ))}
          </TabsList>
          {AD_PLACEMENTS.map((p) => (
            <TabsContent key={p} value={p} className="mt-4">
              <PlacementEditor placement={p} initial={map.get(p) ?? null} disabled={isLoading} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface EditorProps {
  placement: AdPlacement;
  initial: AdConfig | null;
  disabled?: boolean;
}

const PlacementEditor = ({ placement, initial, disabled }: EditorProps) => {
  const meta = PLACEMENT_META[placement];
  const upsert = useUpsertAdConfig();

  const [enabled, setEnabled] = useState(initial?.is_enabled ?? false);
  const [source, setSource] = useState<"custom" | "adsense">(
    (initial?.ad_source_type as any) ?? "custom",
  );
  const [banner, setBanner] = useState(initial?.custom_banner_url ?? "");
  const [target, setTarget] = useState(initial?.custom_target_url ?? "");
  const [alt, setAlt] = useState(initial?.custom_alt_text ?? "");
  const [script, setScript] = useState(initial?.adsense_script ?? "");

  useEffect(() => {
    setEnabled(initial?.is_enabled ?? false);
    setSource((initial?.ad_source_type as any) ?? "custom");
    setBanner(initial?.custom_banner_url ?? "");
    setTarget(initial?.custom_target_url ?? "");
    setAlt(initial?.custom_alt_text ?? "");
    setScript(initial?.adsense_script ?? "");
  }, [initial?.id]);

  const save = async () => {
    if (source === "custom") {
      if (banner && !isSafeUrl(banner)) {
        toast({ title: "Invalid banner URL", description: "Must start with http(s)://", variant: "destructive" });
        return;
      }
      if (target && !isSafeUrl(target)) {
        toast({ title: "Invalid target URL", description: "Must start with http(s)://", variant: "destructive" });
        return;
      }
    }
    try {
      await upsert.mutateAsync({
        placement,
        is_enabled: enabled,
        ad_source_type: source,
        custom_banner_url: source === "custom" ? banner.trim() || null : null,
        custom_target_url: source === "custom" ? target.trim() || null : null,
        custom_alt_text: source === "custom" ? alt.trim() || null : null,
        adsense_script: source === "adsense" ? script.trim() || null : null,
      });
      toast({ title: "Saved", description: `${meta.title} updated.` });
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message ?? "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{meta.hint}</p>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Enabled</Label>
          <p className="text-xs text-muted-foreground">Show this placement on your public profile.</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={disabled} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={source === "custom" ? "default" : "outline"}
          onClick={() => setSource("custom")}
          size="sm"
        >
          <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Custom banner
        </Button>
        <Button
          type="button"
          variant={source === "adsense" ? "default" : "outline"}
          onClick={() => setSource("adsense")}
          size="sm"
        >
          <Link2 className="w-3.5 h-3.5 mr-1.5" /> AdSense snippet
        </Button>
      </div>

      {source === "custom" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Banner image URL</Label>
            <Input
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="https://…/banner.jpg (optional)"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Click target URL</Label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="https://sponsor.example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Label / alt text</Label>
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Try our new drop"
              maxLength={120}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs">AdSense / network snippet</Label>
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={5}
            placeholder="<ins class='adsbygoogle' …></ins>"
            className="font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Paste only the ad unit markup. Loader script is injected once by the platform.
          </p>
        </div>
      )}

      <Button onClick={save} disabled={upsert.isPending} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {upsert.isPending ? "Saving…" : "Save placement"}
      </Button>
    </div>
  );
};
