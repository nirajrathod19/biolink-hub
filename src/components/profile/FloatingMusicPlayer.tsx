import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { BioTheme } from "@/lib/bioThemes";

interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

interface FloatingMusicPlayerProps {
  tracks: AudioTrack[];
  theme: BioTheme;
}

export const FloatingMusicPlayer = ({ tracks, theme }: FloatingMusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  if (isDismissed || tracks.length === 0) return null;

  const accent = theme.accent;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val[0];
      setProgress(val[0]);
    }
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1));
    setProgress(0);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0));
    setProgress(0);
  };

  return (
    <>
      <audio ref={audioRef} src={currentTrack?.url} muted={isMuted} preload="metadata" />
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          {isMinimized ? (
            <motion.button
              onClick={() => setIsMinimized(false)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl ml-auto"
              style={{ background: accent, color: theme.accentText || "#fff" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music className="w-6 h-6" />
            </motion.button>
          ) : (
            <div
              className="rounded-2xl p-4 shadow-2xl"
              style={{
                background: theme.cardBg.includes("rgba") ? theme.cardBg : `${theme.cardBg}F0`,
                border: `1px solid ${theme.cardBorder}`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${accent}20` }}
                  >
                    <Music className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.cardText }}>
                      {currentTrack?.title || "Unknown Track"}
                    </p>
                    <p className="text-[10px]" style={{ color: theme.bioTextColor }}>
                      Track {currentTrackIndex + 1} of {tracks.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Music className="w-3.5 h-3.5" style={{ color: theme.bioTextColor }} />
                  </button>
                  <button
                    onClick={() => setIsDismissed(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: theme.bioTextColor }} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: theme.bioTextColor }}>
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setIsMuted(!isMuted)} className="p-1.5">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" style={{ color: theme.bioTextColor }} />
                  ) : (
                    <Volume2 className="w-4 h-4" style={{ color: theme.bioTextColor }} />
                  )}
                </button>
                <button onClick={prevTrack} className="p-1.5" disabled={tracks.length <= 1}>
                  <SkipBack className="w-5 h-5" style={{ color: theme.cardText }} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: accent, color: theme.accentText || "#fff" }}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="p-1.5" disabled={tracks.length <= 1}>
                  <SkipForward className="w-5 h-5" style={{ color: theme.cardText }} />
                </button>
                <div className="w-8" /> {/* Spacer for symmetry */}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};