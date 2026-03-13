import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, DollarSign, Settings, Shield, Megaphone, BarChart3, LogOut, ExternalLink, Bug, Activity, BookOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SheetClose } from "@/components/ui/sheet";
import { GradientButton } from "@/components/ui/GradientButton";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: DollarSign, label: "Payouts", href: "/admin/payouts" },
  { icon: Activity, label: "Activity", href: "/admin/activity" },
  { icon: Megaphone, label: "Ads", href: "/admin/ads" },
  { icon: BookOpen, label: "Guide", href: "/admin/guide" },
  { icon: Bug, label: "Bugs", href: "/admin/bugs" },
  { icon: Shield, label: "Security", href: "/admin/security" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export const AdminMobileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-8 pt-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <span className="font-display font-bold">Brioo</span>
          <span className="text-xs text-muted-foreground block">Admin Console</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {adminMenuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <SheetClose asChild key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-medium border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border/30 pt-4">
        <SheetClose asChild>
          <Link to="/dashboard">
            <GradientButton variant="outline" className="w-full" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Creator View
            </GradientButton>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Log Out</span>
          </button>
        </SheetClose>
      </div>
    </div>
  );
};