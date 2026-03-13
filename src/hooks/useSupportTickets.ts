import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  contact_number: string | null;
  query_text: string;
  status: "new" | "pending" | "resolved";
  created_at: string;
}

export const useSupportTickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("support-tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => {
        queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
        queryClient.invalidateQueries({ queryKey: ["support-tickets-count"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SupportTicket[];
    },
    enabled: !!user,
  });
};

export const useNewTicketCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["support-tickets-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useCreateTicket = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ticket: { user_name: string; user_email: string; contact_number?: string; query_text: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        user_name: ticket.user_name,
        user_email: ticket.user_email,
        contact_number: ticket.contact_number || null,
        query_text: ticket.query_text,
        status: "new",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast({ title: "Ticket submitted", description: "We'll get back to you soon!" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useAdminCreateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ticket: { user_name: string; user_email: string; contact_number?: string; query_text: string }) => {
      const { error } = await supabase.from("support_tickets").insert({
        user_name: ticket.user_name,
        user_email: ticket.user_email,
        contact_number: ticket.contact_number || null,
        query_text: ticket.query_text,
        status: "new",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets-count"] });
      toast({ title: "Ticket created", description: "New ticket added successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "new" | "pending" | "resolved" }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets-count"] });
      toast({ title: "Ticket updated", description: `Moved to ${status}` });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};