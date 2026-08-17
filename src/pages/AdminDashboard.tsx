import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, DollarSign, Activity, Settings, Shield, Megaphone, BookOpen, Bug, BarChart3, ExternalLink, Package, ShieldCheck,
} from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminPayoutsTab } from "@/components/admin/AdminPayoutsTab";
import { AdminActivityTab } from "@/components/admin/AdminActivityTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { GuideManager } from "@/components/admin/GuideManager";
import { BugReportsManager } from "@/components/admin/BugReportsManager";
import { AdminTicketsTab } from "@/components/admin/AdminTicketsTab";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminDebugTab } from "@/components/admin/AdminDebugTab";
import { AdminMonetizationTab } from "@/components/admin/AdminMonetizationTab";
import { useNewTicketCount } from "@/hooks/useSupportTickets";

import { Inbox, Bug as BugIcon } from "lucide-react";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Package, label: "Orders", href: "/admin/orders" },
  { icon: DollarSign, label: "Payouts", href: "/admin/payouts" },
  { icon: ShieldCheck, label: "Monetization", href: "/admin/monetization" },
  { icon: Activity, label: "Activity", href: "/admin/activity" },
  { icon: Inbox, label: "Tickets", href: "/admin/tickets" },
  { icon: Megaphone, label: "Ads", href: "/admin/ads" },
  { icon: BookOpen, label: "Guide", href: "/admin/guide" },
  { icon: Bug, label: "Bugs", href: "/admin/bugs" },
  { icon: BugIcon, label: "Debug", href: "/admin/debug" },
  { icon: Shield, label: "Security", href: "/admin/security" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const { data: newTicketCount = 0 } = useNewTicketCount();

  return (
    <div className="min-h-screen bg-background">
      <AdminMobileHeader />

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-card/30 border-r border-border/40 backdrop-blur-sm z-40">
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Brioo</span>
            <span className="text-[10px] text-muted-foreground block leading-tight">Admin Console</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto min-h-0">
          {adminMenuItems.map((item) => {
            const isActive = path === item.href || (item.href === "/admin" && path === "/admin/");
            return (
              <Link key={item.href} to={item.href}
                className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm",
                  isActive ? "bg-primary/10 text-primary font-medium border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === "Tickets" && newTicketCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{newTicketCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/30">
          <Link to="/dashboard">
            <GradientButton variant="outline" className="w-full" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Creator View
            </GradientButton>
          </Link>
        </div>
      </aside>

      <main className="lg:ml-60 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {(path === "/admin" || path === "/admin/") && <AdminOverviewTab />}
          {path === "/admin/users" && <AdminUsersTab />}
          {path === "/admin/orders" && <AdminOrdersTab />}
          {path === "/admin/payouts" && <AdminPayoutsTab />}
          {path === "/admin/monetization" && <AdminMonetizationTab />}
          {path === "/admin/activity" && <AdminActivityTab />}
          {path === "/admin/ads" && <AdminSettingsTab />}
          {path === "/admin/revenue" && <AdminPayoutsTab />}
          {path === "/admin/tickets" && <AdminTicketsTab />}
          {path === "/admin/guide" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-display font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Guide Manager</h1>
                <p className="text-muted-foreground text-sm">Upload and manage "How to Use" guide pages</p>
              </div>
              <GuideManager />
            </>
          )}
          {path === "/admin/bugs" && <BugReportsManager />}
          {path === "/admin/debug" && <AdminDebugTab />}
          {path === "/admin/security" && <SecurityDashboard />}
          {path === "/admin/settings" && <AdminSettingsTab />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;