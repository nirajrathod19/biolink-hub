import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckCircle2, X } from "lucide-react";
import { usePublicSlots } from "@/hooks/useBookingSlots";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { BioTheme } from "@/lib/bioThemes";

interface Props {
  creatorId: string;
  creatorName?: string;
  theme: BioTheme;
}

const fmtTime = (t: string) => {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export const BookingsBlock = ({ creatorId, creatorName, theme }: Props) => {
  const { data: slots = [], isLoading, refetch } = usePublicSlots(creatorId);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const available = slots.filter((s) => !s.is_booked);
  if (isLoading || available.length === 0) return null;

  const selectedSlot = available.find((s) => s.id === selectedSlotId);

  const handleBook = async () => {
    if (!selectedSlot) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("book-slot", {
        body: {
          slot_id: selectedSlot.id,
          creator_id: creatorId,
          name: name.trim(),
          email: email.trim(),
        },
      });
      if (error) throw error;

      // Paid slot: open Razorpay if returned
      if ((data as any)?.razorpay_order_id) {
        const rzp = (window as any).Razorpay;
        if (!rzp) {
          // Lazy-load Razorpay script
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Razorpay"));
            document.body.appendChild(s);
          });
        }
        const options = {
          key: (data as any).razorpay_key_id,
          order_id: (data as any).razorpay_order_id,
          amount: Math.round(selectedSlot.price * 100),
          currency: selectedSlot.currency,
          name: creatorName || "Booking",
          description: selectedSlot.title,
          prefill: { name: name.trim(), email: email.trim() },
          handler: async (resp: any) => {
            const { error: vErr } = await supabase.functions.invoke("book-slot", {
              body: {
                verify: true,
                slot_id: selectedSlot.id,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                name: name.trim(),
                email: email.trim(),
              },
            });
            if (vErr) {
              toast.error("Payment verification failed");
              return;
            }
            setSuccess(true);
            refetch();
          },
          theme: { color: theme.accent },
        };
        new (window as any).Razorpay(options).open();
      } else {
        setSuccess(true);
        refetch();
      }
    } catch (e: any) {
      toast.error(e?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Book a call"
      className="my-6 rounded-2xl p-5 backdrop-blur-md"
      style={{
        background: `${theme.cardBackground || theme.accent + "10"}`,
        border: `1px solid ${theme.accent}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4" style={{ color: theme.accent }} />
        <h3 className="font-semibold text-sm" style={{ color: theme.textColor }}>
          Book a 1-on-1
        </h3>
      </div>
      <p className="text-xs opacity-70 mb-4" style={{ color: theme.textColor }}>
        Pick an open time slot below.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {available.slice(0, 12).map((slot) => (
          <button
            key={slot.id}
            onClick={() => setSelectedSlotId(slot.id)}
            className="text-left rounded-xl p-3 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2"
            style={{
              background: `${theme.accent}10`,
              border: `1px solid ${theme.accent}25`,
              color: theme.textColor,
            }}
          >
            <div className="text-[11px] font-medium opacity-80">{fmtDate(slot.slot_date)}</div>
            <div className="flex items-center gap-1 text-sm font-semibold mt-1">
              <Clock className="w-3 h-3" /> {fmtTime(slot.start_time)}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5 truncate">{slot.title}</div>
            <div className="text-xs font-bold mt-1" style={{ color: theme.accent }}>
              {slot.price > 0 ? `${slot.currency === "INR" ? "₹" : "$"}${slot.price}` : "Free"}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !submitting && setSelectedSlotId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 relative"
              style={{ background: theme.background, border: `1px solid ${theme.accent}30`, color: theme.textColor }}
            >
              <button
                onClick={() => !submitting && setSelectedSlotId(null)}
                className="absolute top-3 right-3 opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>

              {success ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: theme.accent }} />
                  <h4 className="font-bold text-lg mb-1">Booking confirmed!</h4>
                  <p className="text-xs opacity-70">You'll get a confirmation at {email}.</p>
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-base mb-1">{selectedSlot.title}</h4>
                  <p className="text-xs opacity-70 mb-4">
                    {fmtDate(selectedSlot.slot_date)} · {fmtTime(selectedSlot.start_time)} – {fmtTime(selectedSlot.end_time)}
                  </p>
                  {selectedSlot.description && (
                    <p className="text-xs opacity-80 mb-3">{selectedSlot.description}</p>
                  )}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Your name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
                    </div>
                    <Button
                      onClick={handleBook}
                      disabled={submitting}
                      className="w-full"
                      style={{ background: theme.accent, color: theme.background }}
                    >
                      {submitting
                        ? "Processing…"
                        : selectedSlot.price > 0
                        ? `Pay ${selectedSlot.currency === "INR" ? "₹" : "$"}${selectedSlot.price} & Book`
                        : "Confirm booking"}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
