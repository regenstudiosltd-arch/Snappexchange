// src/components/dashboard/sections/ScheduledContributionSection/component/SummaryHeader.tsx

import { CheckCircle2, AlertCircle } from 'lucide-react';

import { cn } from '@/src/components/ui/utils';
import { formatAmount } from '../utils';
import type { ScheduledContribution } from '@/src/types/dashboard';

interface SummaryHeaderProps {
  contributions: ScheduledContribution[];
  totalUpcoming: string;
  walletBalance: string;
}

export function SummaryHeader({
  contributions,
  totalUpcoming,
  walletBalance,
}: SummaryHeaderProps) {
  const completed = contributions.filter((c) => c.already_contributed).length;
  const total = contributions.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const upcoming = parseFloat(totalUpcoming);
  const balance = parseFloat(walletBalance);
  const isCovered = balance >= upcoming;

  return (
    <div className="space-y-3">
      {/* Two stat tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Remaining tile */}
        <div className="rounded-2xl bg-muted/50 dark:bg-muted/30 p-4 ring-1 ring-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Remaining
          </p>
          <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums leading-none">
            {formatAmount(totalUpcoming)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {completed}/{total} cycles done
          </p>
        </div>

        {/* Wallet tile */}
        <div
          className={cn(
            'rounded-2xl p-4 ring-1 relative overflow-hidden',
            isCovered
              ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200/80 dark:ring-emerald-500/20'
              : 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200/80 dark:ring-amber-500/20',
          )}
        >
          {/* Decorative glow circle */}
          <div
            className={cn(
              'absolute -top-5 -right-5 w-20 h-20 rounded-full blur-xl opacity-30',
              isCovered ? 'bg-emerald-400' : 'bg-amber-400',
            )}
          />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 relative">
            Wallet
          </p>
          <p
            className={cn(
              'text-2xl font-bold tracking-tight tabular-nums leading-none relative',
              isCovered
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-amber-700 dark:text-amber-300',
            )}
          >
            {formatAmount(walletBalance)}
          </p>
          <span
            className={cn(
              'relative inline-flex items-center gap-1 text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full',
              isCovered
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
            )}
          >
            {isCovered ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <AlertCircle className="h-2.5 w-2.5" />
            )}
            {isCovered ? 'Covered' : 'Top up needed'}
          </span>
        </div>
      </div>

      {/* Cycle progress bar */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Cycle progress
            </span>
            <span className="text-[11px] font-bold text-foreground tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-primary/60 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
