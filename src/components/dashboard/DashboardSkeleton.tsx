import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "./DashboardLayout";

export const DashboardSkeleton = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8">
        {/* Monetization strip skeleton */}
        <Skeleton className="h-12 w-full rounded-lg mb-4" />

        {/* Profile header skeleton */}
        <div className="flex flex-col items-center text-center py-6">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-3" />
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Add link button skeleton */}
        <Skeleton className="h-14 w-full rounded-lg border-2 border-dashed border-border mb-6" />

        {/* Link items skeleton */}
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
