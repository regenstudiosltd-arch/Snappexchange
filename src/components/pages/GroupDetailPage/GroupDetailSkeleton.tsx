'use client';

import { cn } from '@/src/components/ui/utils';

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-muted/70', className)} />
  );
}

function StatCardBone() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-start">
        <Bone className="h-3 w-20" />
        <Bone className="h-8 w-8 rounded-lg" />
      </div>
      <Bone className="h-7 w-28" />
      <Bone className="h-3 w-24" />
    </div>
  );
}

export function GroupDetailSkeleton() {
  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-28 md:pb-12">
      {/* Hero */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8 space-y-5 animate-pulse">
        <div className="flex justify-between items-center">
          <Bone className="h-9 w-24" />
          <div className="flex gap-2">
            <Bone className="h-8 w-24 rounded-full" />
            <Bone className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4">
          <Bone className="h-16 w-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-8 w-56" />
            <Bone className="h-4 w-40" />
          </div>
        </div>
        <Bone className="h-2 w-full rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardBone key={i} />
        ))}
      </div>

      {/* Cycle transparency */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Bone className="h-9 w-9 rounded-xl" />
            <div className="space-y-2">
              <Bone className="h-4 w-36" />
              <Bone className="h-3 w-28" />
            </div>
          </div>
          <Bone className="h-7 w-20 rounded-full" />
        </div>
        <Bone className="h-2.5 w-full rounded-full" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Bone className="h-20 rounded-xl" />
          <Bone className="h-20 rounded-xl" />
        </div>
        <Bone className="h-16 rounded-xl" />
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/40 bg-card animate-pulse">
          <div className="p-5 border-b border-border/40 flex gap-3 items-center">
            <Bone className="h-9 w-9 rounded-xl" />
            <div className="space-y-2">
              <Bone className="h-4 w-36" />
              <Bone className="h-3 w-28" />
            </div>
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Bone className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-3.5 w-32" />
                  <Bone className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card animate-pulse">
          <div className="p-5 border-b border-border/40 flex gap-3 items-center">
            <Bone className="h-9 w-9 rounded-xl" />
            <div className="space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
