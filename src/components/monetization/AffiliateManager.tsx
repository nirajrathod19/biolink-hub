import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import type { AffiliateItem } from "@/features/public-profile/components/AffiliateCarousel";

const emptyForm = { title: "", image_url: "", price: "", original_price: "", url: "", tracking_tag: "" };

export const AffiliateManager = () => {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [items, setItems] = useState<AffiliateItem[]>([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const list = ((profile as any)?.layout_config?.affiliate_items || []) as AffiliateItem[];
    setItems(Array.isArray(list) ? list : []);
  }, [profile]);

  const save = async (next: AffiliateItem[]) => {
    const layout_config = { ...((profile as any)?.layout_config || {}), affiliate_items: next };
    await update.mutateAsync({ layout_config } as any);
    setItems(next);
  };

  const handleAdd = async () => {
    if (!form.title || !form.url) {
      toast.error("Title and URL are required");
      return;
    }
    try {
      new URL(form.url);
    } catch {
      toast.error("Enter a valid URL (https://…)");
      return;
    }
    const next: AffiliateItem[] = [
      ...items,
      {
        id: crypto.randomUUID(),
        title: form.title,
        image_url: form.image_url || null,
        price: form.price || null,
        original_price: form.original_price || null,
        url: form.url,
        tracking_tag: form.tracking_tag || null,
      },
    ];
    try {
      await save(next);
      toast.success("Affiliate item added");
      setForm(emptyForm);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const handleRemove = async (id: string) => {
    const next = items.filter((i) => i.id !== id);
    try {
      await save(next);
      toast.success("Removed");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold">Affiliate Carousel</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Showcase third-party products with your affiliate link. Each item is tagged with your tracking parameters automatically.
      </p>

      <div className="rounded-xl border border-border p-4 mb-4 bg-secondary/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label className="text-xs">Product title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Affiliate link</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Price</Label>
            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹499" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Original price</Label>
            <Input value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="₹999" className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Tracking tag (optional)</Label>
            <Input value={form.tracking_tag} onChange={(e) => setForm({ ...form, tracking_tag: e.target.value })} placeholder="amzn-brioo-20" className="mt-1" />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={update.isPending} className="gap-2">
          <Plus className="w-4 h-4" /> Add item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No affiliate items yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
              {it.image_url ? (
                <img src={it.image_url} alt="" className="w-12 h-12 rounded-md object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-md bg-secondary grid place-items-center">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{it.title}</div>
                <div className="text-xs text-muted-foreground">
                  {it.price} {it.original_price && <span className="line-through opacity-60 ml-1">{it.original_price}</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleRemove(it.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
