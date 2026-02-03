import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  DollarSign,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Link2, label: "My Links", href: "/dashboard/links" },
  { icon: Share2, label: "Social Media", href: "/dashboard/social" },
  { icon: Palette, label: "Appearance", href: "/dashboard/appearance" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: DollarSign, label: "Monetization", href: "/dashboard/monetization" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Users, label: "Referrals", href: "/dashboard/referrals" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-3 px-6 py-6">
                <img 
                  src="/Logo1.png" 
                  alt="Brioo Dashboard" 
                  className="w-20 h-18 object-contain" 
                />
                
              </div>
            </Link>
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
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
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
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
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
          <button
            onClick={handleSignOut}
            className={cn(
              "mt-3 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Log Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
