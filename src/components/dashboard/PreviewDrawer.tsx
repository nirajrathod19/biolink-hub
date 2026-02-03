import { X, ChevronLeft, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SocialIconsBar } from "@/components/profile/SocialIconsBar";
import { LinksList } from "@/components/dashboard/LinksList";

interface PreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    username?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  } | null;
  links: Array<{
    id: string;
    title: string;
    url: string;
    click_count: number | null;
    is_active: boolean | null;
    badge?: string | null;
  }>;
}

export const PreviewDrawer = ({ isOpen, onClose, profile, links }: PreviewDrawerProps) => {
  const activeLinks = links.filter(link => link.is_active !== false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-secondary rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate max-w-[200px]">
                  brioo.in/{profile?.username}
                </span>
              </div>
              
              <button className="p-2 rounded-full hover:bg-secondary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="bg-secondary/50 min-h-full px-4 py-8">
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center mb-8">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground mb-4 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile?.display_name || profile?.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <svg className="w-12 h-12 text-muted-foreground/50" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <h2 className="text-xl font-bold mb-2">
                    @{profile?.username}
                  </h2>

                  {/* Bio */}
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Links Preview */}
                {activeLinks.length > 0 ? (
                  <div className="space-y-3 mb-8">
                    {activeLinks.map((link) => (
                      <div
                        key={link.id}
                        className="bg-background rounded-full py-4 px-6 text-center shadow-sm"
                      >
                        <span className="font-medium">{link.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No links added yet</p>
                  </div>
                )}

                {/* Join Button - like Linktree */}
                <div className="mt-8 px-4">
                  <button className="w-full bg-background rounded-full py-4 px-6 text-center font-medium shadow-sm">
                    Join {profile?.username} on Brioo
                  </button>
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
                  <span>Report</span>
                  <span>•</span>
                  <span>Privacy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
