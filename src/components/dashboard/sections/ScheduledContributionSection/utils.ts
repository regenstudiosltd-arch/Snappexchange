// src/components/dashboard/sections/ScheduledContributionSection/utils.ts

import { CheckCircle2, AlertTriangle, Clock, Flame } from 'lucide-react';

// import type { ContributionStatus, StatusConfig } from './types';
import type { ContributionStatus, StatusConfig } from '@/src/types/dashboard';

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatAmount(amount: string): string {
  return `₵${parseFloat(amount).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getDueLabel(daysUntilDue: number | null): string {
  if (daysUntilDue === null) return 'No start date';
  if (daysUntilDue === 0) return 'Due today';
  if (daysUntilDue === 1) return 'Tomorrow';
  if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)}d overdue`;
  return `${daysUntilDue}d left`;
}

// ─── Status config map ────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<ContributionStatus, StatusConfig> = {
  overdue: {
    label: 'Overdue',
    icon: AlertTriangle,
    stripColor: 'bg-rose-500',
    glowColor: 'hover:shadow-rose-500/15',
    badgeBg: 'bg-rose-50 dark:bg-rose-500/10',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeRing: 'ring-rose-200 dark:ring-rose-500/25',
    dotColor: 'bg-rose-500',
    pulse: true,
  },
  due_soon: {
    label: 'Due Soon',
    icon: Flame,
    stripColor: 'bg-amber-400',
    glowColor: 'hover:shadow-amber-400/15',
    badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
    badgeText: 'text-amber-600 dark:text-amber-400',
    badgeRing: 'ring-amber-200 dark:ring-amber-500/25',
    dotColor: 'bg-amber-400',
    pulse: true,
  },
  upcoming: {
    label: 'Upcoming',
    icon: Clock,
    stripColor: 'bg-blue-400',
    glowColor: 'hover:shadow-blue-400/10',
    badgeBg: 'bg-blue-50 dark:bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    badgeRing: 'ring-blue-200 dark:ring-blue-500/25',
    dotColor: 'bg-blue-400',
  },
  completed: {
    label: 'Contributed',
    icon: CheckCircle2,
    stripColor: 'bg-emerald-400',
    glowColor: 'hover:shadow-emerald-400/10',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    badgeRing: 'ring-emerald-200 dark:ring-emerald-500/25',
    dotColor: 'bg-emerald-400',
  },
};

// ─── Sort order ───────────────────────────────────────────────────────────────

export const STATUS_SORT_ORDER: Record<ContributionStatus, number> = {
  overdue: 0,
  due_soon: 1,
  upcoming: 2,
  completed: 3,
};
