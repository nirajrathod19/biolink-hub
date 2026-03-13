import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2, Inbox, Clock, CheckCircle2, Phone, Mail, User, MessageSquare, Search, Plus,
} from "lucide-react";
import {
  useSupportTickets, useUpdateTicketStatus, useNewTicketCount, useAdminCreateTicket,
  type SupportTicket,
} from "@/hooks/useSupportTickets";
import { formatDistanceToNow } from "date-fns";

const TicketCard = ({
  ticket,
  onMove,
}: {
  ticket: SupportTicket;
  onMove: (id: string, status: "pending" | "resolved") => void;
}) => {
  const updateStatus = useUpdateTicketStatus();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 hover:border-primary/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-semibold text-sm truncate">{ticket.user_name}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {ticket.user_email}
            </span>
            {ticket.contact_number && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {ticket.contact_number}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3 mb-3 border border-border/30">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.query_text}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {ticket.status === "new" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
            onClick={() => onMove(ticket.id, "pending")}
            disabled={updateStatus.isPending}
          >
            <Clock className="w-3 h-3 mr-1" /> Move to Pending
          </Button>
        )}
        {(ticket.status === "new" || ticket.status === "pending") && (
          <Button
            size="sm"
            className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onMove(ticket.id, "resolved")}
            disabled={updateStatus.isPending}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Resolved
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const CreateTicketDialog = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ user_name: "", user_email: "", contact_number: "", query_text: "" });
  const createTicket = useAdminCreateTicket();

  const handleSubmit = () => {
    if (!form.user_name.trim() || !form.query_text.trim()) return;
    createTicket.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ user_name: "", user_email: "", contact_number: "", query_text: "" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>Add a ticket on behalf of a caller or walk-in.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            placeholder="Caller Name *"
            value={form.user_name}
            onChange={(e) => setForm((p) => ({ ...p, user_name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.user_email}
            onChange={(e) => setForm((p) => ({ ...p, user_email: e.target.value }))}
          />
          <Input
            placeholder="Contact Number"
            value={form.contact_number}
            onChange={(e) => setForm((p) => ({ ...p, contact_number: e.target.value }))}
          />
          <Textarea
            placeholder="Query / Issue Description *"
            rows={4}
            value={form.query_text}
            onChange={(e) => setForm((p) => ({ ...p, query_text: e.target.value }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.user_name.trim() || !form.query_text.trim() || createTicket.isPending}
          >
            {createTicket.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AdminTicketsTab = () => {
  const { data: tickets = [], isLoading } = useSupportTickets();
  const { data: newCount = 0 } = useNewTicketCount();
  const updateStatus = useUpdateTicketStatus();
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();

  const filtered = q
    ? tickets.filter(
        (t) =>
          t.user_name?.toLowerCase().includes(q) ||
          t.user_email?.toLowerCase().includes(q) ||
          t.contact_number?.toLowerCase().includes(q) ||
          t.query_text?.toLowerCase().includes(q)
      )
    : tickets;

  const newTickets = filtered.filter((t) => t.status === "new");
  const pendingTickets = filtered.filter((t) => t.status === "pending");
  const resolvedTickets = filtered.filter((t) => t.status === "resolved");

  const handleMove = (id: string, status: "pending" | "resolved") => {
    updateStatus.mutate({ id, status });
  };

  const renderList = (list: SupportTicket[], emptyMsg: string) => {
    if (isLoading)
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    if (list.length === 0)
      return <p className="text-center text-muted-foreground text-sm py-12">{emptyMsg}</p>;
    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {list.map((t) => (
            <TicketCard key={t.id} ticket={t} onMove={handleMove} />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" />
            Help Desk
          </h1>
          <p className="text-muted-foreground text-sm">Manage user support tickets</p>
        </div>
        <CreateTicketDialog />
      </div>

      {/* Global search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone or query…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="new" className="relative">
            New
            {newCount > 0 && (
              <motion.span
                key={newCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
              >
                {newCount}
              </motion.span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingTickets.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded-full">
                {pendingTickets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved
            {resolvedTickets.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded-full">
                {resolvedTickets.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">{renderList(newTickets, "No new tickets 🎉")}</TabsContent>
        <TabsContent value="pending">{renderList(pendingTickets, "No pending tickets")}</TabsContent>
        <TabsContent value="resolved">{renderList(resolvedTickets, "No resolved tickets yet")}</TabsContent>
      </Tabs>
    </>
  );
};