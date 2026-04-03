// src/components/dashboard/sections/RecentActivitySection/components/GroupedActivityList.tsx

import { useMemo } from 'react';

import { getDayGroup } from '../utils';
import type { ActivityItem, RecentActivityProps } from '@/src/types/dashboard';
import { DayDivider } from './DayDivider';
import { ActivityRow } from './ActivityRow';

interface GroupedActivityListProps {
  items: ActivityItem[];
  onNavigate?: RecentActivityProps['onNavigate'];
}

export function GroupedActivityList({
  items,
  onNavigate,
}: GroupedActivityListProps) {
  // Group items by calendar day label — preserves insertion order via Map
  const groups = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const item of items) {
      const label = getDayGroup(item.created_at);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="divide-y divide-border/30">
      {groups.map(([day, dayItems]) => (
        <div key={day}>
          <DayDivider label={day} />
          <div className="divide-y divide-border/30">
            {dayItems.map((item) => (
              <ActivityRow key={item.id} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
