import { useNavigate } from "react-router-dom";
import {
  Link2,
  LayoutDashboard,
  Settings,
  Wallet,
  BarChart3,
  Share2,
  Palette,
  LogOut,
  Users,
  Eye,
  DollarSign,
  MessageSquare,
  UserCircle,
  Mail,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { SheetClose } from "@/components/ui/sheet";
import { ContactSupportDialog } from "@/components/dashboard/ContactSupportDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Link2, label: "My Links", href: "/dashboard/links" },
  { icon: Share2, label: "Social Media", href: "/dashboard/social" },
  { icon: Palette, label: "Appearance", href: "/dashboard/appearance" },
  { icon: MessageSquare, label: "Community", href: "/dashboard/community" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: DollarSign, label: "Monetization", href: "/dashboard/monetization" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Users, label: "Referrals", href: "/dashboard/referrals" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
  { icon: Mail, label: "Subscribers", href: "/dashboard/subscribers" },
  { icon: Zap, label: "Dynamic Rules", href: "/dashboard/rules" },
];

export const MobileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

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
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <SheetClose asChild key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            </SheetClose>
          );
        })}
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
    </div>
  );
};