import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Eye, 
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Megaphone,
  Loader2,
  Save,
  ExternalLink,
  X,
  RefreshCw,
  Lock,
  EyeOff,
  KeyRound,
  AlertTriangle,
  ShieldAlert,
  Shield,
  Fingerprint,
  BookOpen,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminStats, usePendingWithdrawals, useRecentUsers, useCreatorRevenueList } from "@/hooks/useAdminStats";
import { useHeroAd, useUpsertHeroAd, INTEREST_CATEGORIES } from "@/hooks/useHeroAd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProcessWithdrawal, useMovePendingToWallet } from "@/hooks/useWallet";
import { useAdSenseSettings, useUpdateAdSenseSettings } from "@/hooks/useAdSense";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { GuideManager } from "@/components/admin/GuideManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: DollarSign, label: "Revenue", href: "/admin/revenue" },
  { icon: Megaphone, label: "Ads", href: "/admin/ads" },
  { icon: BookOpen, label: "Guide", href: "/admin/guide" },
  { icon: Shield, label: "Security", href: "/admin/security" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const AdminDashboard = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch real data
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = usePendingWithdrawals();
  const { data: recentUsers = [], isLoading: usersLoading } = useRecentUsers();
  const { data: heroAd } = useHeroAd();
  const { data: creatorRevenues = [], isLoading: revenueLoading } = useCreatorRevenueList();
  // Biometric auth
  const { 
    isBiometricAvailable, 
    isBiometricEnabled, 
    isMobile,
    enableBiometric, 
    disableBiometric,
    isLoading: biometricLoading 
  } = useBiometricAuth(user?.id);
  
  // Ad form state
  const [adTitle, setAdTitle] = useState("");
  const [adUrl, setAdUrl] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adActive, setAdActive] = useState(true);
  const [adCategory, setAdCategory] = useState("general");
  const upsertHeroAd = useUpsertHeroAd();
  const processWithdrawal = useProcessWithdrawal();
  const movePending = useMovePendingToWallet();
  
  // AdSense settings
  const { data: adsenseSettings } = useAdSenseSettings();
  const updateAdSense = useUpdateAdSenseSettings();
  const [adsensePublisherId, setAdsensePublisherId] = useState("");
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);

  // Admin password reset state
  const { setupPassword, verifyPassword } = useAdminAuth();
  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [showCurrentAdminPassword, setShowCurrentAdminPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);

  // Update form when hero ad loads
  useEffect(() => {
    if (heroAd) {
      setAdTitle(heroAd.title);
      setAdUrl(heroAd.url);
      setAdImageUrl(heroAd.image_url || "");
      setAdActive(heroAd.is_active);
      setAdCategory(heroAd.category || "general");
    }
  }, [heroAd]);

  // Update AdSense form when settings load
  useEffect(() => {
    if (adsenseSettings) {
      setAdsensePublisherId(adsenseSettings.publisherId);
      setAdsenseEnabled(adsenseSettings.enabled);
    }
  }, [adsenseSettings]);

  const handleSaveAd = async () => {
    try {
      await upsertHeroAd.mutateAsync({
        title: adTitle,
        url: adUrl,
        image_url: adImageUrl || null,
        is_active: adActive,
        category: adCategory,
      });
      toast({
        title: "Ad updated",
        description: "Global ad banner has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ad. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAdSense = async () => {
    try {
      await updateAdSense.mutateAsync({
        publisherId: adsensePublisherId,
        enabled: adsenseEnabled,
      });
      toast({
        title: "AdSense updated",
        description: "Google AdSense settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AdSense settings.",
        variant: "destructive",
      });
    }
  };

  const handleResetAdminPassword = async () => {
    if (!currentAdminPassword) {
      toast({
        title: "Error",
        description: "Please enter your current admin password",
        variant: "destructive",
      });
      return;
    }

    if (newAdminPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setAdminPasswordLoading(true);

    try {
      // First verify current admin password
      const result = await verifyPassword.mutateAsync(currentAdminPassword);
      
      if (!result.verified) {
        setAdminPasswordLoading(false);
        toast({
          title: "Error",
          description: "Current admin password is incorrect",
          variant: "destructive",
        });
        return;
      }

      // Now set the new password
      await setupPassword.mutateAsync(newAdminPassword);
      
      setAdminPasswordLoading(false);
      toast({
        title: "Admin Password Updated",
        description: "Your admin panel password has been changed.",
      });
      setShowAdminPasswordDialog(false);
      setCurrentAdminPassword("");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
    } catch (error: any) {
      setAdminPasswordLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin password",
        variant: "destructive",
      });
    }
  };

  const statsData = [
    { 
      label: "Total Creators", 
      value: statsLoading ? "..." : stats?.totalUsers.toLocaleString() || "0", 
      change: "Active creators", 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: "Platform Revenue", 
      value: statsLoading ? "..." : `$${(stats?.totalRevenue || 0).toFixed(2)}`, 
      change: "Total earned", 
      icon: DollarSign, 
      color: "text-green-500" 
    },
    { 
      label: "Active Followers", 
      value: statsLoading ? "..." : (stats?.totalClicks || 0).toLocaleString(), 
      change: "Unique clicks", 
      icon: Eye, 
      color: "text-purple-500" 
    },
    { 
      label: "Pro Users", 
      value: statsLoading ? "..." : (stats?.proUsers || 0).toLocaleString(), 
      change: "Monetized", 
      icon: TrendingUp, 
      color: "text-orange-500" 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <AdminMobileHeader />

      {/* Admin Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-bold">Brioo</span>
            <span className="text-xs text-muted-foreground block">Admin Panel</span>
          </div>
        </div>

        <nav className="space-y-1">
          {adminMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link to="/dashboard">
            <GradientButton variant="outline" className="w-full" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Creator View
            </GradientButton>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Route-based content */}
          {(location.pathname === "/admin" || location.pathname === "/admin/") && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-display font-bold mb-1">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Platform overview and management</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    System Online
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsData.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <GlassCard>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                      <p className="text-2xl font-display font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pending Withdrawals */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Withdrawal Requests
                      </h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {withdrawals.length} active
                      </span>
                    </div>
                    <div className="space-y-3">
                      {withdrawalsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : withdrawals.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No withdrawal requests
                        </p>
                      ) : (
                        withdrawals.slice(0, 3).map((w) => (
                          <div 
                            key={w.id} 
                            className={`flex flex-col gap-2 p-3 rounded-lg ${
                              w.is_flagged 
                                ? "bg-destructive/10 border border-destructive/30" 
                                : "bg-secondary/30"
                            }`}
                          >
                            {w.is_flagged && (
                              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1.5 mb-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span className="font-medium">Fraud Risk Score: {w.fraud_score}/100</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm flex items-center gap-1.5">
                                  @{w.username}
                                  {w.is_flagged && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {w.payment_method.replace("_", " ")} • {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-lg block">${w.amount.toFixed(2)}</span>
                                <Badge variant="outline">
                                  {w.status === "processing" ? "Under Process" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "reject" })}
                                disabled={processWithdrawal.isPending}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <GradientButton
                                size="sm"
                                className="flex-1"
                                onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "approve" })}
                                disabled={processWithdrawal.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {w.status === "processing" ? "Complete" : "Process"}
                              </GradientButton>
                            </div>
                          </div>
                        ))
                      )}
                      {withdrawals.length > 3 && (
                        <Link to="/admin/revenue" className="text-xs text-primary hover:underline text-center block">
                          View all {withdrawals.length} requests →
                        </Link>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Recent Users */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Recent Signups
                      </h3>
                      <Link to="/admin/users" className="text-xs text-primary hover:underline">
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {usersLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : recentUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No users yet
                        </p>
                      ) : (
                        recentUsers.map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">@{u.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {u.display_name || "No display name"} • {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              u.is_pro ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                            }`}>
                              {u.is_pro ? "Pro" : "Free"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </>
          )}

          {/* Users Page */}
          {location.pathname === "/admin/users" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  User Management
                </h1>
                <p className="text-muted-foreground">View and manage all platform users</p>
              </div>
              
              <GlassCard>
                <div className="space-y-3">
                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : recentUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No users yet
                    </p>
                  ) : (
                    recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium">@{u.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.display_name || "No display name"} • Joined {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.is_pro ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                          }`}>
                            {u.is_pro ? "Pro" : "Free"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </>
          )}

          {/* Revenue Page */}
          {location.pathname === "/admin/revenue" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Revenue Management
                </h1>
                <p className="text-muted-foreground">Manage withdrawals and revenue processing</p>
              </div>

              {/* Revenue Actions */}
              <GlassCard className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      Process Pending Revenue
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Transfer pending revenue to creator wallets (run daily)
                    </p>
                  </div>
                  <GradientButton
                    onClick={() => movePending.mutate()}
                    disabled={movePending.isPending}
                  >
                    {movePending.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Process Pending Revenue"
                    )}
                  </GradientButton>
                </div>
              </GlassCard>
              
              {/* All Withdrawals */}
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    All Withdrawal Requests
                  </h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {withdrawals.length} pending
                  </span>
                </div>
                <div className="space-y-3">
                  {withdrawalsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : withdrawals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No withdrawal requests
                    </p>
                  ) : (
                    withdrawals.map((w) => (
                      <div 
                        key={w.id} 
                        className={`flex flex-col gap-2 p-4 rounded-lg ${
                          w.is_flagged 
                            ? "bg-destructive/10 border border-destructive/30" 
                            : "bg-secondary/30"
                        }`}
                      >
                        {w.is_flagged && (
                          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1.5 mb-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span className="font-medium">Fraud Risk Score: {w.fraud_score}/100</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-1.5">
                              @{w.username}
                              {w.is_flagged && (
                                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {w.payment_method.replace("_", " ")} • {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-xl block">${w.amount.toFixed(2)}</span>
                            <Badge variant="outline">
                              {w.status === "processing" ? "Under Process" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        
                        {w.fraud_flags && w.fraud_flags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {w.fraud_flags.map((flag, idx) => (
                              <span 
                                key={idx}
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  flag.severity === "high" 
                                    ? "bg-destructive/20 text-destructive" 
                                    : flag.severity === "medium"
                                      ? "bg-primary/20 text-primary"
                                      : "bg-secondary text-muted-foreground"
                                }`}
                                title={flag.message}
                              >
                                {flag.code.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "reject" })}
                            disabled={processWithdrawal.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <GradientButton
                            size="sm"
                            className="flex-1"
                            onClick={() => processWithdrawal.mutate({ withdrawal_id: w.id, action: "approve" })}
                            disabled={processWithdrawal.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {w.status === "processing" ? "Complete" : "Process"}
                          </GradientButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Creator Revenue Breakdown */}
              <GlassCard className="mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Creator Revenue Breakdown
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Individual earnings for each creator
                    </p>
                  </div>
                </div>
                
                {/* Revenue Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Creator</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Wallet Balance</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Pending</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Clicks</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                          </td>
                        </tr>
                      ) : creatorRevenues.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No creator data available
                          </td>
                        </tr>
                      ) : (
                        creatorRevenues.map((creator) => (
                          <tr key={creator.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground">
                                  {creator.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-medium">@{creator.username}</p>
                                  <p className="text-xs text-muted-foreground hidden sm:block">
                                    {creator.display_name || "No display name"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2 font-semibold text-primary">
                              ${(creator.wallet_balance || 0).toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-2 hidden sm:table-cell text-muted-foreground">
                              ${(creator.pending_revenue || 0).toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-2 hidden md:table-cell">
                              {(creator.unique_clicks || 0).toLocaleString()}
                            </td>
                            <td className="text-center py-3 px-2">
                              <Badge variant={creator.is_pro ? "default" : "secondary"}>
                                {creator.is_pro ? "Pro" : "Free"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </>
          )}

          {/* Ads Page */}
          {location.pathname === "/admin/ads" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-primary" />
                  Ad Management
                </h1>
                <p className="text-muted-foreground">Manage global ad banners and AdSense integration</p>
              </div>

              {/* Global Ad Banner Manager */}
              <GlassCard className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    Global Ad Banner
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ad-active-page" className="text-sm">Active</Label>
                    <Switch
                      id="ad-active-page"
                      checked={adActive}
                      onCheckedChange={async (checked) => {
                        setAdActive(checked);
                        if (heroAd || adTitle) {
                          try {
                            await upsertHeroAd.mutateAsync({
                              title: adTitle,
                              url: adUrl,
                              image_url: adImageUrl || null,
                              is_active: checked,
                              category: adCategory,
                            });
                            toast({
                              title: checked ? "Ad Enabled" : "Ad Disabled",
                              description: checked 
                                ? "Global ad banner is now visible on all profiles." 
                                : "Global ad banner has been hidden from all profiles.",
                            });
                          } catch (error) {
                            setAdActive(!checked);
                            toast({
                              title: "Error",
                              description: "Failed to update ad status.",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This banner appears at the top of every creator's public profile page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="ad-title-page" className="text-sm mb-2 block">Banner Title</Label>
                    <Input
                      id="ad-title-page"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      placeholder="e.g., Check out our sponsor!"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-url-page" className="text-sm mb-2 block">Link URL</Label>
                    <Input
                      id="ad-url-page"
                      value={adUrl}
                      onChange={(e) => setAdUrl(e.target.value)}
                      placeholder="https://sponsor.com"
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="ad-image-page" className="text-sm mb-2 block">Banner Image URL (optional)</Label>
                    <Input
                      id="ad-image-page"
                      value={adImageUrl}
                      onChange={(e) => setAdImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-category-page" className="text-sm mb-2 block">Target Category</Label>
                    <Select value={adCategory} onValueChange={setAdCategory}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">🌐 General (All users)</SelectItem>
                        {INTEREST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <GradientButton 
                  onClick={handleSaveAd} 
                  disabled={upsertHeroAd.isPending || !adTitle || !adUrl}
                >
                  {upsertHeroAd.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Ad Settings
                    </>
                  )}
                </GradientButton>
              </GlassCard>

              {/* Google AdSense Settings */}
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Google AdSense Integration
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure Google AdSense for monetization
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="adsense-enabled-page" className="text-sm">Enabled</Label>
                    <Switch
                      id="adsense-enabled-page"
                      checked={adsenseEnabled}
                      onCheckedChange={setAdsenseEnabled}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="adsense-publisher-page" className="text-sm mb-2 block">Publisher ID</Label>
                    <Input
                      id="adsense-publisher-page"
                      value={adsensePublisherId}
                      onChange={(e) => setAdsensePublisherId(e.target.value)}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="bg-secondary/50 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in your AdSense account settings
                    </p>
                  </div>
                  <div className="flex items-end">
                    <GradientButton 
                      onClick={handleSaveAdSense}
                      disabled={updateAdSense.isPending}
                    >
                      {updateAdSense.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save AdSense
                        </>
                      )}
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            </>
          )}

          {/* Guide Management Page */}
          {location.pathname === "/admin/guide" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  How to Use Guide
                </h1>
                <p className="text-muted-foreground">
                  Upload and manage guide pages shown in the "How to Use" modal
                </p>
              </div>
              <GuideManager />
            </>
          )}

          {/* Settings Page */}
          {location.pathname === "/admin/settings" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary" />
                  Admin Settings
                </h1>
                <p className="text-muted-foreground">Configure admin panel security and settings</p>
              </div>

              {/* Admin Security Settings */}
              <div className="space-y-6">
                <GlassCard>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary" />
                        Admin Panel Security
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Change your admin panel access password
                      </p>
                    </div>
                    <GradientButton
                      variant="outline"
                      onClick={() => setShowAdminPasswordDialog(true)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Admin Password
                    </GradientButton>
                  </div>
                </GlassCard>

                {/* Biometric Authentication - Mobile Only */}
                {isMobile && isBiometricAvailable && (
                  <GlassCard>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Fingerprint className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold">Biometric Authentication</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isBiometricEnabled 
                              ? "Fingerprint/Face ID is enabled for mobile admin login"
                              : "Enable fingerprint or Face ID for faster admin access on this device"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          id="biometric-toggle"
                          checked={isBiometricEnabled}
                          onCheckedChange={async (checked) => {
                            if (checked) {
                              await enableBiometric();
                            } else {
                              disableBiometric();
                            }
                          }}
                          disabled={biometricLoading}
                        />
                        <Label htmlFor="biometric-toggle" className="text-sm font-medium">
                          {isBiometricEnabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Desktop/Tablet Info */}
                {!isMobile && (
                  <GlassCard>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <Fingerprint className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-muted-foreground">Biometric Authentication</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Biometric login is only available on mobile devices. This device uses admin password for authentication.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Admin Password Reset Dialog */}
      <Dialog open={showAdminPasswordDialog} onOpenChange={setShowAdminPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>
              Enter your current admin password, then your new password. This is separate from your account password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Current Admin Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showCurrentAdminPassword ? "text" : "password"}
                  value={currentAdminPassword}
                  onChange={(e) => setCurrentAdminPassword(e.target.value)}
                  placeholder="Enter current admin password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentAdminPassword(!showCurrentAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Admin Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showAdminPassword ? "text" : "password"}
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new admin password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type={showAdminPassword ? "text" : "password"}
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>
            <GradientButton
              onClick={handleResetAdminPassword}
              disabled={adminPasswordLoading || !currentAdminPassword || newAdminPassword.length < 6}
              className="w-full"
            >
              {adminPasswordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Admin Password
                </>
              )}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
