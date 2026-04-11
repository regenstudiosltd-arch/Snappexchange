'use client';

import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/src/components/ui/utils';
import { GroupDetail, GroupMember } from '../types';
import { MemberAvatar } from '../components/MemberAvatar';

interface MemberRowProps {
  member: GroupMember;
  hasContributed: boolean;
  amount: string;
}

function MemberRow({ member, hasContributed, amount }: MemberRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 group">
      <div className="relative shrink-0">
        <MemberAvatar
          name={member.full_name}
          photoUrl={member.profile_picture}
          size="md"
          gradientVariant={hasContributed ? 'cyan' : 'neutral'}
        />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card',
            hasContributed ? 'bg-emerald-500' : 'bg-amber-400',
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {member.full_name}
        </p>
        <p className="text-xs text-muted-foreground/70 leading-tight">
          {member.is_admin
            ? 'Group admin'
            : `Position #${member.payout_position ?? '—'}`}
        </p>
      </div>

      {hasContributed ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
            GH₵ {parseFloat(amount).toLocaleString()}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 hidden sm:inline">
            Pending
          </span>
        </div>
      )}
    </div>
  );
}

interface ContributionTrackerSectionProps {
  group: GroupDetail;
}

export function ContributionTrackerSection({
  group,
}: ContributionTrackerSectionProps) {
  const {
    members,
    contributed_user_ids,
    contribution_amount,
    current_cycle_number,
  } = group;
  const contributed = members.filter((m) =>
    contributed_user_ids?.includes(m.user_id),
  );
  const pending = members.filter(
    (m) => !contributed_user_ids?.includes(m.user_id),
  );
  const pct =
    members.length > 0
      ? Math.round((contributed.length / members.length) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground text-sm">
            Cycle #{current_cycle_number} Contributions
          </h2>
          <p className="text-xs text-muted-foreground">
            {contributed.length}/{members.length} members contributed
          </p>
        </div>
        {/* Mini progress pill */}
        <span
          className={cn(
            'text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full',
            pct === 100
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/30">
        {/* Contributed */}
        {contributed.length > 0 && (
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Contributed ({contributed.length})
              </span>
            </div>
            <div className="divide-y divide-border/20">
              {contributed.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  hasContributed
                  amount={contribution_amount}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Yet to contribute ({pending.length})
              </span>
            </div>
            <div className="divide-y divide-border/20">
              {pending.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  hasContributed={false}
                  amount={contribution_amount}
                />
              ))}
            </div>
          </div>
        )}

        {/* All done */}
        {pending.length === 0 && contributed.length > 0 && (
          <div className="px-5 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Everyone has contributed!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Payout is ready to be disbursed.
            </p>
          </div>
        )}

        {/* Empty group */}
        {members.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">No members yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
