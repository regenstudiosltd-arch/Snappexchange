// src/components/notification/types.ts

import type {
  Notification,
  NotificationType,
} from '@/src/services/notification.service';
import type { LucideIcon } from 'lucide-react';

export type { Notification, NotificationType };

// ─── Tab ──────────────────────────────────────────────────────────────────────

export type TabId = 'all' | 'unread' | 'groups' | 'goals';

export interface TabDefinition {
  id: TabId;
  label: string;
  emoji: string;
}

// ─── Type config ──────────────────────────────────────────────────────────────

export interface NotificationTypeConfig {
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  tab: TabId;
  accentColor: string;
}

// ─── Empty state config ───────────────────────────────────────────────────────

export interface EmptyStateConfig {
  icon: LucideIcon;
  heading: string;
  sub: string;
  color: string;
}

// ─── Panel props ──────────────────────────────────────────────────────────────

export interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onNavigate: (page: string) => void;
  onClose: () => void;
}

// ─── Tab counts ───────────────────────────────────────────────────────────────

export type TabCounts = Record<TabId, number>;
