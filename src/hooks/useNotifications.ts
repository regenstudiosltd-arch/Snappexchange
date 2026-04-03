// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  notificationService,
} from '@/src/services/notification.service';
import { getResponseStatus } from '@/src/lib/axios-error';

const POLL_INTERVAL_MS = 30_000;
const PAGE_SIZE = 20;

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(
  enabled: boolean = true,
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offsetRef = useRef(0);
  const mountedRef = useRef(true);
  const unreadCountRef = useRef(0);

  // Keep the ref in sync with state
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // ─── Fetch first page
  const fetchNotifications = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll({
        limit: PAGE_SIZE,
        offset: 0,
      });
      if (!mountedRef.current) return;
      setNotifications(data.results);
      setUnreadCount(data.unread_count);
      unreadCountRef.current = data.unread_count;
      setTotalCount(data.total_count);
      setHasMore(data.has_more);
      offsetRef.current = data.results.length;
    } catch (err) {
      if (!mountedRef.current) return;
      const status = getResponseStatus(err);
      if (status !== 401 && status !== 403) {
        setError('Could not load notifications.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // ─── Load more ───────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await notificationService.getAll({
        limit: PAGE_SIZE,
        offset: offsetRef.current,
      });
      if (!mountedRef.current) return;
      setNotifications((prev) => [...prev, ...data.results]);
      setHasMore(data.has_more);
      setTotalCount(data.total_count);
      offsetRef.current += data.results.length;
    } catch {
      // silent — user can retry
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  const pollUnreadCount = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const { unread_count } = await notificationService.getUnreadCount();
      if (!mountedRef.current) return;
      // FIX: Read from ref (not state) to avoid stale closure
      if (unread_count > unreadCountRef.current) {
        // New notifications arrived — refresh full list
        fetchNotifications();
      } else {
        // Just update the badge count
        setUnreadCount(unread_count);
        unreadCountRef.current = unread_count;
      }
    } catch {
      // ignore — badge staleness is acceptable
    }
  }, [fetchNotifications]); // fetchNotifications is now stable, so this is too

  // ─── Mark one as read ─────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target || target.is_read) return prev;
      return prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    });

    // Optimistically decrement only if the notification was unread
    setUnreadCount((prev) => {
      // We check the notifications state via a separate read
      return Math.max(0, prev - 1);
    });

    try {
      await notificationService.markAsRead(id);
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // ─── Mark all as read ──────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    // Capture snapshot for rollback
    let snapshotNotifications: Notification[] = [];
    let snapshotUnread = 0;

    setNotifications((prev) => {
      snapshotNotifications = prev;
      return prev.map((n) => ({ ...n, is_read: true }));
    });
    setUnreadCount((prev) => {
      snapshotUnread = prev;
      return 0;
    });
    unreadCountRef.current = 0;

    try {
      await notificationService.markAllAsRead();
    } catch {
      setNotifications(snapshotNotifications);
      setUnreadCount(snapshotUnread);
      unreadCountRef.current = snapshotUnread;
    }
  }, []);

  // ─── Delete one ───────────────────────────────────────────────────────────
  const deleteOne = useCallback(async (id: number) => {
    let snapshotNotifications: Notification[] = [];
    let wasUnread = false;

    setNotifications((prev) => {
      snapshotNotifications = prev;
      const target = prev.find((n) => n.id === id);
      wasUnread = !!target && !target.is_read;
      return prev.filter((n) => n.id !== id);
    });
    setTotalCount((prev) => prev - 1);
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      unreadCountRef.current = Math.max(0, unreadCountRef.current - 1);
    }

    try {
      await notificationService.deleteOne(id);
    } catch {
      setNotifications(snapshotNotifications);
      setTotalCount((prev) => prev + 1);
      if (wasUnread) {
        setUnreadCount((prev) => prev + 1);
        unreadCountRef.current++;
      }
    }
  }, []);

  // ─── Clear all ────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    let snapshotNotifications: Notification[] = [];
    let snapshotUnread = 0;
    let snapshotTotal = 0;

    setNotifications((prev) => {
      snapshotNotifications = prev;
      return [];
    });
    setUnreadCount((prev) => {
      snapshotUnread = prev;
      return 0;
    });
    setTotalCount((prev) => {
      snapshotTotal = prev;
      return 0;
    });
    setHasMore(false);
    unreadCountRef.current = 0;

    try {
      await notificationService.clearAll();
    } catch {
      setNotifications(snapshotNotifications);
      setUnreadCount(snapshotUnread);
      setTotalCount(snapshotTotal);
      unreadCountRef.current = snapshotUnread;
    }
  }, []);

  // ─── Mount + poll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    mountedRef.current = true;
    fetchNotifications();
    pollRef.current = setInterval(pollUnreadCount, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled, fetchNotifications, pollUnreadCount]); // both stable now — no infinite loop

  return {
    notifications,
    unreadCount,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    error,
    markAsRead,
    markAllAsRead,
    deleteOne,
    clearAll,
    loadMore,
    refresh: fetchNotifications,
  };
}

// // src/hooks/useNotifications.ts

// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Notification,
//   NotificationListResponse,
//   notificationService,
// } from '@/src/services/notification.service';

