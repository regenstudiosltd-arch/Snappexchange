// src/components/dashboard/sections/ScheduledContributionSection/ScheduledSkeleton.tsx

import { Skeleton } from '@/src/components/ui/skeleton';

export function ScheduledSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-muted/60 p-4 space-y-2">
          <Skeleton className="h-2.5 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
        </div>
        <div className="rounded-2xl bg-muted/60 p-4 space-y-2">
          <Skeleton className="h-2.5 w-12 rounded-full" />
          <Skeleton className="h-7 w-20 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Progress bar */}
      <Skeleton className="h-1.5 w-full rounded-full" />

      {/* Contribution card skeletons */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex overflow-hidden rounded-2xl border border-border/50"
          style={{ opacity: 1 - i * 0.2 }}
        >
          <Skeleton className="w-1 shrink-0 rounded-none" />
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
