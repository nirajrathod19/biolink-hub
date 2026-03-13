import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* Avatar skeleton */}
        <div className="flex flex-col items-center text-center mb-8">
          <Skeleton className="w-28 h-28 rounded-full mb-4" />
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56 mb-4" />
          {/* Social icons skeleton */}
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-full" />
            ))}
          </div>
        </div>

        {/* Link cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="mt-12 flex justify-center">
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
};
