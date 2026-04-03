// src/components/notification/constants.ts

import {
  ArrowDownCircle,
  BellOff,
  CheckCheck,
  CheckCircle,
  Clock,
  Info,
  Rocket,
  Target,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';

import type {
  EmptyStateConfig,
  NotificationTypeConfig,
  TabDefinition,
  TabId,
} from './types';
import type { NotificationType } from '@/src/services/notification.service';

// ─── Notification type → display config ──────────────────────────────────────

export const TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  join_request: {
    icon: UserPlus,
    gradient: 'from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-500',
    tab: 'groups',
    accentColor: 'border-l-violet-400',
  },
  join_approved: {
    icon: CheckCircle,
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-500',
    tab: 'groups',
    accentColor: 'border-l-emerald-400',
  },
  join_rejected: {
    icon: XCircle,
    gradient: 'from-rose-500/20 to-red-500/10',
    iconColor: 'text-rose-500',
    tab: 'groups',
    accentColor: 'border-l-rose-400',
  },
  payout_received: {
    icon: ArrowDownCircle,
    gradient: 'from-emerald-500/20 to-cyan-500/10',
    iconColor: 'text-emerald-500',
    tab: 'groups',
    accentColor: 'border-l-emerald-400',
  },
  contribution_reminder: {
    icon: Clock,
    gradient: 'from-amber-500/20 to-yellow-500/10',
    iconColor: 'text-amber-500',
    tab: 'groups',
    accentColor: 'border-l-amber-400',
  },
  goal_reminder: {
    icon: Clock,
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-500',
    tab: 'goals',
    accentColor: 'border-l-amber-400',
  },
  group_activated: {
    icon: Rocket,
    gradient: 'from-sky-500/20 to-blue-500/10',
    iconColor: 'text-sky-500',
    tab: 'groups',
    accentColor: 'border-l-sky-400',
  },
  new_member: {
    icon: Users,
    gradient: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-500',
    tab: 'groups',
    accentColor: 'border-l-blue-400',
  },
  goal_completed: {
    icon: Target,
    gradient: 'from-emerald-500/20 to-green-500/10',
    iconColor: 'text-emerald-500',
    tab: 'goals',
    accentColor: 'border-l-emerald-400',
  },
  system: {
    icon: Info,
    gradient: 'from-slate-500/15 to-gray-500/5',
    iconColor: 'text-slate-500',
    tab: 'all',
    accentColor: 'border-l-slate-400',
  },
};

// ─── Tab definitions ──────────────────────────────────────────────────────────

export const TABS: TabDefinition[] = [
  { id: 'all', label: 'All', emoji: '📬' },
  { id: 'unread', label: 'Unread', emoji: '🔴' },
  { id: 'groups', label: 'Groups', emoji: '👥' },
  { id: 'goals', label: 'Goals', emoji: '🎯' },
];

// ─── Empty state config per tab ───────────────────────────────────────────────

export const EMPTY_STATES: Record<TabId, EmptyStateConfig> = {
  all: {
    icon: BellOff,
    heading: "You're all caught up!",
    sub: 'New notifications will appear here as your groups and goals become active.',
    color: 'text-muted-foreground/50',
  },
  unread: {
    icon: CheckCheck,
    heading: 'Nothing unread!',
    sub: "You've read everything. Stay on top of your finances!",
    color: 'text-emerald-500/60',
  },
  groups: {
    icon: Users,
    heading: 'No group alerts',
    sub: 'Join a savings group to start receiving updates about contributions and payouts.',
    color: 'text-blue-500/60',
  },
  goals: {
    icon: Target,
    heading: 'No goal reminders',
    sub: "Create a savings goal and we'll remind you when contributions are due.",
    color: 'text-amber-500/60',
  },
};
