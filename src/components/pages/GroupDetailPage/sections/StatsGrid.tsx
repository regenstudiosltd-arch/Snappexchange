'use client';

import { useMemo, useState } from 'react';
import { Wallet, TrendingUp, Clock, Zap } from 'lucide-react';
import { cn } from '@/src/components/ui/utils';
import { GroupDetail } from '../types';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconClass: string;
  iconBg: string;
  accent?: string;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  iconBg,
  accent,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        accent,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>

        <div
          className={cn(
            'h-8 w-8 rounded-xl flex items-center justify-center',
            iconBg,
          )}
        >
          <Icon className={cn('h-4 w-4', iconClass)} />
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight text-foreground leading-none mb-1.5">
        {value}
      </p>

      <p className="text-xs text-muted-foreground truncate">{sub}</p>
    </div>
  );
}

interface StatsGridProps {
  group: GroupDetail;
}

export function StatsGrid({ group }: StatsGridProps) {
  // Initialize current time once
  const [now] = useState(() => Date.now());

  const potTarget = parseFloat(group.payout_amount || '0');
  const totalSaved = parseFloat(group.total_group_savings || '0');
  const myContrib = parseFloat(group.total_savings || '0');
  const contributed = group.contributed_user_ids?.length ?? 0;

  const cycleProgress =
    potTarget > 0
      ? Math.min(Math.round((totalSaved / potTarget) * 100), 100)
      : 0;

  const daysUntil = useMemo(() => {
    if (!group.cycle_end_date) return null;

    return Math.max(
      0,
      Math.ceil((new Date(group.cycle_end_date).getTime() - now) / 86_400_000),
    );
  }, [group.cycle_end_date, now]);

  const daysLabel =
    daysUntil !== null
      ? daysUntil === 0
        ? 'Today'
        : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
      : '—';

  const dateLabel = group.cycle_end_date
    ? new Date(group.cycle_end_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date not set';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Cycle Pot"
        value={`GH₵ ${totalSaved.toLocaleString()}`}
        sub={`of GH₵ ${potTarget.toLocaleString()} target`}
        icon={Wallet}
        iconBg="bg-cyan-500/10"
        iconClass="text-cyan-600 dark:text-cyan-400"
      />

      <StatCard
        label="Your Share"
        value={`GH₵ ${myContrib.toLocaleString()}`}
        sub="Your total in this group"
        icon={TrendingUp}
        iconBg="bg-violet-500/10"
        iconClass="text-violet-600 dark:text-violet-400"
      />

      <StatCard
        label="Cycle Progress"
        value={`${cycleProgress}%`}
        sub={`${contributed}/${group.expected_members} members contributed`}
        icon={Zap}
        iconBg="bg-emerald-500/10"
        iconClass="text-emerald-600 dark:text-emerald-400"
      />

      <StatCard
        label="Next Payout"
        value={daysLabel}
        sub={dateLabel}
        icon={Clock}
        iconBg="bg-amber-500/10"
        iconClass="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
