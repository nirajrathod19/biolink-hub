import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isConnected: boolean;
  className?: string;
}

/**
 * Pulsing green dot that indicates a live realtime connection.
 */
export const LiveIndicator = ({ isConnected, className }: LiveIndicatorProps) => {
  if (!isConnected) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-xs font-medium text-green-500">Live</span>
    </div>
  );
};
