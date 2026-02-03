import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Send,
  Camera,
  Facebook,
} from "lucide-react";
import { usePublicProfile } from "@/hooks/useProfile";
import { usePublicLinks } from "@/hooks/useLinks";
import { usePublicSocialLinks } from "@/hooks/useSocialLinks";
import { GlobalAdBanner } from "@/components/profile/GlobalAdBanner";
import { useTrackProfileView } from "@/hooks/useViewTracking";

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  github: Github,
  whatsapp: MessageCircle,
  telegram: Send,
  snapchat: Camera,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: "hover:text-pink-500",
  youtube: "hover:text-red-500",
  twitter: "hover:text-blue-400",
  linkedin: "hover:text-blue-600",
  facebook: "hover:text-blue-500",
  github: "hover:text-foreground",
  whatsapp: "hover:text-green-500",
  telegram: "hover:text-blue-400",
  snapchat: "hover:text-yellow-400",
};

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = usePublicProfile(username || "");
  const { data: links = [] } = usePublicLinks(profile?.user_id || "");
  const { data: socialLinks = [] } = usePublicSocialLinks(profile?.user_id || "");
  
  // Track profile view when page loads
  useTrackProfileView(profile?.id);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: { id: string; url: string }) => {
    e.preventDefault();
    // Redirect through interstitial ad page
    const params = new URLSearchParams({
      url: link.url,
      link_id: link.id,
      profile_id: profile?.id || "",
    });
    navigate(`/ad-redirect?${params.toString()}`);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">404</h1>
          <p className="text-muted-foreground mb-6">Profile not found</p>
          <a href="/" className="text-primary hover:underline">
            Create your own BioLink page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[100px]"
          style={{ background: `linear-gradient(to bottom, ${profile.theme_color}33, transparent)` }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: `${profile.theme_color}20` }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* Global Ad Banner - Always at top */}
        <GlobalAdBanner themeColor={profile.theme_color || "#8B5CF6"} />

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div 
              className="w-28 h-28 rounded-full p-1"
              style={{ background: `linear-gradient(135deg, ${profile.theme_color}, ${profile.theme_color}88)` }}
            >
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name || profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>
            {profile.is_pro && (
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${profile.theme_color}, ${profile.theme_color}88)` }}
              >
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Name & Bio */}
          <h1 className="text-2xl font-display font-bold mb-2">
            {profile.display_name || `@${profile.username}`}
          </h1>
          {profile.bio && (
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
              {profile.bio}
            </p>
          )}

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.platform] || ExternalLink;
                const colorClass = SOCIAL_COLORS[social.platform] || "hover:text-primary";
                
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-colors ${colorClass}`}
                    aria-label={social.platform}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Links */}
        <div className="space-y-3">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
            >
              <a
                href={link.url}
                onClick={(e) => handleLinkClick(e, link)}
                className="block bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-card transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    {link.badge && (
                      <span 
                        className="px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{ 
                          backgroundColor: `${profile.theme_color}20`,
                          color: profile.theme_color 
                        }}
                      >
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No links yet</p>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="gradient-text font-semibold">BioLink</span>
            <span>• Create your free page</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
