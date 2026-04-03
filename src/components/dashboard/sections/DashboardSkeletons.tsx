// src/components/dashboard/sections/DashboardSkeletons.tsx

import { Skeleton } from '@/src/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';

// ─── TotalSavingsCard skeleton ────────────────────────────────────────────────

export function TotalSavingsCardSkeleton() {
  return (
    <div className="rounded-2xl bg-linear-to-br from-cyan-500/30 to-teal-600/30 p-6 space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded bg-white/30" />
        <Skeleton className="h-9 w-9 rounded-md bg-white/30" />
      </div>
      <Skeleton className="h-10 w-44 rounded bg-white/30" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full bg-white/30" />
        <Skeleton className="h-4 w-40 rounded bg-white/30" />
      </div>
      <div className="border-t border-white/20 pt-4 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-md bg-white/30" />
        <Skeleton className="h-10 flex-1 rounded-md bg-white/30" />
      </div>
    </div>
  );
}

// ─── QuickActions skeleton ────────────────────────────────────────────────────

export function QuickActionsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-7 w-40 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card"
          >
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SavingsGroupCard skeleton ────────────────────────────────────────────────

export function SavingsGroupCardSkeleton() {
  return (
    <Card className="bg-card border-border animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="text-right space-y-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── FinancialGoalsSection skeleton ──────────────────────────────────────────

export function FinancialGoalsSectionSkeleton() {
  return (
    <Card className="bg-card border-border animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-52 rounded" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-lg border border-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Full-page dashboard skeleton ─────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 mb-18 md:mb-0">
      <TotalSavingsCardSkeleton />
      <QuickActionsSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-7 w-48 rounded" />
          <SavingsGroupCardSkeleton />
          <SavingsGroupCardSkeleton />
        </div>
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-7 w-36 rounded" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>

      <FinancialGoalsSectionSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
