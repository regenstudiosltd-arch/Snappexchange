export interface GroupData {
  id: string;
  groupName: string;
  contributionAmount: string;
  frequency: string;
  expectedMembers: number;
  description?: string;
  totalSaved: number;
}

export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (groupData: GroupData) => void;
}

/** All form fields across all 3 steps. */
export interface CreateGroupForm {
  // Step 1 — Admin KYC
  adminFullName: string;
  adminAge: string;
  adminEmail: string;
  adminContact: string;
  adminLocation: string;
  adminOccupation: string;
  ghanaCardFront: File | null;
  ghanaCardBack: File | null;

  // Step 2 — Group details
  groupName: string;
  contributionAmount: string;
  contributionFrequency: string;
  payoutTimeline: string;
  memberCount: string;
  groupDescription: string;
}

export type CreateStep = 1 | 2 | 3;

export type FieldErrors = Partial<Record<keyof CreateGroupForm, string>>;
