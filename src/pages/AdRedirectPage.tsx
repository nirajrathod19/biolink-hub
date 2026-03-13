import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Timer } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { AdSenseAd } from "@/components/ads/AdSenseAd";

const AdRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = searchParams.get("url") || "";
  const profileId = searchParams.get("profile_id") || "";

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
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (profileId) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (!targetUrl) return null;

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
          {/* AdSense Ad Strip */}
          <div className="mb-6">
            <AdSenseAd
              slot="interstitial"
              format="horizontal"
              className="w-full"
              profileId={profileId || undefined}
            />
          </div>

          {/* Continue Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
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
                <span className="gradient-text font-semibold">Brioo</span>
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