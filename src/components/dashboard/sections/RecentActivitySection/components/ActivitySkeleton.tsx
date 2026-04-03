// src/components/dashboard/sections/RecentActivitySection/components/ActivitySkeleton.tsx

import { Skeleton } from '@/src/components/ui/skeleton';

export function ActivitySkeleton() {
  return (
    <div className="divide-y divide-border/40">
      {/* Day label */}
      <div className="px-5 py-2">
        <Skeleton className="h-3 w-10 rounded-full" />
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 px-5 py-3.5 animate-pulse"
          style={{ opacity: 1 - i * 0.12 }}
        >
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-3.5 w-[52%] rounded" />
            <Skeleton className="h-3 w-[32%] rounded" />
          </div>
          <div className="text-right space-y-1.5 shrink-0">
            <Skeleton className="h-4 w-20 rounded ml-auto" />
            <Skeleton className="h-3 w-12 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
