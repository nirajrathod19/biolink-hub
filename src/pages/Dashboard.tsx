import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SocialIconsBar } from "@/components/profile/SocialIconsBar";
import { MonetizationStrip } from "@/components/dashboard/MonetizationStrip";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { LinksList } from "@/components/dashboard/LinksList";
import { PreviewDrawer } from "@/components/dashboard/PreviewDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useLinks } from "@/hooks/useLinks";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: links = [], isLoading: linksLoading } = useLinks();
  const { isConnected } = useRealtimeAnalytics();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Detect new user needing onboarding
  useEffect(() => {
    if (profile && !onboardingDismissed && !profileLoading) {
      const isAutoUsername = profile.username?.startsWith("user_");
      const noAvatar = !profile.avatar_url;
      if (isAutoUsername || noAvatar) {
        setShowOnboarding(true);
      }
    }
  }, [profile, profileLoading, onboardingDismissed]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  const currentClicks = profile?.unique_clicks || 0;
  const targetClicks = 1000;
  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0);
  // Use real total_clicks (page views) from profile, tracked by the track-view function
  const totalViews = profile?.total_clicks || 0;
  const clickRate = totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : "0%";
  const earnings = `$${(profile?.wallet_balance || 0).toFixed(2)}`;

  return (
    <DashboardLayout>
      {/* Monetization Strip - Full width at top */}
      <MonetizationStrip 
        currentClicks={currentClicks} 
        targetClicks={targetClicks}
        isPro={profile?.is_pro || false}
      />

      <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8">
        {/* Profile Header with Social Icons */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6"
        >
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={`${profile?.display_name || profile?.username}'s avatar`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile?.username?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            {/* Username */}
            <h1 className="text-lg sm:text-xl font-display font-bold mb-1">
              @{profile?.username}
            </h1>

            {/* Social Icons Bar */}
            <div className="mt-2">
              <SocialIconsBar isEditable={true} />
            </div>
          </div>
        </motion.header>

        {/* Add Link Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6"
        >
          <Link to="/dashboard/links" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
            <GlassCard className="p-4 hover:bg-secondary/80 transition-colors cursor-pointer border-dashed border-2 border-border">
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground">Add Link</span>
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        {/* Links List */}
        <motion.section
          aria-label="Your links"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-6"
        >
          <LinksList links={links} />
        </motion.section>

        {/* Stats Row */}
        <motion.section
          aria-label="Performance statistics"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <StatsRow 
            totalViews={totalViews}
            totalClicks={totalClicks}
            clickRate={clickRate}
            earnings={earnings}
            isPro={profile?.is_pro}
            isLive={isConnected}
          />
        </motion.section>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        username={profile?.username} 
        onAddClick={() => navigate("/dashboard/links")}
        onPreviewClick={() => setShowPreview(true)}
      />

      {/* Preview Drawer */}
      <PreviewDrawer
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        profile={profile}
        links={links}
      />

      {/* Onboarding Wizard */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => { setShowOnboarding(false); setOnboardingDismissed(true); }}
        currentUsername={profile?.username}
      />

      {/* Add Link Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Link to="/dashboard/links" onClick={() => setShowAddDialog(false)}>
              <Button className="w-full" variant="outline">
                🔗 Add Custom Link
              </Button>
            </Link>
            <Link to="/dashboard/social" onClick={() => setShowAddDialog(false)}>
              <Button className="w-full" variant="outline">
                📱 Add Social Media
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
