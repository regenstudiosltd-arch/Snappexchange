'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Users,
  Crown,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/components/ui/utils';
import { GroupDetail } from '../types';
import { MemberAvatar } from '../components/MemberAvatar';

type GroupStatus = GroupDetail['status'];

type StatusConfig = {
  label: string;
  dot: string;
  pill: string;
};

const STATUS_CONFIG: { [K in GroupStatus]: StatusConfig } = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/30',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/30',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-sky-500',
    pill: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 ring-sky-500/30',
  },
  suspended: {
    label: 'Suspended',
    dot: 'bg-red-500',
    pill: 'bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/30',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-500',
    pill: 'bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/30',
  },
};

interface HeroSectionProps {
  group: GroupDetail;
  onInviteClick: () => void;
}

export function HeroSection({ group, onInviteClick }: HeroSectionProps) {
  const router = useRouter();
  const statusCfg = STATUS_CONFIG[group.status] ?? STATUS_CONFIG.pending;
  const isFull = group.current_members >= group.expected_members;
  const memberPct = Math.round(
    (group.current_members / Math.max(group.expected_members, 1)) * 100,
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/70 to-transparent" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-5 py-5 md:px-8 md:py-7 space-y-5">
        {/* Nav row */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {!isFull && (
              <Button
                variant="outline"
                size="sm"
                onClick={onInviteClick}
                className="gap-2 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs font-medium">
                  Invite
                </span>
              </Button>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1',
                statusCfg.pill,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Identity row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Users className="h-7 w-7 md:h-8 md:w-8 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-2">
              {group.group_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MemberAvatar
                  name={group.admin_name}
                  photoUrl={group.admin_photo}
                  size="sm"
                  gradientVariant="cyan"
                />
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="font-medium text-foreground text-sm">
                  {group.admin_name}
                </span>
              </div>

              <span className="text-border hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="capitalize">
                  {group.frequency} contributions
                </span>
              </div>

              <span className="text-border hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5">
                <span>GH₵</span>
                <span className="font-semibold text-foreground">
                  {parseFloat(group.contribution_amount).toLocaleString()}
                </span>
                <span>/ cycle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Member fill bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Members
            </span>
            <span className="text-foreground font-semibold tabular-nums">
              {group.current_members}
              <span className="text-muted-foreground font-normal">
                {' '}
                / {group.expected_members}
              </span>
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-700"
              style={{ width: `${memberPct}%` }}
            />
          </div>
          {isFull && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Group is full — payout cycles active
            </p>
          )}
          {!isFull && group.status === 'pending' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
              {group.expected_members - group.current_members} spot
              {group.expected_members - group.current_members !== 1
                ? 's'
                : ''}{' '}
              remaining
              <ChevronRight className="h-3 w-3" />
              invite members to activate
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
