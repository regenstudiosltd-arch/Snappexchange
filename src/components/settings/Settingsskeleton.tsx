// src/components/settings/Settingsskeleton.tsx

'use client';

import { Skeleton } from '../ui/skeleton';

function SkeletonSection({
  rows = 3,
  hasFooter = true,
}: {
  rows?: number;
  hasFooter?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/60 flex items-start gap-4">
        <Skeleton className="h-8 w-8 rounded-xl shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-60 rounded" />
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Footer */}
      {hasFooter && (
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      )}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* Content */}
      <div className="space-y-6">
        <SkeletonSection rows={4} />
        <SkeletonSection rows={3} />
        <SkeletonSection rows={3} />
        <SkeletonSection rows={4} />
        <SkeletonSection rows={2} />
        <SkeletonSection rows={1} hasFooter={false} />
      </div>
    </div>
  );
}
