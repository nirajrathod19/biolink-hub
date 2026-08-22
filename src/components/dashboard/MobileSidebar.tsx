import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  LayoutDashboard,
  Settings,
  Wallet,
  BarChart3,
  Share2,
  LogOut,
  Users,
  Eye,
  DollarSign,
  MessageSquare,
  UserCircle,
  Mail,
  Zap,
  Crown,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { SheetClose } from "@/components/ui/sheet";
import { ContactSupportDialog } from "@/components/dashboard/ContactSupportDialog";
import { ProUpgradeModal } from "@/components/dashboard/ProUpgradeModal";

const primaryMenu = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard", proOnly: false },
  { icon: Link2, label: "My Page", href: "/dashboard/links", proOnly: false },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", proOnly: false },
  { icon: DollarSign, label: "Monetization", href: "/dashboard/monetization", proOnly: true },
  { icon: Sparkles, label: "AI Studio", href: "/dashboard/ai", proOnly: false, badge: "New" as const },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", proOnly: false },
];

const advancedMenu = [
  { icon: DollarSign, label: "Earnings", href: "/dashboard/revenue" },
  { icon: Wallet, label: "Wallet & Payouts", href: "/dashboard/wallet" },
  { icon: Users, label: "Invite & Earn", href: "/dashboard/referrals" },
  { icon: UserCircle, label: "Edit Profile", href: "/dashboard/profile" },
  { icon: Share2, label: "Social Links", href: "/dashboard/social" },
  { icon: Mail, label: "My Audience", href: "/dashboard/subscribers" },
  { icon: MessageSquare, label: "Community", href: "/dashboard/community" },
  { icon: Zap, label: "Smart Rules", href: "/dashboard/rules" },
];

export const MobileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proFeatureName, setProFeatureName] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(
    advancedMenu.some((i) => location.pathname === i.href)
  );

  const isPro = profile?.is_pro || false;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 pt-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Link2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold">Brioo</span>
      </div>

      {/* User Profile Section */}
      <div className="mb-6 p-4 rounded-xl bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-semibold text-primary-foreground">
            {profile?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile?.display_name || profile?.username || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              @{profile?.username}
            </p>
          </div>
        </div>
        {profile?.username && (
          <SheetClose asChild>
            <Link 
              to={`/${profile.username}`}
              target="_blank"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Eye className="w-4 h-4" />
              Preview Profile
            </Link>
          </SheetClose>
        )}
      </div>

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
                <span className="text-sm flex items-center gap-1.5">
                  {item.label}
                  <Crown className="w-3 h-3 text-amber-500" />
                </span>
              </button>
            );
          }

          return (
            <SheetClose asChild key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </span>
                {"badge" in item && item.badge && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {item.badge}
                  </span>
                )}
              </Link>
            </SheetClose>
          );
        })}

        {/* Advanced group */}
        <div className="pt-4">
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground"
          >
            More
            <ChevronDown className={cn("h-3 w-3 transition-transform", advancedOpen && "rotate-180")} />
          </button>
          {advancedOpen && (
            <div className="mt-1 space-y-0.5">
              {advancedMenu.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
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
                  </SheetClose>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Support + Sign Out */}
      <div className="border-t border-sidebar-border pt-4 space-y-1">
        <ContactSupportDialog />
        <SheetClose asChild>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Log Out</span>
          </button>
        </SheetClose>
      </div>

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        feature={proFeatureName}
      />
    </div>
  );
};