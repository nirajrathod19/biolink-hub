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
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 lg:hidden">
      <div
        className="relative flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-1.5 shadow-[0_18px_50px_-12px_hsl(var(--primary)/0.35)] backdrop-blur-2xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%)",
          }}
        />
        {navItems.map((item) => {
          const isActive = item.href && location.pathname === item.href;

          if (item.action === "add") {
            return (
              <button
                key={item.label}
                onClick={onAddClick}
                aria-label={item.label}
                className="relative mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.7)] transition-transform active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            );
          }

          if (item.action === "preview") {
            return (
              <button
                key={item.label}
                onClick={onPreviewClick}
                aria-label={item.label}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground active:scale-95"
              >
                <item.icon className="h-5 w-5" />
              </button>
            );
          }

          if (item.action === "share") {
            return (
              <button
                key={item.label}
                onClick={handleShare}
                aria-label={item.label}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full transition-all hover:bg-foreground/5 active:scale-95",
                  copied ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href || "#"}
              aria-label={item.label}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95",
                isActive
                  ? "bg-primary/15 text-primary shadow-[0_0_18px_-4px_hsl(var(--primary)/0.6)]"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
