// src/components/dashboard/sections/ScheduledContributionSection/ScheduledContributions.tsx

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  RefreshCw,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/components/ui/utils';

// ── Local modules ──────────────────────────────────────────────────────────────
import { fetchScheduled, contribute } from './api';
import { STATUS_SORT_ORDER } from './utils';

import type {
  ContributionStatus,
  ScheduledContribution,
  ScheduledContributionsProps,
  ScheduledContributionsResponse,
} from '@/src/types/dashboard';

// ── Sub-components ─────────────────────────────────────────────────────────────
import { ScheduledSkeleton } from './ScheduledSkeleton';

import { EmptyState } from './component/EmptyState';
import { ErrorState } from './component/ErrorState';
import { SummaryHeader } from './component/SummaryHeader';
import { ContributionCard } from './component/ContributionCard';

const STALE_TIME = 1000 * 60;

export function ScheduledContributions({
  onNavigate,
}: ScheduledContributionsProps) {
  const queryClient = useQueryClient();
  const [contributingId, setContributingId] = useState<number | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } =
    useQuery<ScheduledContributionsResponse>({
      queryKey: ['scheduled-contributions'],
      queryFn: fetchScheduled,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
    });

  // ── Contribution mutation ─────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (groupId: number) => contribute(groupId),
    onMutate: (groupId) => setContributingId(groupId),
    onSuccess: (_, groupId) => {
      toast.success('Contribution recorded! 🎉', {
        description: 'Your savings are growing.',
      });

      // Optimistic cache update — mark the group as contributed immediately
      queryClient.setQueryData<ScheduledContributionsResponse>(
        ['scheduled-contributions'],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            contributions: old.contributions.map(
              (c): ScheduledContribution =>
                c.group_id === groupId
                  ? {
                      ...c,
                      already_contributed: true,
                      status: 'completed' as ContributionStatus,
                    }
                  : c,
            ),
          };
        },
      );

      // Invalidate related queries so downstream views stay fresh
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-contributions'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Contribution failed. Please try again.';
      toast.error(msg);
    },
    onSettled: () => setContributingId(null),
  });

  // ── Derived values ────────────────────────────────────────────────────────────
  const contributions = useMemo(
    () => data?.contributions ?? [],
    [data?.contributions],
  );

  const sorted = useMemo(
    () =>
      [...contributions].sort(
        (a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status],
      ),
    [contributions],
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/10 flex items-center justify-center ring-1 ring-primary/15 shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground leading-tight tracking-tight">
                Contributions
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Upcoming group payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {contributions.length > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full ring-1 ring-border/50">
                <TrendingUp className="h-3 w-3" />
                {contributions.length} active
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 group"
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
      </CardHeader>

      {/* Body */}
      <CardContent className="px-5 pb-5 pt-0 space-y-4">
        {isLoading ? (
          <ScheduledSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : sorted.length === 0 ? (
          <EmptyState onNavigate={onNavigate} />
        ) : (
          <>
            <SummaryHeader
              contributions={contributions}
              totalUpcoming={data?.total_upcoming_amount ?? '0'}
              walletBalance={data?.wallet_balance ?? '0'}
            />

            {/* Section divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {sorted.length} group{sorted.length !== 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Contribution cards */}
            <div className="space-y-2.5">
              {sorted.map((item) => (
                <ContributionCard
                  key={item.group_id}
                  item={item}
                  onContribute={(id) => mutation.mutate(id)}
                  isContributing={contributingId === item.group_id}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Footer notice */}
            <div className="flex items-start gap-3 px-3.5 py-3 rounded-2xl bg-muted/40 dark:bg-muted/20 ring-1 ring-border/40">
              <CircleDollarSign className="h-4 w-4 text-primary/50 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  Auto-deduction is active.
                </span>{' '}
                Contributions are deducted from your wallet on due dates. Keep
                your balance topped up to avoid missed payments.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
