import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FloatingDemoCard = () => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.9 }}
        transition={{ delay: 2, type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 max-w-xs cursor-pointer"
        onClick={() => navigate("/demo")}
      >
        <div className="relative glass-card rounded-2xl p-4 pr-10 border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-shadow">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">Try the Live Demo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                See how your Brioo page looks — no signup needed →
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};