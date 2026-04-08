// src/types/dashboard.ts

import { type LucideIcon } from 'lucide-react';

export interface JoinedGroup {
  id: number;
  group_name: string;
  current_members: number;
  next_payout_days: number | null;
  user_total_contribution: string | number;
  total_saved: string | number;
  progress_percentage: number;
  contribution_amount: string | number;
  frequency: string;
}

export interface DashboardResponse {
  total_savings: string | number;
  growth_text: string;
  joined_groups: JoinedGroup[];
}

export interface Goal {
  id: number;
  name: string;
  target_amount: string | number;
  current_saved: string | number;
  progress_percentage: number;
}

export interface GoalsDashboardResponse {
  total_saved: string | number;
  goals: Goal[];
}

export interface ScheduledContributionsCache {
  wallet_balance: string;
  total_upcoming_amount: string;
  contributions: Array<{ status: string }>;
}

export interface DashboardHomeEnhancedProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onRefresh?: () => void;
}

export type ContributionStatus =
  | 'completed'
  | 'due_soon'
  | 'overdue'
  | 'upcoming';

export interface ScheduledContribution {
  group_id: number;
  group_name: string;
  group_public_id: string | null;
  amount: string;
  frequency: string;
  current_cycle: number;
  next_due_date: string | null;
  days_until_due: number | null;
  already_contributed: boolean;
  status: ContributionStatus;
  has_sufficient_balance: boolean;
  wallet_balance: string;
  total_members: number;
  contribution_amount: string;
}

export interface ScheduledContributionsResponse {
  contributions: ScheduledContribution[];
  total_upcoming_amount: string;
  wallet_balance: string;
}

export interface ScheduledContributionsProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  stripColor: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  badgeRing: string;
  dotColor: string;
  pulse?: boolean;
}

export type TxType =
  | 'contribution'
  | 'goal_contribution'
  | 'payout'
  | 'deposit'
  | 'withdrawal'
  | 'refund';

export type FilterType = 'all' | TxType;

export interface ActivityItem {
  id: string;
  type: TxType;
  direction: 'credit' | 'debit';
  amount: string;
  description: string;
  reference: string;
  created_at: string;
  related_group_id: number | null;
  related_group_name: string | null;
  related_group_public_id: string | null;
  related_goal_id: number | null;
  related_goal_name: string | null;
}

export interface ActivityResponse {
  results: ActivityItem[];
  total: number;
  has_more: boolean;
}

export interface RecentActivityProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export interface TxConfig {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  stripColor: string;
  iconBg: string;
  iconColor: string;
  amountColor: string;
}
