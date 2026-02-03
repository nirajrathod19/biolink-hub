import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Megaphone, Timer } from "lucide-react";
import { useHeroAd } from "@/hooks/useHeroAd";
import { useTrackAdClick } from "@/hooks/useViewTracking";
import { GradientButton } from "@/components/ui/GradientButton";

const AdRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = searchParams.get("url") || "";
  const linkId = searchParams.get("link_id") || "";
  const profileId = searchParams.get("profile_id") || "";
  
  const { data: heroAd, isLoading: adLoading } = useHeroAd();
  const trackClick = useTrackAdClick();
  
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!targetUrl) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetUrl, navigate]);

  const handleContinue = () => {
    // Open target URL in new tab
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    // Navigate back to the profile
    if (profileId) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleAdClick = () => {
    if (heroAd) {
      trackClick.mutate(heroAd.id);
      window.open(heroAd.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!targetUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/10 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ad Section */}
          {adLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : heroAd ? (
            <div className="mb-8">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Megaphone className="w-4 h-4" />
                  Sponsored Content
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                onClick={handleAdClick}
                className="cursor-pointer group"
              >
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10">
                  {heroAd.image_url ? (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={heroAd.image_url}
                        alt={heroAd.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-xl font-display font-bold text-foreground mb-2">
                          {heroAd.title}
                        </h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Click to learn more
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Megaphone className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-display font-bold mb-2">
                        {heroAd.title}
                      </h2>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Click to learn more
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : null}

          {/* Continue Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-4">
                You're being redirected to:
              </p>
              <p className="text-sm font-mono text-foreground/80 bg-secondary/50 rounded-lg px-3 py-2 mb-6 truncate">
                {targetUrl}
              </p>

              {canSkip ? (
                <GradientButton onClick={handleContinue} className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Continue to Link
                </GradientButton>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span>Continue in {countdown}s...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="gradient-text font-semibold">BioLink</span>
                <span>• Create your free page</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdRedirectPage;
