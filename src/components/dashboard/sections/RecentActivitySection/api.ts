// src/components/dashboard/sections/RecentActivitySection/api.tsx

import { apiClient } from '@/src/lib/axios';
// import type { ActivityResponse, FilterType } from './types';
import type { ActivityResponse, FilterType } from '@/src/types/dashboard';
import { PAGE_SIZE } from './utils';

export async function fetchActivity(
  filter: FilterType,
  offset: number,
  limit: number = PAGE_SIZE,
): Promise<ActivityResponse> {
  const params: Record<string, string | number> = { limit, offset };
  if (filter !== 'all') params.type = filter;
  const res = await apiClient.get('/accounts/activity/', { params });
  return res.data;
}
