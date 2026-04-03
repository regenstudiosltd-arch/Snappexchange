// src/components/dashboard/sections/ScheduledContributionSection/component/ContributionCard.tsx

import { useMemo } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/components/ui/utils';
import {
  STATUS_CONFIG,
  formatAmount,
  formatDate,
  capitalize,
  getDueLabel,
} from '../utils';

import type {
  ScheduledContribution,
  ScheduledContributionsProps,
} from '@/src/types/dashboard';

interface ContributionCardProps {
  item: ScheduledContribution;
  onContribute: (groupId: number) => void;
  isContributing: boolean;
  onNavigate?: ScheduledContributionsProps['onNavigate'];
}

export function ContributionCard({
  item,
  onContribute,
  isContributing,
  onNavigate,
}: ContributionCardProps) {
  const cfg = STATUS_CONFIG[item.status];
  const StatusIcon = cfg.icon;

  const canContribute =
    !item.already_contributed && item.has_sufficient_balance;
  const needsFunds = !item.already_contributed && !item.has_sufficient_balance;
  const isNavigable = !!(onNavigate && item.group_public_id);

  const dueLabel = useMemo(
    () => getDueLabel(item.days_until_due),
    [item.days_until_due],
  );

  function handleGroupClick() {
    if (isNavigable) {
      onNavigate!('Groups', { group: item.group_public_id! });
    }
  }

  return (
    <div
      className={cn(
        'group flex overflow-hidden rounded-2xl border border-border/60 bg-card',
        'transition-all duration-200 hover:shadow-lg',
        cfg.glowColor,
        item.already_contributed && 'opacity-55',
      )}
    >
      {/* Left status strip */}
      <div
        className={cn(
          'w-0.75 shrink-0',
          cfg.stripColor,
          cfg.pulse && !item.already_contributed && 'animate-pulse',
        )}
      />

      {/* Card body */}
      <div className="flex-1 p-4 min-w-0">
        {/* Top row: group name + status badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <button
              onClick={handleGroupClick}
              className={cn(
                'text-[13px] font-semibold text-foreground text-left leading-snug max-w-full block',
                isNavigable
                  ? 'hover:text-primary transition-colors cursor-pointer'
                  : 'cursor-default',
              )}
            >
              <span className="truncate block">
                {item.group_name}
                {isNavigable && (
                  <ArrowUpRight className="inline h-3 w-3 ml-0.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </span>
            </button>
            <div className="flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[11px] text-muted-foreground">
                {item.total_members} members · Cycle {item.current_cycle}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold shrink-0 ring-1',
              cfg.badgeBg,
              cfg.badgeText,
              cfg.badgeRing,
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                cfg.dotColor,
                cfg.pulse && !item.already_contributed && 'animate-pulse',
              )}
            />
            <StatusIcon className="h-3 w-3" />
            <span className="hidden sm:inline">{cfg.label}</span>
          </div>
        </div>

        {/* Amount + meta row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Amount pill */}
          <div className="flex items-baseline gap-0.5 bg-muted/50 dark:bg-muted/30 rounded-xl px-3 py-1.5 ring-1 ring-border/40">
            <span className="text-[11px] text-muted-foreground">₵</span>
            <span className="text-[15px] font-bold text-foreground tabular-nums leading-none">
              {parseFloat(item.amount).toLocaleString('en-GH', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <span className="w-1 h-1 rounded-full bg-border/80 shrink-0" />

          <span className="text-[11px] font-medium text-muted-foreground">
            {capitalize(item.frequency)}
          </span>

          <span className="w-1 h-1 rounded-full bg-border/80 shrink-0" />

          <span
            className={cn(
              'text-[11px] font-semibold',
              item.status === 'overdue'
                ? 'text-rose-500'
                : item.status === 'due_soon'
                  ? 'text-amber-500'
                  : 'text-muted-foreground',
            )}
          >
            {item.days_until_due !== null
              ? dueLabel
              : formatDate(item.next_due_date)}
          </span>
        </div>

        {/* Insufficient funds notice */}
        {needsFunds && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-200 dark:ring-amber-500/20">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight">
              Balance ({formatAmount(item.wallet_balance)}) too low — top up
              first.
            </span>
          </div>
        )}

        {/* Bottom row: date + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[11px] text-muted-foreground">
              {formatDate(item.next_due_date)}
            </span>
          </div>

          {item.already_contributed ? (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Paid this cycle
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => canContribute && onContribute(item.group_id)}
              disabled={isContributing || needsFunds}
              className={cn(
                'h-8 px-3.5 rounded-xl text-[11px] font-bold gap-1.5 transition-all duration-200',
                canContribute
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                  : 'bg-muted/80 text-muted-foreground cursor-not-allowed shadow-none',
              )}
            >
              {isContributing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Processing
                </>
              ) : needsFunds ? (
                <>
                  <Wallet className="h-3 w-3" />
                  Top Up
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  Contribute
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
