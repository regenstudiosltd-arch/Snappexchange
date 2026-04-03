// src/components/notification/NotificationPanel.tsx

'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  RefreshCw,
  X,
  ChevronDown,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/src/components/ui/utils';

// ── Local modules ──────────────────────────────────────────────────────────────
import { filterNotifications, groupByDate, computeTabCounts } from './utils';
import type { NotificationPanelProps, TabId } from './types';

// ── Sub-components ─────────────────────────────────────────────────────────────
import { SkeletonItem } from './SkeletonItem';

import { NotificationItem } from './components/NotificationItem';
import { EmptyState } from './components/EmptyState';
import { DateGroupHeader } from './components/DateGroupHeader';
import { ErrorState } from './components/ErrorState';
import { SummaryBar } from './components/SummaryBar';
import { TabBar } from './components/TabBar';

export function NotificationPanel({
  notifications,
  unreadCount,
  totalCount,
  hasMore,
  loading,
  loadingMore,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onLoadMore,
  onRefresh,
  onNavigate,
  onClose,
}: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Derived values ────────────────────────────────────────────────────────────
  const tabCounts = useMemo(
    () => computeTabCounts(notifications, unreadCount, totalCount),
    [notifications, unreadCount, totalCount],
  );

  const filtered = useMemo(
    () => filterNotifications(notifications, activeTab),
    [notifications, activeTab],
  );

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  // ── Infinite scroll ───────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) onLoadMore();
  }, [loadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ── Escape key to close ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/15"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        initial={{
          opacity: 0,
          y: -8,
          scale: 0.97,
          transformOrigin: 'top right',
        }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
        className={cn(
          'fixed top-17 right-4 z-50',
          'w-100 max-w-[calc(100vw-1.5rem)]',
          'flex flex-col overflow-hidden',
          'rounded-2xl',
          'bg-card/95 backdrop-blur-2xl',
          'border border-border/50',
          'shadow-2xl shadow-black/25 dark:shadow-black/60',
          'max-h-[calc(100dvh-84px)]',
          'ring-1 ring-inset ring-white/10 dark:ring-white/5',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="rounded-xl bg-linear-to-br from-primary/20 to-primary/10 p-2">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="header-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                    className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-foreground leading-tight">
                Notifications
              </h2>
              {totalCount > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {totalCount} total
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Refresh */}
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={onRefresh}
              className="rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Refresh notifications"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </motion.button>

            {/* Close */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <TabBar
          activeTab={activeTab}
          tabCounts={tabCounts}
          onTabChange={setActiveTab}
        />

        {/* Summary action bar */}
        <SummaryBar
          unreadCount={unreadCount}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAll={onClearAll}
          hasNotifications={notifications.length > 0}
        />

        {/* Notification list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarWidth: 'thin' }}
        >
          {loading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonItem key={i} index={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState onRefresh={onRefresh} />
          ) : groups.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {groups.map(({ label, items }) => (
                <div key={label}>
                  <DateGroupHeader label={label} />
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                      onNavigate={(page) => {
                        onNavigate(page);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          )}

          {/* Load more button */}
          {!loading && !error && hasMore && (
            <div className="px-4 py-3 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLoadMore}
                disabled={loadingMore}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-medium',
                  'text-muted-foreground bg-muted/50 hover:bg-muted',
                  'transition-all duration-150 disabled:opacity-60',
                  'border border-border/40',
                )}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading more…
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Load more
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Infinite scroll bottom spinner */}
          {loadingMore && hasMore && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-border/30 bg-muted/20">
          <Sparkles className="h-3 w-3 text-primary/50" />
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Real-time notifications · SnappX
          </span>
        </div>
      </motion.div>
    </>
  );
}
