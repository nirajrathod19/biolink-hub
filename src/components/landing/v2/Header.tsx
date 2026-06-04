import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BriooLogo } from "@/components/brand/BriooLogo";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Brioo home">
          <BriooLogo height={32} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]">
              Start Free
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="px-3 py-2.5 rounded-md text-sm hover:bg-muted">
                {l.label}
              </a>
            ))}
            <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
              <Link to="/login"><Button variant="outline" className="w-full">Log in</Button></Link>
              <Link to="/signup">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
