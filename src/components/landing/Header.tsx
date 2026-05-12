import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { GradientButton } from "@/components/ui/GradientButton";
import { HowToUseModal } from "@/components/HowToUseModal";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="px-3 md:px-6 pt-3 md:pt-5 flex justify-center">
        <motion.nav
          initial={false}
          animate={{
            width: scrolled ? "min(880px, 96%)" : "min(1100px, 100%)",
            paddingTop: scrolled ? 8 : 12,
            paddingBottom: scrolled ? 8 : 12,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className={cn(
            "pointer-events-auto relative flex items-center justify-between gap-4 rounded-full px-3 md:px-5",
            "border border-white/10",
            "bg-background/40 backdrop-blur-xl",
            "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)]",
            "before:absolute before:inset-0 before:rounded-full before:p-px before:bg-gradient-to-r before:from-primary/30 before:via-transparent before:to-accent/30 before:[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] before:[mask-composite:exclude] before:opacity-60 before:pointer-events-none"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 relative z-10">
            <img
              src="/Logo1.png"
              alt="Brioo"
              className="h-9 md:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav with magnetic underline */}
          <div
            className="hidden md:flex items-center gap-1 relative z-10"
            onMouseLeave={() => setHovered(null)}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHovered(link.label)}
                className="relative px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {hovered === link.label && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-foreground/5 border border-white/5"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            ))}
            <div className="px-1">
              <HowToUseModal />
            </div>
          </div>

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-2 relative z-10">
            {/* Live status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[10.5px] font-medium text-emerald-300/90 tracking-wide">Creators earning live</span>
            </div>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link to="/signup">
              <GradientButton size="sm" className="rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Get Started
              </GradientButton>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-foreground relative z-10 rounded-full hover:bg-foreground/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpen ? "x" : "m"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.nav>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-background/40 backdrop-blur-md pointer-events-auto z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="md:hidden relative z-50 mx-3 mt-3 pointer-events-auto"
            >
              <div className="rounded-3xl border border-white/10 bg-background/80 backdrop-blur-2xl p-3 shadow-2xl">
                <div className="flex flex-col">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="px-4 py-3 rounded-2xl text-base font-medium text-foreground/90 hover:bg-foreground/5 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="px-2 py-1">
                    <HowToUseModal />
                  </div>
                  <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-2 px-1">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <GradientButton variant="ghost" className="w-full rounded-2xl">
                        Log In
                      </GradientButton>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <GradientButton className="w-full rounded-2xl">
                        <Sparkles className="w-4 h-4" />
                        Get Started Free
                      </GradientButton>
                    </Link>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 pb-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    <span className="text-[11px] font-medium text-emerald-300/90 tracking-wide">
                      Creators earning live
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
