import { motion } from "framer-motion";
import { UserX, ArrowRight, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";

interface ProfileNotFoundProps {
  username?: string;
}

export const ProfileNotFound = ({ username }: ProfileNotFoundProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <GlassCard className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
          >
            <UserX className="w-10 h-10 text-muted-foreground" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-display font-bold mb-2 text-foreground"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-2"
          >
            Profile not found
          </motion.p>

          {username && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm text-muted-foreground/70 mb-6"
            >
              The username <span className="font-semibold text-foreground">@{username}</span> isn't taken yet!
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Button asChild className="w-full gap-2">
              <a href="/signup">
                <Sparkles className="w-4 h-4" />
                {username ? `Claim @${username}` : "Create your Brioo page"}
              </a>
            </Button>
            <Button asChild variant="ghost" className="w-full gap-2 text-muted-foreground">
              <a href="/">
                Go to homepage
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
