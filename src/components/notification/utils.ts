// src/components/notification/utils.ts

import { TYPE_CONFIG } from './constants';
import type { Notification, NotificationTypeConfig, TabId } from './types';
import type { NotificationType } from '@/src/services/notification.service';

// ─── Config lookup with safe fallback ────────────────────────────────────────

export function getConfig(type: NotificationType): NotificationTypeConfig {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system;
}

// ─── Tab filtering ────────────────────────────────────────────────────────────

export function filterNotifications(
  notifications: Notification[],
  tab: TabId,
): Notification[] {
  if (tab === 'all') return notifications;
  if (tab === 'unread') return notifications.filter((n) => !n.is_read);
  return notifications.filter(
    (n) => getConfig(n.notification_type).tab === tab,
  );
}

// ─── Date grouping ────────────────────────────────────────────────────────────

export interface NotificationGroup {
  label: string;
  items: Notification[];
}

export function groupByDate(
  notifications: Notification[],
): NotificationGroup[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const toDateStr = (d: Date) => d.toDateString();
  const groups = new Map<string, Notification[]>();

  for (const n of notifications) {
    const d = new Date(n.created_at);
    let label: string;

    if (toDateStr(d) === toDateStr(today)) {
      label = 'Today';
    } else if (toDateStr(d) === toDateStr(yesterday)) {
      label = 'Yesterday';
    } else {
      label = d.toLocaleDateString('en-GB', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(n);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

// ─── Tab counts ───────────────────────────────────────────────────────────────

export function computeTabCounts(
  notifications: Notification[],
  unreadCount: number,
  totalCount: number,
) {
  return {
    all: totalCount,
    unread: unreadCount,
    groups: notifications.filter(
      (n) => getConfig(n.notification_type).tab === 'groups',
    ).length,
    goals: notifications.filter(
      (n) => getConfig(n.notification_type).tab === 'goals',
    ).length,
  };
}
