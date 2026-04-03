// src/components/dashboard/sections/RecentActivitySection/components/EmptyState.tsx

import { Clock, Zap } from 'lucide-react';

import type { FilterType } from '@/src/types/dashboard';

interface EmptyStateProps {
  filter: FilterType;
}

export function EmptyState({ filter }: EmptyStateProps) {
  const message =
    filter === 'all'
      ? 'Your activity will appear here once you start saving.'
      : `No ${filter.replace('_', ' ')} transactions found.`;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center ring-1 ring-border/60">
          <Clock className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-2 ring-border">
          <Zap className="h-2.5 w-2.5 text-primary/60" />
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground tracking-tight">
        No transactions yet
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-45">
        {message}
      </p>
    </div>
  );
}
