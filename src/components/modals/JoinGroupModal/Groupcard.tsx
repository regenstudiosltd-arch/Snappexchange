'use client';

import { Users } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Group } from './types';
import { formatContribution, isGroupFull } from './utils';

interface GroupCardProps {
  group: Group;
  isJoined: boolean;
  onClick: () => void;
}

export function GroupCard({ group, isJoined, onClick }: GroupCardProps) {
  const full = isGroupFull(group);
  const fillPercent = Math.round(
    (group.current_members / group.expected_members) * 100,
  );

  return (
    <Card
      onClick={onClick}
      className="group relative flex flex-col cursor-pointer overflow-hidden border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Subtle top accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${
          full
            ? 'bg-rose-400 dark:bg-rose-600'
            : isJoined
              ? 'bg-emerald-400 dark:bg-emerald-600'
              : 'bg-primary/40 group-hover:bg-primary transition-colors duration-200'
        }`}
      />

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-snug text-foreground">
            {group.group_name}
          </CardTitle>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Frequency pill */}
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {group.frequency}
            </span>

            {/* Status badge — only one shows at a time */}
            {isJoined ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] gap-1 px-2">
                Joined
              </Badge>
            ) : full ? (
              <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/50 dark:text-rose-400 text-[10px] px-2">
                Full
              </Badge>
            ) : null}
          </div>
        </div>

        <CardDescription className="text-xs">
          Admin: {group.admin_name}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {group.description ||
            'Join this group to start your savings journey together.'}
        </p>

        {/* Member progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              {group.current_members} / {group.expected_members} members
            </span>
            <span
              className={
                full ? 'text-rose-500 dark:text-rose-400 font-medium' : ''
              }
            >
              {fillPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                full
                  ? 'bg-rose-400 dark:bg-rose-500'
                  : fillPercent >= 80
                    ? 'bg-amber-400 dark:bg-amber-500'
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min(fillPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground text-xs capitalize">
            {group.frequency} contributions
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatContribution(group.contribution_amount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
