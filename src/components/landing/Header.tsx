import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="glass-card rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img 
                src="/Logo1.png" 
                alt="Brioo Logo" 
                className="w-20 h-18 object-contain drop-shadow-[0_0_1px_#fffff(255,255,255,0.2)]" 
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <HowToUseModal />
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <GradientButton variant="ghost">Log In</GradientButton>
            </Link>
            <Link to="/signup">
              <GradientButton>Get Started</GradientButton>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mx-4 mt-2"
          >
            <div className="glass-card rounded-2xl p-4">
              <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="py-2">
                  <HowToUseModal />
                </div>
                <div className="border-t border-border pt-3 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <GradientButton variant="ghost" className="w-full">
                      Log In
                    </GradientButton>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <GradientButton className="w-full">Get Started</GradientButton>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
