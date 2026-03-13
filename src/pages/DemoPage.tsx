import { motion } from "framer-motion";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Sparkles,
  Eye,
  MousePointer,
} from "lucide-react";

interface DemoLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  badge?: string;
  clicks: number;
}

const demoLinks: DemoLink[] = [
  { id: "1", title: "🎵 Check out my new single!", url: "#", badge: "NEW", clicks: 1243 },
  { id: "2", title: "📺 Subscribe to my YouTube", url: "#", clicks: 5621 },
  { id: "3", title: "🛍️ Shop my merch store", url: "#", badge: "HOT", clicks: 892 },
  { id: "4", title: "📸 Photography portfolio", url: "#", clicks: 2156 },
  { id: "5", title: "☕ Buy me a coffee", url: "#", clicks: 743 },
];

const socialLinks = [
  { platform: "Instagram", icon: Instagram, url: "#", color: "hover:text-pink-500" },
  { platform: "YouTube", icon: Youtube, url: "#", color: "hover:text-red-500" },
  { platform: "Twitter", icon: Twitter, url: "#", color: "hover:text-blue-400" },
  { platform: "LinkedIn", icon: Linkedin, url: "#", color: "hover:text-blue-600" },
  { platform: "GitHub", icon: Github, url: "#", color: "hover:text-foreground" },
];

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/20 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px]" />
      </div>

      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-accent py-2 px-4 text-center">
        <p className="text-sm font-medium text-primary-foreground flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          This is a demo bio page • <a href="/" className="underline">Create your own</a>
        </p>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-12">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent p-1">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-4xl">
                👤
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          {/* Name & Bio */}
          <h1 className="text-2xl font-display font-bold mb-2">@creativecreator</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
            Digital creator, musician & photographer. Sharing my journey one link at a time ✨
          </p>

          {/* Social Icons */}
          <div className="flex justify-center gap-3 mb-4">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-colors ${social.color}`}
                aria-label={social.platform}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-lg font-display font-bold gradient-text">10.2K</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold gradient-text">8.5K</p>
              <p className="text-xs text-muted-foreground">Clicks</p>
            </div>
          </div>
        </motion.div>

        {/* Sponsored Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-4"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
            <a
              href="#"
              className="relative block bg-card border border-primary/30 rounded-xl p-4 hover:border-primary/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-xl">🎁</div>
                  <div>
                    <span className="text-xs text-primary font-medium">Sponsored</span>
                    <p className="font-medium">Get 50% off premium tools!</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </a>
          </div>
        </motion.div>

        {/* Links */}
        <div className="space-y-3">
          {demoLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05, duration: 0.5 }}
            >
              <a
                href={link.url}
                className="block bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-card transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent/20 text-accent">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MousePointer className="w-3 h-3" />
                    <span className="text-xs">{link.clicks}</span>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

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
            <span className="gradient-text font-semibold">Brioo</span>
            <span>• Create your free page</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoPage;