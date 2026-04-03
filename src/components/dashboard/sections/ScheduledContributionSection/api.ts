// src/components/dashboard/sections/ScheduledContributionSection/api.ts

import { apiClient } from '@/src/lib/axios';
// import type { ScheduledContributionsResponse } from './types';
import type { ScheduledContributionsResponse } from '@/src/types/dashboard';

export async function fetchScheduled(): Promise<ScheduledContributionsResponse> {
  const res = await apiClient.get('/accounts/scheduled-contributions/');
  return res.data;
}

export async function contribute(groupId: number): Promise<unknown> {
  const key = crypto.randomUUID();
  const res = await apiClient.post(
    `/accounts/groups/${groupId}/contribute/`,
    {},
    { headers: { 'X-Idempotency-Key': key } },
  );
  return res.data;
}
