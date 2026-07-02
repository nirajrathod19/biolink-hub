import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Download, Search, Mail, MessageSquare, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string | null;
  created_at: string;
}

const toCSV = (rows: Lead[]) => {
  const header = ["Name", "Email", "Message", "Received"];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [esc(r.name), esc(r.email), esc(r.message || ""), esc(new Date(r.created_at).toISOString())].join(","),
  );
  return [header.join(","), ...lines].join("\n");
};

export const LeadsManager = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      if (!user) return [] as Lead[];
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, email, message, created_at")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as Lead[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.message || "").toLowerCase().includes(q),
    );
  }, [leads, query]);

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No leads to export");
      return;
    }
    const blob = new Blob([toCSV(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brioo-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-display font-semibold">Leads</h2>
            <p className="text-xs text-muted-foreground">
              Submissions from your public lead-capture blocks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {leads.length} total
          </Badge>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or message"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Loading leads…</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center rounded-xl border border-dashed border-border">
          <Mail className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            {leads.length === 0 ? "No leads yet" : "No matches"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {leads.length === 0
              ? "Add a Lead Capture block on your page to start collecting."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3.5 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-sm">{lead.name}</span>
                  <button
                    onClick={() => copyEmail(lead.email)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {lead.email}
                    {copied === lead.email ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-60" />
                    )}
                  </button>
                </div>
                {lead.message && (
                  <p className="mt-1 text-xs text-muted-foreground flex items-start gap-1.5">
                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-3">{lead.message}</span>
                  </p>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {new Date(lead.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
};
