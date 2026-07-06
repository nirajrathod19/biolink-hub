import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Youtube, Music, Lock, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  type Link as LinkRow,
} from "@/hooks/useLinks";
import { useProfile } from "@/hooks/useProfile";
import { ProUpgradeModal } from "@/components/dashboard/ProUpgradeModal";

type HubKind = "social_feed" | "music_hub" | "content_locker";

interface HubConfig {
  // MusicHub alternates
  alternates?: { platform: string; url: string; label?: string }[];
  // ContentLocker
  wall_type?: "email" | "phone";
  button_label?: string;
  subtitle?: string;
}

const KIND_META: Record<HubKind, { label: string; icon: any; hint: string; pro: boolean }> = {
  social_feed: { label: "Social Feed Embed", icon: Youtube, hint: "YouTube, TikTok, or Instagram URL", pro: false },
  music_hub: { label: "Music / Podcast Hub", icon: Music, hint: "Spotify, Apple Music, or SoundCloud URL", pro: false },
  content_locker: { label: "Gated Content Locker", icon: Lock, hint: "Locked file/link URL", pro: true },
};

const parseConfig = (badge: string | null): HubConfig => {
  if (!badge) return {};
  try {
    const parsed = JSON.parse(badge);
    if (parsed && typeof parsed === "object") return parsed as HubConfig;
  } catch {
    /* not JSON — legacy badge text, ignore */
  }
  return {};
};

export const ContentHubManager = () => {
  const { data: links = [], isLoading } = useLinks();
  const { data: profile } = useProfile();
  const create = useCreateLink();
  const update = useUpdateLink();
  const del = useDeleteLink();
  const { toast } = useToast();

  const [adding, setAdding] = useState<HubKind | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [wallType, setWallType] = useState<"email" | "phone">("email");
  const [upgradeOpen, setUpgradeOpen] = useState<string | null>(null);

  const isPro = !!(profile as any)?.is_pro;

  const hubLinks = useMemo(
    () =>
      links.filter((l: any) =>
        ["social_feed", "music_hub", "content_locker"].includes(l.link_type),
      ),
    [links],
  );

  const startAdd = (kind: HubKind) => {
    if (KIND_META[kind].pro && !isPro) {
      setUpgradeOpen(KIND_META[kind].label);
      return;
    }
    setAdding(kind);
    setTitle("");
    setUrl("");
    setWallType("email");
  };

  const handleCreate = async () => {
    if (!adding) return;
    if (!url.trim()) {
      toast({ title: "URL required", description: "Please enter a valid URL", variant: "destructive" });
      return;
    }
    try {
      new URL(url.trim());
    } catch {
      toast({ title: "Invalid URL", description: "Must start with http:// or https://", variant: "destructive" });
      return;
    }
    const cfg: HubConfig = {};
    if (adding === "content_locker") cfg.wall_type = wallType;
    if (adding === "music_hub") cfg.alternates = [];
    try {
      await create.mutateAsync({
        title: title.trim() || KIND_META[adding].label,
        url: url.trim(),
        link_type: adding,
        badge: Object.keys(cfg).length ? JSON.stringify(cfg) : undefined,
      });
      toast({ title: "Added", description: `${KIND_META[adding].label} added to your page.` });
      setAdding(null);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this block from your page?")) return;
    try {
      await del.mutateAsync(id);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleAlternateAdd = async (link: LinkRow, platform: string, altUrl: string) => {
    if (!altUrl.trim()) return;
    try {
      new URL(altUrl.trim());
    } catch {
      toast({ title: "Invalid URL", variant: "destructive" });
      return;
    }
    const cfg = parseConfig(link.badge);
    const next = [...(cfg.alternates || []), { platform, url: altUrl.trim() }];
    try {
      await update.mutateAsync({
        id: link.id,
        badge: JSON.stringify({ ...cfg, alternates: next }),
      });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleAlternateRemove = async (link: LinkRow, index: number) => {
    const cfg = parseConfig(link.badge);
    const next = (cfg.alternates || []).filter((_, i) => i !== index);
    try {
      await update.mutateAsync({
        id: link.id,
        badge: JSON.stringify({ ...cfg, alternates: next }),
      });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <h2 className="text-lg font-display font-bold">Content Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Embed social feeds, music/podcast players, and gated download lockers on your bio page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
        {(Object.keys(KIND_META) as HubKind[]).map((k) => {
          const meta = KIND_META[k];
          const Icon = meta.icon;
          return (
            <Button
              key={k}
              variant="outline"
              onClick={() => startAdd(k)}
              className="justify-start h-auto py-3"
            >
              <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="flex-1 text-left">
                <span className="block text-sm font-semibold">{meta.label}</span>
                <span className="block text-[11px] text-muted-foreground truncate">{meta.hint}</span>
              </span>
              {meta.pro && <Crown className="w-3.5 h-3.5 text-amber-500 ml-1 flex-shrink-0" />}
            </Button>
          );
        })}
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl border border-border p-4 space-y-3"
        >
          <div className="text-sm font-semibold">Add {KIND_META[adding].label}</div>
          <div className="space-y-2">
            <Label className="text-xs">Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My latest track" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{KIND_META[adding].hint}</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </div>
          {adding === "content_locker" && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div className="text-xs">
                <div className="font-semibold">Wall type</div>
                <div className="text-muted-foreground">Toggle to require phone instead of email</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={wallType === "email" ? "font-semibold" : "text-muted-foreground"}>Email</span>
                <Switch
                  checked={wallType === "phone"}
                  onCheckedChange={(v) => setWallType(v ? "phone" : "email")}
                />
                <span className={wallType === "phone" ? "font-semibold" : "text-muted-foreground"}>Phone</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleCreate} disabled={create.isPending}>
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => setAdding(null)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
        {!isLoading && hubLinks.length === 0 && (
          <p className="text-xs text-muted-foreground">No content hub blocks yet. Add your first above.</p>
        )}
        {hubLinks.map((l: any) => {
          const kind = l.link_type as HubKind;
          const meta = KIND_META[kind];
          const Icon = meta?.icon || Youtube;
          const cfg = parseConfig(l.badge);
          return (
            <div key={l.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{l.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{l.url}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => handleDelete(l.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {kind === "music_hub" && (
                <MusicAlternatesEditor
                  cfg={cfg}
                  onAdd={(p, u) => handleAlternateAdd(l, p, u)}
                  onRemove={(i) => handleAlternateRemove(l, i)}
                />
              )}
            </div>
          );
        })}
      </div>

      <ProUpgradeModal
        open={!!upgradeOpen}
        onClose={() => setUpgradeOpen(null)}
        feature={upgradeOpen || "This block"}
      />
    </div>
  );
};

const MUSIC_PLATFORMS = [
  { key: "spotify", label: "Spotify" },
  { key: "apple", label: "Apple Music" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "youtube", label: "YouTube Music" },
  { key: "amazon", label: "Amazon Music" },
  { key: "tidal", label: "Tidal" },
  { key: "deezer", label: "Deezer" },
  { key: "other", label: "Other" },
];

const MusicAlternatesEditor = ({
  cfg,
  onAdd,
  onRemove,
}: {
  cfg: HubConfig;
  onAdd: (platform: string, url: string) => void;
  onRemove: (index: number) => void;
}) => {
  const [platform, setPlatform] = useState("spotify");
  const [url, setUrl] = useState("");

  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Alternate streaming links
      </div>
      <div className="space-y-1.5">
        {(cfg.alternates || []).map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-muted font-medium">
              {MUSIC_PLATFORMS.find((p) => p.key === a.platform)?.label || a.platform}
            </span>
            <span className="flex-1 truncate text-muted-foreground">{a.url}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => onRemove(i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          {MUSIC_PLATFORMS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        <Input
          placeholder="https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 text-xs flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!url.trim()) return;
            onAdd(platform, url.trim());
            setUrl("");
          }}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
