export interface Group {
  id: number;
  group_name: string;
  admin_name: string;
  current_members: number;
  expected_members: number;
  contribution_amount: string;
  frequency: string;
  description: string;
}

export interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type JoinStep = 'list' | 'detail';
