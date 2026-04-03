// // src/components/dashboard/types.ts

// export interface JoinedGroup {
//   id: number;
//   group_name: string;
//   current_members: number;
//   next_payout_days: number | null;
//   user_total_contribution: string | number;
//   total_saved: string | number;
//   progress_percentage: number;
//   contribution_amount: string | number;
//   frequency: string;
// }

// export interface DashboardResponse {
//   total_savings: string | number;
//   growth_text: string;
//   joined_groups: JoinedGroup[];
// }

// export interface Goal {
//   id: number;
//   name: string;
//   target_amount: string | number;
//   current_saved: string | number;
//   progress_percentage: number;
// }

// export interface GoalsDashboardResponse {
//   total_saved: string | number;
//   goals: Goal[];
// }

// export interface ScheduledContributionsCache {
//   wallet_balance: string;
//   total_upcoming_amount: string;
//   contributions: Array<{ status: string }>;
// }

// export interface DashboardHomeEnhancedProps {
//   onNavigate: (page: string, params?: Record<string, string>) => void;
// }
