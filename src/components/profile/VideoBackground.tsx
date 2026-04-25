import { useMemo } from "react";
import { motion } from "framer-motion";

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
      {/* Premium mesh gradient overlay — three drifting blobs for depth */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden mix-blend-overlay">
        <motion.div
          animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-50 bg-fuchsia-500"
        />
        <motion.div
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-40 bg-cyan-400"
        />
        <motion.div
          animate={{ x: [0, 30, -30, 0], y: [0, 25, -25, 0], scale: [1, 1.08, 0.92, 1] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] rounded-full blur-[110px] opacity-35 bg-indigo-500"
        />
      </div>
    </div>
  );
};
