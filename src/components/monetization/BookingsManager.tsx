import { useState } from "react";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMySlots, useUpsertSlot, useDeleteSlot } from "@/hooks/useBookingSlots";
import { toast } from "sonner";

export const BookingsManager = () => {
  const { data: slots = [], isLoading } = useMySlots();
  const upsert = useUpsertSlot();
  const del = useDeleteSlot();

  const [form, setForm] = useState({
    title: "",
    description: "",
    slot_date: "",
    start_time: "",
    end_time: "",
    price: 0,
    currency: "INR",
  });

  const reset = () => setForm({ title: "", description: "", slot_date: "", start_time: "", end_time: "", price: 0, currency: "INR" });

  const handleAdd = async () => {
    if (!form.title || !form.slot_date || !form.start_time || !form.end_time) {
      toast.error("Fill title, date, start & end time");
      return;
    }
    try {
      await upsert.mutateAsync(form);
      toast.success("Slot added");
      reset();
    } catch (e: any) {
      toast.error(e.message || "Failed to add slot");
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold">1-on-1 Booking Slots</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Publish open time slots. Visitors can book directly from your profile — paid slots go through secure checkout.
      </p>

      {/* Add form */}
      <div className="rounded-xl border border-border p-4 mb-4 bg-secondary/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Strategy Call (30 min)" className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input type="date" value={form.slot_date} onChange={(e) => setForm({ ...form, slot_date: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Price</Label>
            <div className="flex gap-2 mt-1">
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Start time</Label>
            <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">End time</Label>
            <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="mt-1" />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={upsert.isPending} className="mt-3 gap-2">
          <Plus className="w-4 h-4" /> Add slot
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No slots yet.</p>
      ) : (
        <div className="space-y-2">
          {slots.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{s.title}</span>
                  {s.is_booked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">Booked</span>}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {s.slot_date} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} ·{" "}
                  {s.price > 0 ? `${s.currency === "INR" ? "₹" : "$"}${s.price}` : "Free"}
                </div>
                {s.is_booked && s.booked_by_email && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {s.booked_by_name} · {s.booked_by_email}
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => del.mutate(s.id)} disabled={del.isPending}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
