import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Mail, Trash2, Users, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscribers, useDeleteSubscriber } from "@/hooks/useSubscribers";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SubscribersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: subscribers = [], isLoading } = useSubscribers();
  const deleteSubscriber = useDeleteSubscriber();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) return <DashboardSkeleton />;
  if (!user) return null;

  const exportCSV = () => {
    if (subscribers.length === 0) return;
    const header = "Email,Subscribed At\n";
    const rows = subscribers.map((s) => `${s.subscriber_email},${new Date(s.created_at).toLocaleDateString()}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brioo-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${subscribers.length} subscribers exported to CSV.` });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber.mutateAsync(id);
      toast({ title: "Subscriber removed" });
    } catch {
      toast({ title: "Error", description: "Could not remove subscriber", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Subscribers
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {subscribers.length} fan{subscribers.length !== 1 ? "s" : ""} subscribed to your updates
              </p>
            </div>
            <Button onClick={exportCSV} disabled={subscribers.length === 0} variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </motion.div>

        {subscribers.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No subscribers yet</h3>
            <p className="text-sm text-muted-foreground">
              Fans who enter their email on your profile will appear here.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.subscriber_email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleteSubscriber.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscribersPage;
