import { useState } from "react";
import { Ticket, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, Coupon,
} from "@/hooks/useCoupons";
import { toast } from "sonner";

export const CouponManager = () => {
  const { data: coupons = [], isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setCode(""); setType("percentage"); setValue(""); setMinOrder(""); setMaxUses(""); setExpiresAt(""); setIsActive(true);
  };

  const openNew = () => { setEditing(null); resetForm(); setIsOpen(true); };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setCode(c.code); setType(c.type); setValue(c.value.toString());
    setMinOrder(c.min_order_amount?.toString() || ""); setMaxUses(c.max_uses?.toString() || "");
    setExpiresAt(c.expires_at ? c.expires_at.split("T")[0] : ""); setIsActive(c.is_active);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!code || !value) { toast.error("Code and value are required"); return; }
    const payload = {
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      min_order_amount: minOrder ? parseFloat(minOrder) : 0,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };
    try {
      if (editing) {
        await updateCoupon.mutateAsync({ id: editing.id, ...payload });
        toast.success("Coupon updated!");
      } else {
        await createCoupon.mutateAsync(payload);
        toast.success("Coupon created!");
      }
      setIsOpen(false);
    } catch { toast.error("Failed to save coupon"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try { await deleteCoupon.mutateAsync(id); toast.success("Deleted!"); }
    catch { toast.error("Failed to delete"); }
  };

  if (isLoading) return <GlassCard><div className="animate-pulse h-32 bg-secondary/50 rounded" /></GlassCard>;

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Coupons</h3>
              <p className="text-sm text-muted-foreground">Create discount codes for your store</p>
            </div>
          </div>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No coupons yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="min-w-0">
                  <p className="font-mono font-bold">{c.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}
                    {c.max_uses ? ` · ${c.used_count}/${c.max_uses} used` : ` · ${c.used_count} used`}
                    {c.expires_at && ` · Expires ${new Date(c.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            <DialogDescription>Set up a discount code for your customers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Coupon Code *</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="FIRST5" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Discount Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as "percentage" | "fixed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value *</Label>
                <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percentage" ? "10" : "50"} min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Order Amount</Label>
                <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0" min="0" />
              </div>
              <div>
                <Label>Max Uses</Label>
                <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" min="1" />
              </div>
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <Label>Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1" disabled={createCoupon.isPending || updateCoupon.isPending}>
              {(createCoupon.isPending || updateCoupon.isPending) ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};