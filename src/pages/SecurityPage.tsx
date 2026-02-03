import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings,
  BarChart3,
  Megaphone,
  ExternalLink,
  Shield,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: DollarSign, label: "Revenue", href: "/admin/revenue" },
  { icon: Megaphone, label: "Ads", href: "/admin/ads" },
  { icon: Shield, label: "Security", href: "/admin/security" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const SecurityPage = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border p-4">
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
                    ? "bg-sidebar-accent text-sidebar-primary"
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
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Security Center
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage platform security, login attempts, and account lockouts
            </p>
          </motion.div>

          {/* Security Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard>
              <SecurityDashboard />
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SecurityPage;
