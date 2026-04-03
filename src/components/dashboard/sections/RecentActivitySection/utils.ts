// src/components/dashboard/sections/RecentActivitySection/utils.ts

import {
  ArrowUpRight,
  ArrowDownRight,
  Target,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

// import type { FilterType, TxConfig, TxType } from './types';
import type { FilterType, TxConfig, TxType } from '@/src/types/dashboard';

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatAmount(
  amount: string,
  direction: 'credit' | 'debit',
): string {
  const num = parseFloat(amount);
  const formatted = num.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${direction === 'credit' ? '+' : '-'}₵${formatted}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDayGroup(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString('en-GH', { weekday: 'long' });
  }
  return date.toLocaleDateString('en-GH', { month: 'long', day: 'numeric' });
}

// ─── Static config maps ───────────────────────────────────────────────────────

export const TX_CONFIG: Record<TxType, TxConfig> = {
  contribution: {
    label: 'Group Contribution',
    shortLabel: 'Contribution',
    icon: ArrowUpRight,
    stripColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconColor: 'text-blue-500',
    amountColor: 'text-foreground',
  },
  goal_contribution: {
    label: 'Goal Deposit',
    shortLabel: 'Goal',
    icon: Target,
    stripColor: 'bg-violet-500',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    iconColor: 'text-violet-500',
    amountColor: 'text-foreground',
  },
  payout: {
    label: 'Payout Received',
    shortLabel: 'Payout',
    icon: ArrowDownRight,
    stripColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-500',
    amountColor: 'text-emerald-600 dark:text-emerald-400',
  },
  deposit: {
    label: 'Wallet Top-up',
    shortLabel: 'Top-up',
    icon: TrendingUp,
    stripColor: 'bg-teal-500',
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/15',
    iconColor: 'text-teal-500',
    amountColor: 'text-emerald-600 dark:text-emerald-400',
  },
  withdrawal: {
    label: 'Withdrawal',
    shortLabel: 'Withdrawal',
    icon: ArrowUpRight,
    stripColor: 'bg-rose-500',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    iconColor: 'text-rose-500',
    amountColor: 'text-foreground',
  },
  refund: {
    label: 'Refund',
    shortLabel: 'Refund',
    icon: RefreshCw,
    stripColor: 'bg-amber-500',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconColor: 'text-amber-500',
    amountColor: 'text-emerald-600 dark:text-emerald-400',
  },
};

export const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Groups', value: 'contribution' },
  { label: 'Goals', value: 'goal_contribution' },
  { label: 'Payouts', value: 'payout' },
  { label: 'Top-ups', value: 'deposit' },
];

export const PAGE_SIZE = 8;
