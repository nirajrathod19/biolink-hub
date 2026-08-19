import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  LayoutDashboard,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  DollarSign,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  Wallet,
  Users,
  Mail,
  Share2,
  MessageSquare,
  UserCircle,
  Zap,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { BugReportDialog } from "@/components/dashboard/BugReportDialog";
import { ContactSupportDialog } from "@/components/dashboard/ContactSupportDialog";
import { ProUpgradeModal } from "@/components/dashboard/ProUpgradeModal";
import { BriooLogo } from "@/components/brand/BriooLogo";

const primaryMenu = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard", proOnly: false },
  { icon: Link2, label: "My Page", href: "/dashboard/links", proOnly: false },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", proOnly: false },
  { icon: DollarSign, label: "Monetization", href: "/dashboard/monetization", proOnly: true },
  { icon: Sparkles, label: "AI Studio", href: "/dashboard/ai", proOnly: false, badge: "New" as const },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", proOnly: false },
];

const advancedMenu = [
  { icon: DollarSign, label: "Revenue", href: "/dashboard/revenue" },
  { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
  { icon: Share2, label: "Social", href: "/dashboard/social" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Mail, label: "Subscribers", href: "/dashboard/subscribers" },
  { icon: Users, label: "Referrals", href: "/dashboard/referrals" },
  { icon: MessageSquare, label: "Community", href: "/dashboard/community" },
  { icon: Zap, label: "Dynamic Rules", href: "/dashboard/rules" },
];

export const DashboardSidebar = () => { // sidebar component
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proFeatureName, setProFeatureName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  const isPro = profile?.is_pro || false;
  const [advancedOpen, setAdvancedOpen] = useState(
    advancedMenu.some((i) => location.pathname === i.href)
  );

  const bioUrl = profile?.username ? `https://brioo.in/${profile.username}` : "";

  const handleShare = async () => {
    if (!bioUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.display_name || profile?.username} - Brioo`, text: "Check out my Brioo bio page!", url: bioUrl });
      } catch (e) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(bioUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: bioUrl });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 transition-all duration-300",
        "bg-sidebar/70 backdrop-blur-2xl border-r border-sidebar-border/60",
        "shadow-[inset_-1px_0_0_hsl(var(--foreground)/0.04)]",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* subtle aurora wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(80% 40% at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%), radial-gradient(80% 40% at 50% 100%, hsl(var(--accent) / 0.10), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col h-full p-4">
        {/* Logo + Share */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <Link to="/" className="flex items-center" aria-label="Brioo home">
              <BriooLogo height={28} />
            </Link>
          )}
          <div className="flex items-center gap-1">
            {!collapsed && <NotificationBell />}
            {profile?.username && (
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                title="Share bio link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <ExternalLink className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Preview Button */}
        {profile?.username && !collapsed && (
          <Link 
            to={`/${profile.username}`}
            target="_blank"
            className="mb-6 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Eye className="w-4 h-4" />
            Preview Profile
          </Link>
        )}
        {profile?.username && collapsed && (
          <Link 
            to={`/${profile.username}`}
            target="_blank"
            className="mb-6 flex items-center justify-center w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            title="Preview Profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
        )}

      {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto min-h-0">
          {primaryMenu.map((item) => {
            const isActive = location.pathname === item.href;
            const isLocked = item.proOnly && !isPro;

            if (isLocked) {
              return (
                <button
                  key={item.href}
                  onClick={() => { setProFeatureName(item.label); setProModalOpen(true); }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left",
                    "text-muted-foreground hover:bg-sidebar-accent/50 opacity-60"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      {item.label}
                      <Crown className="w-3 h-3 text-amber-500" />
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "text-primary"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                )}
              >
                {isActive && (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-lg border border-primary/25 bg-primary/10 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.55)]"
                    />
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.7)]"
                    />
                  </>
                )}
                <item.icon className="relative w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && (
                  <span className="relative flex flex-1 items-center justify-between text-sm font-medium">
                    {item.label}
                    {"badge" in item && item.badge && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Advanced group */}
          {!collapsed && (
            <div className="pt-4">
              <button
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground"
              >
                Advanced
                <ChevronDown className={cn("h-3 w-3 transition-transform", advancedOpen && "rotate-180")} />
              </button>
              {advancedOpen && (
                <div className="mt-1 space-y-0.5">
                  {advancedMenu.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent/60 text-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0 opacity-80" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border pt-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground">
              {profile?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.username || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.is_pro ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3 space-y-1">
              <ContactSupportDialog />
              <BugReportDialog />
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              "mt-2 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Log Out</span>}
          </button>
        </div>
      </div>

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        feature={proFeatureName}
      />
    </aside>
  );
};