import { useState } from "react";
import { Bug, Loader2, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminBugReports, useUpdateBugReport, useDeleteBugReport } from "@/hooks/useBugReports";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  open: { label: "Open", icon: Clock, className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  in_progress: { label: "In Progress", icon: Loader2, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  resolved: { label: "Resolved", icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  closed: { label: "Closed", icon: XCircle, className: "bg-muted text-muted-foreground border-border" },
};

export const BugReportsManager = () => {
  const { data: bugs = [], isLoading } = useAdminBugReports();
  const updateBug = useUpdateBugReport();
  const deleteBug = useDeleteBugReport();
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBug.mutateAsync({ id, status, admin_notes: editingNotes[id] });
      toast({ title: "Bug updated" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleSaveNotes = async (id: string, currentStatus: string) => {
    try {
      await updateBug.mutateAsync({ id, status: currentStatus, admin_notes: editingNotes[id] });
      toast({ title: "Notes saved" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBug.mutateAsync(id);
      toast({ title: "Bug report deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Bug className="w-5 h-5 text-destructive" />
            Bug Reports
          </h2>
          <p className="text-sm text-muted-foreground">{bugs.length} total reports</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = bugs.filter(b => b.status === key).length;
            if (!count) return null;
            return (
              <Badge key={key} variant="outline" className={cfg.className}>
                {cfg.label}: {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {bugs.length === 0 ? (
        <GlassCard>
          <div className="text-center py-8 text-muted-foreground">
            <Bug className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No bug reports yet</p>
          </div>
        </GlassCard>
      ) : (
        bugs.map((bug) => {
          const status = statusConfig[bug.status] || statusConfig.open;
          const StatusIcon = status.icon;
          return (
            <GlassCard key={bug.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{bug.title}</h3>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{bug.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Reported {formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleDelete(bug.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={bug.status}
                    onValueChange={(val) => handleStatusChange(bug.id, val)}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <span className="text-sm font-medium block mb-1">Admin Notes:</span>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add notes about this bug..."
                      value={editingNotes[bug.id] ?? bug.admin_notes ?? ""}
                      onChange={(e) => setEditingNotes(prev => ({ ...prev, [bug.id]: e.target.value }))}
                      rows={2}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveNotes(bug.id, bug.status)}
                      disabled={updateBug.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
};
