import { Progress } from "@/components/ui/progress";

interface MonetizationStripProps {
  currentClicks: number;
  targetClicks: number;
  isPro?: boolean;
}

export const MonetizationStrip = ({ currentClicks, targetClicks, isPro }: MonetizationStripProps) => {
  const progress = Math.min((currentClicks / targetClicks) * 100, 100);

  if (isPro) return null;

  return (
    <div className="w-full bg-secondary/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
              Monetization
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {currentClicks.toLocaleString()} / {targetClicks.toLocaleString()} clicks
            </span>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5 mt-1.5" />
      </div>
    </div>
  );
};
