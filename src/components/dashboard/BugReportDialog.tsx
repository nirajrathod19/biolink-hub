import { useState } from "react";
import { Bug, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitBugReport } from "@/hooks/useBugReports";
import { useToast } from "@/hooks/use-toast";

export const BugReportDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const submitBug = useSubmitBugReport();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await submitBug.mutateAsync({ title: title.trim(), description: description.trim() });
      toast({ title: "Bug reported!", description: "Thank you for helping us improve." });
      setTitle("");
      setDescription("");
      setOpen(false);
    } catch {
      toast({ title: "Failed to submit", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Bug className="w-4 h-4" />
          Report Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-destructive" />
            Report a Bug
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="bug-title">Title</Label>
            <Input
              id="bug-title"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="bug-desc">Description</Label>
            <Textarea
              id="bug-desc"
              placeholder="Describe the bug in detail. What happened? What did you expect?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={5}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || submitBug.isPending}
            className="w-full"
          >
            {submitBug.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
