import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADSENSE_PUBLISHER_ID = "ca-pub-5644108299979986";

interface AdSenseAdProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  profileId?: string;
}

export const AdSenseAd = ({ slot, format = "auto", className = "", profileId }: AdSenseAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);
  const hasPushed = useRef(false);

  useEffect(() => {
    if (!hasPushed.current) {
      hasPushed.current = true;
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense push error:", error);
      }
    }

    if (profileId && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      supabase.functions.invoke("track-view", {
        body: { profile_id: profileId, track_ad_impression: true },
      }).catch(err => console.error("Failed to track ad impression:", err));
    }
  }, [profileId]);

  return (
    <div ref={adRef} className={`${className} empty:hidden [&:has(ins[data-ad-status="unfilled"])]:hidden`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86" // Added from your ad unit code
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot="3003036738" // Your specific Slot ID
      />
    </div>
  );
};

// Kept for backward compat — script is now in index.html
export const AdSenseScript = () => null;