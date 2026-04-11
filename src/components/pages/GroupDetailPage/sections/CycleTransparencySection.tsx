'use client';

import { Repeat, Trophy, Clock, ArrowRight, History } from 'lucide-react';
import { cn } from '@/src/components/ui/utils';
import { GroupDetail, PayoutRecipientInfo } from '../types';
import { MemberAvatar } from '../components/MemberAvatar';

interface RecipientCardProps {
  label: string;
  labelIcon: React.ElementType;
  recipient: PayoutRecipientInfo & { cycle?: number };
  variant: 'next' | 'previous';
}

function RecipientCard({
  label,
  labelIcon: LabelIcon,
  recipient,
  variant,
}: RecipientCardProps) {
  const isNext = variant === 'next';
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 flex items-center gap-3',
        isNext
          ? 'border-cyan-500/25 bg-cyan-500/5 dark:bg-cyan-500/8'
          : 'border-violet-500/25 bg-violet-500/5 dark:bg-violet-500/8',
      )}
    >
      {/* Top accent */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          isNext
            ? 'bg-linear-to-r from-transparent via-cyan-400/50 to-transparent'
            : 'bg-linear-to-r from-transparent via-violet-400/50 to-transparent',
        )}
      />

      <MemberAvatar
        name={recipient.full_name}
        photoUrl={recipient.profile_picture}
        size="lg"
        gradientVariant={isNext ? 'cyan' : 'violet'}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <LabelIcon
            className={cn(
              'h-3.5 w-3.5',
              isNext
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-violet-600 dark:text-violet-400',
            )}
          />
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wider',
              isNext
                ? 'text-cyan-700 dark:text-cyan-400'
                : 'text-violet-700 dark:text-violet-400',
            )}
          >
            {label}
          </span>
        </div>
        <p className="font-semibold text-sm text-foreground truncate">
          {recipient.full_name}
        </p>
        <p
          className={cn(
            'text-xs mt-0.5',
            isNext
              ? 'text-cyan-600/80 dark:text-cyan-400/80'
              : 'text-violet-600/80 dark:text-violet-400/80',
          )}
        >
          {isNext && recipient.position
            ? `Payout position #${recipient.position}`
            : ''}
          {!isNext && recipient.cycle
            ? `Received in Cycle ${recipient.cycle}`
            : ''}
        </p>
      </div>
    </div>
  );
}

interface EmptyRecipientCardProps {
  message: string;
}
function EmptyRecipientCard({ message }: EmptyRecipientCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 p-4 flex items-center justify-center min-h-20">
      <p className="text-sm text-muted-foreground/60 text-center">{message}</p>
    </div>
  );
}

interface CycleTransparencySectionProps {
  group: GroupDetail;
}

export function CycleTransparencySection({
  group,
}: CycleTransparencySectionProps) {
  const contributed = group.contributed_user_ids?.length ?? 0;
  const progress =
    group.expected_members > 0
      ? Math.min(Math.round((contributed / group.expected_members) * 100), 100)
      : 0;

  const potAmount = parseFloat(group.payout_amount || '0');
  const perContribution = parseFloat(group.contribution_amount || '0');

  const allContributed =
    contributed >= group.expected_members && group.expected_members > 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
            <Repeat className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              Cycle Transparency
            </h2>
            <p className="text-xs text-muted-foreground">
              Live progress, payout order &amp; key dates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
            Cycle #{group.current_cycle_number}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              Contribution progress
            </span>
            <span className="tabular-nums font-semibold text-foreground">
              {contributed}
              <span className="text-muted-foreground font-normal">
                /{group.expected_members}
              </span>
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                allContributed
                  ? 'bg-linear-to-r from-emerald-400 to-teal-500'
                  : 'bg-linear-to-r from-cyan-500 to-teal-500',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span
              className={cn(
                'text-xs font-medium',
                allContributed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
            >
              {allContributed
                ? '✓ All members have contributed!'
                : `${progress}% complete`}
            </span>
            {group.cycle_end_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Ends{' '}
                {new Date(group.cycle_end_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Payout recipients */}
        <div className="grid sm:grid-cols-2 gap-3">
          {group.next_payout_recipient ? (
            <RecipientCard
              label="Next payout recipient"
              labelIcon={Trophy}
              recipient={group.next_payout_recipient}
              variant="next"
            />
          ) : (
            <EmptyRecipientCard message="Payout order not yet assigned. Wait until group is full" />
          )}

          {group.previous_payout_recipient ? (
            <RecipientCard
              label="Previous payout recipient"
              labelIcon={History}
              recipient={group.previous_payout_recipient}
              variant="previous"
            />
          ) : (
            <EmptyRecipientCard
              message={
                group.current_cycle_number === 1
                  ? 'First cycle. No previous payout yet'
                  : 'No previous payout data'
              }
            />
          )}
        </div>

        {/* Pot summary */}
        <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border/40 px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Total payout</p>
            <p className="text-xl font-bold text-foreground tabular-nums">
              GH₵ {potAmount.toLocaleString()}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">
              Per member / cycle
            </p>
            <p className="text-xl font-bold text-foreground tabular-nums">
              GH₵ {perContribution.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
