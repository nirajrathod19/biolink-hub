import { motion } from "framer-motion";
import { ExternalLink, Megaphone } from "lucide-react";
import { useHeroAd } from "@/hooks/useHeroAd";
import { useTrackAdClick } from "@/hooks/useViewTracking";

interface GlobalAdBannerProps {
  themeColor?: string;
}

export const GlobalAdBanner = ({ themeColor = "#8B5CF6" }: GlobalAdBannerProps) => {
  const { data: heroAd, isLoading } = useHeroAd();
  const trackClick = useTrackAdClick();

  if (isLoading || !heroAd) {
    return null;
  }

  const handleClick = () => {
    // Track click (fire and forget)
    trackClick.mutate(heroAd.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <a
        href={heroAd.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block group"
      >
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          {/* Sponsored label */}
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium text-muted-foreground">
              <Megaphone className="w-3 h-3" />
              Sponsored
            </span>
          </div>

          {heroAd.image_url ? (
            <div className="relative aspect-[3/1] w-full overflow-hidden">
              <img
                src={heroAd.image_url}
                alt={heroAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <p className="font-medium text-sm truncate pr-2">{heroAd.title}</p>
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  <Megaphone className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="font-medium text-sm">{heroAd.title}</p>
                  <p className="text-xs text-muted-foreground">Click to learn more</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
        </div>
      </a>
    </motion.div>
  );
};
