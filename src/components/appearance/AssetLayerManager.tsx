import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Image, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLayoutElements, useUpsertLayoutElement, useDeleteLayoutElement } from "@/hooks/useLayoutElements";

export const AssetLayerManager = () => {
  const { user } = useAuth();
  const { data: elements = [] } = useLayoutElements();
  const upsert = useUpsertLayoutElement();
  const remove = useDeleteLayoutElement();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const assetElements = elements.filter((e) => e.element_type === "custom_asset");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/assets/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

      await upsert.mutateAsync({
        element_type: "custom_asset",
        custom_asset_url: urlData.publicUrl,
        z_index: 0,
        opacity: 100,
        width: 100,
        height: 100,
        is_absolute: false,
        settings: { role: "background" },
      });

      toast.success("Asset uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold">Custom Assets</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Upload PNG/JPG images as background decorations or foreground stickers.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <Button
        variant="outline"
        className="w-full gap-2 mb-4"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-4 h-4" />
        {uploading ? "Uploading..." : "Upload Asset"}
      </Button>

      {assetElements.length > 0 && (
        <div className="space-y-3">
          {assetElements.map((el) => (
            <motion.div
              key={el.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border p-3 bg-secondary/30"
            >
              <div className="flex items-start gap-3 mb-3">
                {el.custom_asset_url && (
                  <img
                    src={el.custom_asset_url}
                    alt="Asset preview"
                    className="w-14 h-14 rounded-lg object-cover border border-border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {(el.settings as any)?.role === "foreground" ? "🎨 Foreground" : "🖼️ Background"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Z: {el.z_index} · Opacity: {el.opacity}%
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive"
                  onClick={() => remove.mutate(el.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Opacity slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Opacity</Label>
                  <span className="text-[10px] font-mono text-muted-foreground">{el.opacity}%</span>
                </div>
                <Slider
                  value={[el.opacity]}
                  onValueChange={([val]) => upsert.mutate({ id: el.id, opacity: val })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Z-Index + role */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] text-muted-foreground">Layer</Label>
                  <select
                    value={(el.settings as any)?.role || "background"}
                    onChange={(e) =>
                      upsert.mutate({
                        id: el.id,
                        settings: { ...(el.settings as any), role: e.target.value },
                        z_index: e.target.value === "foreground" ? 10 : 0,
                      })
                    }
                    className="text-[10px] bg-secondary border border-border rounded px-2 py-1 text-foreground"
                  >
                    <option value="background">Background</option>
                    <option value="foreground">Foreground</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] text-muted-foreground">Free place</Label>
                  <Switch
                    checked={el.is_absolute}
                    onCheckedChange={(checked) => upsert.mutate({ id: el.id, is_absolute: checked })}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};