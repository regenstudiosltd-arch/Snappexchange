import { AxiosError } from 'axios';
import { Group } from './types';

export const isGroupFull = (group: Group): boolean =>
  group.current_members >= group.expected_members;

export const formatContribution = (amount: string): string =>
  `₵${parseFloat(amount).toLocaleString()}`;

/**
 * Extracts a user-friendly error message from a failed join request.
 * Handles known API error shapes and falls back gracefully.
 */
export const extractJoinErrorMessage = (
  err: AxiosError<{ error?: string; detail?: string; message?: string }>,
): string => {
  const status = err.response?.status;
  const data = err.response?.data;
  const serverMsg = data?.error || data?.detail || data?.message || '';

  // Map known conditions to clear copy
  if (status === 400) {
    const lower = serverMsg.toLowerCase();
    if (lower.includes('full') || lower.includes('maximum')) {
      return 'This group has reached its maximum capacity and is no longer accepting new members.';
    }
    if (lower.includes('already') || lower.includes('member')) {
      return 'You are already a member of this group.';
    }
    if (lower.includes('pending') || lower.includes('request')) {
      return 'You already have a pending join request for this group.';
    }
  }

  if (status === 403) {
    return 'You do not have permission to join this group.';
  }

  if (status === 404) {
    return 'This group no longer exists.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  return serverMsg || 'Failed to send join request. Please try again.';
};

/**
 * Filters groups client-side based on a search query.
 * Matches against group name, admin name, and description.
 */
export const filterGroups = (groups: Group[], query: string): Group[] => {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter(
    ({ group_name, admin_name, description, frequency }) =>
      group_name.toLowerCase().includes(q) ||
      admin_name.toLowerCase().includes(q) ||
      description?.toLowerCase().includes(q) ||
      frequency.toLowerCase().includes(q),
  );
};
