import { CreateGroupForm } from './types';

export const CONTRIBUTION_MAX = 50_000;

export const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const TERMS_AND_CONDITIONS = [
  'As a group admin, you are responsible for managing contributions and payouts.',
  'All members must contribute on time according to the agreed schedule.',
  'Payout rotation will be determined fairly and transparently.',
  'An 8% service fee applies to all cash-out transactions.',
  'You agree to maintain accurate records and honest communication.',
  'SnappX reserves the right to suspend groups that violate terms.',
] as const;

export const STEP_META: Record<
  1 | 2 | 3,
  { title: string; description: string }
> = {
  1: {
    title: 'Admin Verification',
    description: 'Verify your identity to create a savings group',
  },
  2: {
    title: 'Group Details',
    description: "Set up your group's contribution rules",
  },
  3: {
    title: 'Review & Create',
    description: 'Review and confirm group creation',
  },
};

export const INITIAL_FORM: CreateGroupForm = {
  adminFullName: '',
  adminAge: '',
  adminEmail: '',
  adminContact: '',
  adminLocation: '',
  adminOccupation: '',
  ghanaCardFront: null,
  ghanaCardBack: null,
  groupName: '',
  contributionAmount: '',
  contributionFrequency: '',
  payoutTimeline: '',
  memberCount: '',
  groupDescription: '',
};
