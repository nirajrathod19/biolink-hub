import { useEffect } from "react";
import { useAdSenseSettings } from "@/hooks/useAdSense";

interface AdSenseAdProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

// AdSense component that displays ads
export const AdSenseAd = ({ slot, format = "auto", className = "" }: AdSenseAdProps) => {
  const { data: settings } = useAdSenseSettings();

  useEffect(() => {
    if (settings?.enabled && settings?.publisherId) {
      try {
        // Push to adsbygoogle when component mounts
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [settings]);

  if (!settings?.enabled || !settings?.publisherId) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={settings.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// Script loader component - add this once to your app
export const AdSenseScript = () => {
  const { data: settings } = useAdSenseSettings();

  useEffect(() => {
    if (settings?.enabled && settings?.publisherId) {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      if (existingScript) return;

      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisherId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      return () => {
        // Cleanup if needed
      };
    }
  }, [settings]);

  return null;
};
