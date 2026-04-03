// src/components/dashboard/sections/RecentActivitySection/RecentActivity.tsx

'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RefreshCw,
  SlidersHorizontal,
  LayoutList,
  ChevronDown,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/components/ui/utils';

// ── Local modules ──────────────────────────────────────────────────────────────
import { fetchActivity } from './api';
import { FILTER_OPTIONS, PAGE_SIZE } from './utils';

import type {
  ActivityItem,
  ActivityResponse,
  FilterType,
  RecentActivityProps,
} from '@/src/types/dashboard';

// ── Sub-components ─────────────────────────────────────────────────────────────
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { GroupedActivityList } from './components/GroupedActivityList';
import { ActivitySkeleton } from './components/ActivitySkeleton';
import { FilterBar } from './components/FilterBar';

const STALE_TIME = 1000 * 30;

export function RecentActivity({ onNavigate }: RecentActivityProps) {
  // ── Local state ───────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterType>('all');
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<ActivityItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ── Initial page fetch ────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery<ActivityResponse>({
    queryKey: ['recent-activity', filter],
    queryFn: async () => {
      const res = await fetchActivity(filter, 0, PAGE_SIZE);
      setAllItems(res.results);
      setHasMore(res.has_more);
      setOffset(res.results.length);
      return res;
    },
    staleTime: STALE_TIME,
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((f: FilterType) => {
    setFilter(f);
    setOffset(0);
    setAllItems([]);
    setHasMore(false);
    setShowFilters(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchActivity(filter, offset, PAGE_SIZE);
      setAllItems((prev) => [...prev, ...res.results]);
      setHasMore(res.has_more);
      setOffset((prev) => prev + res.results.length);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, offset, isLoadingMore, hasMore]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const total = data?.total ?? 0;
  const activeFilterLabel = FILTER_OPTIONS.find(
    (o) => o.value === filter,
  )?.label;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Activity
          </h3>
          {!isLoading && !isError && total > 0 && (
            <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
              {total} transaction{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground',
              showFilters && 'bg-muted text-foreground',
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground group"
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-500',
                isLoading ? 'animate-spin' : 'group-hover:rotate-180',
              )}
            />
          </Button>
        </div>
      </div>

      {/* Filter bar — conditionally rendered */}
      {showFilters && (
        <div className="animate-in slide-in-from-top-2 duration-150">
          <FilterBar active={filter} onChange={handleFilterChange} />
        </div>
      )}

      {/* Main card */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="px-5 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center ring-1 ring-primary/15">
                <LayoutList className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                Recent Transactions
              </span>
            </div>

            {/* Active filter dismissal pill */}
            {filter !== 'all' && (
              <button
                onClick={() => handleFilterChange('all')}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/15 transition-colors"
              >
                {activeFilterLabel}
                <span className="text-primary/60">×</span>
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <ActivitySkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : allItems.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <GroupedActivityList items={allItems} onNavigate={onNavigate} />
          )}
        </CardContent>

        {/* Load more footer */}
        {hasMore && !isLoading && !isError && (
          <div className="px-5 py-3 border-t border-border/40">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className={cn(
                'w-full flex items-center justify-center gap-2 text-[12px] font-medium',
                'text-muted-foreground hover:text-foreground transition-colors py-1',
                'rounded-xl hover:bg-muted/50 transition-all duration-150',
                isLoadingMore && 'opacity-60 cursor-not-allowed',
              )}
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show older transactions
                </>
              )}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