// const POLL_INTERVAL_MS = 30_000; // 30 s — unread count only
// const PAGE_SIZE = 20;

// interface UseNotificationsReturn {
//   notifications: Notification[];
//   unreadCount: number;
//   totalCount: number;
//   hasMore: boolean;
//   loading: boolean;
//   loadingMore: boolean;
//   error: string | null;
//   markAsRead: (id: number) => Promise<void>;
//   markAllAsRead: () => Promise<void>;
//   deleteOne: (id: number) => Promise<void>;
//   clearAll: () => Promise<void>;
//   loadMore: () => Promise<void>;
//   refresh: () => Promise<void>;
// }

// export function useNotifications(): UseNotificationsReturn {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [hasMore, setHasMore] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const offsetRef = useRef(0);

//   // ─── Fetch first page ──────────────────────────────────────────────────────
//   const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data: NotificationListResponse = await notificationService.getAll({
//         limit: PAGE_SIZE,
//         offset: 0,
//       });
//       setNotifications(data.results);
//       setUnreadCount(data.unread_count);
//       setTotalCount(data.total_count);
//       setHasMore(data.has_more);
//       offsetRef.current = data.results.length;
//     } catch {
//       setError('Could not load notifications.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // ─── Load more (infinite scroll) ───────────────────────────────────────────
//   const loadMore = useCallback(async () => {
//     if (loadingMore || !hasMore) return;
//     setLoadingMore(true);
//     try {
//       const data = await notificationService.getAll({
//         limit: PAGE_SIZE,
//         offset: offsetRef.current,
//       });
//       setNotifications((prev) => [...prev, ...data.results]);
//       setHasMore(data.has_more);
//       setTotalCount(data.total_count);
//       offsetRef.current += data.results.length;
//     } catch {
//       // silent — user can retry
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [loadingMore, hasMore]);

//   // ─── Background badge poll ─────────────────────────────────────────────────
//   const pollUnreadCount = useCallback(async () => {
//     try {
//       const { unread_count } = await notificationService.getUnreadCount();
//       setUnreadCount((prev) => {
//         // If count has gone up, also refresh the list so new items appear
//         if (unread_count > prev) {
//           fetchNotifications();
//         }
//         return unread_count;
//       });
//     } catch {
//       // ignore — badge staleness is acceptable
//     }
//   }, [fetchNotifications]);

//   // ─── Mark one as read ──────────────────────────────────────────────────────
//   const markAsRead = useCallback(
//     async (id: number) => {
//       const target = notifications.find((n) => n.id === id);
//       if (!target || target.is_read) return;

//       // Optimistic
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));

//       try {
//         await notificationService.markAsRead(id);
//       } catch {
//         // Revert
//         setNotifications((prev) =>
//           prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
//         );
//         setUnreadCount((prev) => prev + 1);
//       }
//     },
//     [notifications],
//   );

//   // ─── Mark all as read ──────────────────────────────────────────────────────
//   const markAllAsRead = useCallback(async () => {
//     const snapshot = notifications;
//     const prevUnread = unreadCount;

//     setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//     setUnreadCount(0);

//     try {
//       await notificationService.markAllAsRead();
//     } catch {
//       setNotifications(snapshot);
//       setUnreadCount(prevUnread);
//     }
//   }, [notifications, unreadCount]);

//   // ─── Delete one ────────────────────────────────────────────────────────────
//   const deleteOne = useCallback(
//     async (id: number) => {
//       const target = notifications.find((n) => n.id === id);
//       const snapshot = notifications;

//       setNotifications((prev) => prev.filter((n) => n.id !== id));
//       setTotalCount((prev) => prev - 1);
//       if (target && !target.is_read) {
//         setUnreadCount((prev) => Math.max(0, prev - 1));
//       }

//       try {
//         await notificationService.deleteOne(id);
//       } catch {
//         setNotifications(snapshot);
//         setTotalCount((prev) => prev + 1);
//         if (target && !target.is_read) setUnreadCount((prev) => prev + 1);
//       }
//     },
//     [notifications],
//   );

//   // ─── Clear all ─────────────────────────────────────────────────────────────
//   const clearAll = useCallback(async () => {
//     const snapshot = notifications;
//     const prevUnread = unreadCount;
//     const prevTotal = totalCount;

//     setNotifications([]);
//     setUnreadCount(0);
//     setTotalCount(0);
//     setHasMore(false);

//     try {
//       await notificationService.clearAll();
//     } catch {
//       setNotifications(snapshot);
//       setUnreadCount(prevUnread);
//       setTotalCount(prevTotal);
//     }
//   }, [notifications, unreadCount, totalCount]);

//   // ─── Mount + poll ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     fetchNotifications();
//     pollRef.current = setInterval(pollUnreadCount, POLL_INTERVAL_MS);
//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//   }, [fetchNotifications, pollUnreadCount]);

//   return {
//     notifications,
//     unreadCount,
//     totalCount,
//     hasMore,
//     loading,
//     loadingMore,
//     error,
//     markAsRead,
//     markAllAsRead,
//     deleteOne,
//     clearAll,
//     loadMore,
//     refresh: fetchNotifications,
//   };
// }
