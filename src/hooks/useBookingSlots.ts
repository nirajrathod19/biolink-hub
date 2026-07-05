import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BookingSlot {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string;
  price: number;
  currency: string;
  is_booked: boolean;
  booked_by_email: string | null;
  booked_by_name: string | null;
  order_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TABLE = "booking_slots" as any;

/** Creator: manage own slots */
export const useMySlots = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["booking-slots-mine", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(TABLE)
        .select("*")
        .eq("creator_id", user!.id)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BookingSlot[];
    },
  });
};

/** Public: fetch active future slots for a creator */
export const usePublicSlots = (creatorId?: string) => {
  return useQuery({
    queryKey: ["booking-slots-public", creatorId],
    enabled: !!creatorId,
    staleTime: 30_000,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await (supabase as any)
        .from(TABLE)
        .select("*")
        .eq("creator_id", creatorId!)
        .eq("is_active", true)
        .gte("slot_date", today)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BookingSlot[];
    },
  });
};

export const useUpsertSlot = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<BookingSlot> & { title: string; slot_date: string; start_time: string; end_time: string }) => {
      if (!user?.id) throw new Error("Not signed in");
      const payload: any = {
        creator_id: user.id,
        title: input.title,
        description: input.description ?? null,
        slot_date: input.slot_date,
        start_time: input.start_time,
        end_time: input.end_time,
        price: input.price ?? 0,
        currency: input.currency ?? "INR",
        is_active: input.is_active ?? true,
      };
      if (input.id) payload.id = input.id;
      const { data, error } = await (supabase as any).from(TABLE).upsert(payload).select().single();
      if (error) throw error;
      return data as BookingSlot;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["booking-slots-mine", user?.id] }),
  });
};

export const useDeleteSlot = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(TABLE).delete().eq("id", id).eq("creator_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["booking-slots-mine", user?.id] }),
  });
};
