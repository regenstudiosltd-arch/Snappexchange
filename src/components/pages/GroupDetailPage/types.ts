export interface GroupMember {
  id: number;
  user_id: number;
  full_name: string;
  profile_picture: string | null;
  joined_at: string;
  is_admin: boolean;
  has_contributed_this_cycle: boolean;
  payout_position: number | null;
}

export interface PayoutRecipientInfo {
  user_id: number;
  full_name: string;
  profile_picture: string | null;
  position?: number;
  cycle?: number;
}

export interface GroupDetail {
  id: number;
  public_id: string;
  group_name: string;
  description: string;
  contribution_amount: string;
  frequency: string;
  payout_timeline_days: number;
  payout_interval_days: number;
  expected_members: number;
  current_members: number;
  total_group_savings: string;
  total_savings: string;
  next_due: string | null;
  status: 'active' | 'pending' | 'completed' | 'suspended' | 'rejected';
  status_display: string;
  created_at: string;
  admin_name: string;
  admin_photo?: string | null;
  is_current_user_admin: boolean;
  // Transparency fields
  members: GroupMember[];
  current_cycle_number: number;
  cycle_end_date: string | null;
  next_payout_recipient: PayoutRecipientInfo | null;
  previous_payout_recipient: (PayoutRecipientInfo & { cycle: number }) | null;
  contributed_user_ids: number[];
  payout_amount: string;
  has_current_user_contributed: boolean;
}

export type GroupStatus = GroupDetail['status'];
