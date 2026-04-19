import { useMemo } from "react";

interface VideoBackgroundProps {
  url: string;
  overlayOpacity?: number; // 0-100
}

const getYouTubeId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
};

const getVimeoId = (url: string): string | null => {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
};

export const VideoBackground = ({ url, overlayOpacity = 40 }: VideoBackgroundProps) => {
  const source = useMemo(() => {
    if (!url) return null;
    const yt = getYouTubeId(url);
    if (yt) {
      return {
        type: "iframe" as const,
        src: `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${yt}&playsinline=1`,
      };
    }
    const vm = getVimeoId(url);
    if (vm) {
      return {
        type: "iframe" as const,
        src: `https://player.vimeo.com/video/${vm}?autoplay=1&loop=1&muted=1&background=1&controls=0`,
      };
    }
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
      return { type: "video" as const, src: url };
    }
    return null;
  }, [url]);

  if (!source) return null;
  const opacity = Math.max(0, Math.min(100, overlayOpacity)) / 100;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {source.type === "video" ? (
        <video
          src={source.src}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <iframe
          src={source.src}
          title="Background video"
          allow="autoplay; encrypted-media"
          frameBorder={0}
          className="absolute inset-0 w-[177.77vh] h-[100vh] min-w-full min-h-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${opacity})` }} />
    </div>
  );
};
