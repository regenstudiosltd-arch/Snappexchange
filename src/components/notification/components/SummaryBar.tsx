// src/components/notification/components/SummaryBar.tsx

import { CheckCheck, Trash2 } from 'lucide-react';

interface SummaryBarProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  hasNotifications: boolean;
}

export function SummaryBar({
  unreadCount,
  onMarkAllAsRead,
  onClearAll,
  hasNotifications,
}: SummaryBarProps) {
  if (!hasNotifications && unreadCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/40">
      <span className="text-xs text-muted-foreground/70">
        {unreadCount > 0 ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            {unreadCount} unread
          </span>
        ) : (
          'All caught up'
        )}
      </span>
      <div className="flex items-center gap-1">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        )}
        {hasNotifications && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
