import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GradientButton } from "@/components/ui/GradientButton";
import { HelpCircle, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCreateTicket } from "@/hooks/useSupportTickets";

export const ContactSupportDialog = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const createTicket = useCreateTicket();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [query, setQuery] = useState("");

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setName(profile?.display_name || profile?.username || "");
      setEmail(user?.email || "");
      setContactNumber("");
      setQuery("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !query.trim()) return;
    await createTicket.mutateAsync({
      user_name: name.trim(),
      user_email: email.trim(),
      contact_number: contactNumber.trim() || undefined,
      query_text: query.trim(),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 transition-colors text-sm">
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span>Contact Support</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Contact Support
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="support-name">Name</Label>
            <Input id="support-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email</Label>
            <Input id="support-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-phone">Contact Number (optional)</Label>
            <Input id="support-phone" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-query">Your Query</Label>
            <Textarea id="support-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Describe your issue or question..." rows={4} required />
          </div>
          <GradientButton type="submit" className="w-full" disabled={createTicket.isPending || !name.trim() || !email.trim() || !query.trim()}>
            {createTicket.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit Ticket
          </GradientButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};