import { Link, useLocation } from "react-router-dom";
import { Plus, Eye, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  username?: string;
  onAddClick?: () => void;
  onPreviewClick?: () => void;
}

export const MobileBottomNav = ({ username, onAddClick, onPreviewClick }: MobileBottomNavProps) => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Plus,
      label: "Add",
      action: "add",
    },
    {
      icon: Eye,
      label: "Preview",
      action: "preview",
    },
    {
      icon: Palette,
      label: "Design",
      href: "/dashboard/appearance",
    },
    {
      icon: Sparkles,
      label: "Enhance",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 lg:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = item.href && location.pathname === item.href;
          
          if (item.action === "add") {
            return (
              <button
                key={item.label}
                onClick={onAddClick}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

          if (item.action === "preview") {
            return (
              <button
                key={item.label}
                onClick={onPreviewClick}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <item.icon className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href || "#"}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <item.icon className={cn(
                "w-6 h-6",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
