import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CommunityManager } from "@/components/community/CommunityManager";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

const CommunityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Community</h1>
          <p className="text-muted-foreground text-sm">
            Manage your updates feed and answer questions from visitors
          </p>
        </div>
        <CommunityManager />
      </div>
      <MobileBottomNav />
    </DashboardLayout>
  );
};

export default CommunityPage;
