import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Eye, Palette, Sparkles, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MobileBottomNavProps {
  username?: string;
  onAddClick?: () => void;
  onPreviewClick?: () => void;
}

export const MobileBottomNav = ({ username, onAddClick, onPreviewClick }: MobileBottomNavProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const bioUrl = username ? `https://brioo.in/${username}` : "";

  const handleShare = async () => {
    if (!bioUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Brioo Bio", text: "Check out my Brioo bio page!", url: bioUrl });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(bioUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: bioUrl });
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      icon: copied ? Check : Share2,
      label: "Share",
      action: "share",
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

          if (item.action === "share") {
            return (
              <button
                key={item.label}
                onClick={handleShare}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <item.icon className={cn("w-6 h-6", copied ? "text-green-500" : "text-muted-foreground")} />
                <span className={cn("text-xs", copied ? "text-green-500 font-medium" : "text-muted-foreground")}>{item.label}</span>
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
