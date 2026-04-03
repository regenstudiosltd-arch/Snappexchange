// src/services/notification.service.ts

import { apiClient } from '@/src/lib/axios';

// ─── Types

export type NotificationType =
  | 'join_request'
  | 'join_approved'
  | 'join_rejected'
  | 'payout_received'
  | 'contribution_reminder'
  | 'goal_reminder'
  | 'group_activated'
  | 'new_member'
  | 'goal_completed'
  | 'system';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  action_url: string | null;
  related_group: number | null;
  related_group_name: string | null;
  related_group_public_id: string | null;
  related_goal: number | null;
  related_goal_name: string | null;
  metadata: Record<string, unknown>;
  time_ago: string;
}

export interface NotificationListResponse {
  results: Notification[];
  unread_count: number;
  total_count: number;
  has_more: boolean;
}

export type NotificationFilter = 'all' | 'unread' | NotificationType;

// ─── Service ──────────────────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch notifications with optional filtering and pagination.
   */
  getAll: async (params?: {
    type?: string;
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationListResponse> => {
    const response = await apiClient.get('/accounts/notifications/', {
      params,
    });
    return response.data;
  },

  /**
   * Lightweight endpoint — used for badge polling every 30s.
   */
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await apiClient.get(
      '/accounts/notifications/unread-count/',
    );
    return response.data;
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/accounts/notifications/${id}/read/`);
  },

  /**
   * Mark all as read in one request.
   */
  markAllAsRead: async (): Promise<{ marked_count: number }> => {
    const response = await apiClient.post(
      '/accounts/notifications/mark-all-read/',
    );
    return response.data;
  },

  /**
   * Hard delete a single notification.
   */
  deleteOne: async (id: number): Promise<void> => {
    await apiClient.delete(`/accounts/notifications/${id}/delete/`);
  },

  /**
   * Wipe all of the user's notifications.
   */
  clearAll: async (): Promise<{ deleted_count: number }> => {
    const response = await apiClient.delete('/accounts/notifications/clear/');
    return response.data;
  },
};
