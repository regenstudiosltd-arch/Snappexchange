'use client';

import {
  ArrowLeft,
  Banknote,
  Calendar,
  Check,
  Loader2,
  Users,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Group } from './types';
import { formatContribution, isGroupFull } from './utils';
import { GROUP_RULES } from './constants';
import { decodeHtmlEntities } from '@/src/lib/html';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-4 text-center">
      <div className="mb-0.5">{icon}</div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

interface GroupDetailViewProps {
  group: Group;
  isAlreadyMember: boolean;
  isJoining: boolean;
  joinReason: string;
  termsAccepted: boolean;
  onJoinReasonChange: (value: string) => void;
  onTermsChange: (checked: boolean) => void;
  onBack: () => void;
  onJoinRequest: () => void;
}

export function GroupDetailView({
  group,
  isAlreadyMember,
  isJoining,
  joinReason,
  termsAccepted,
  onJoinReasonChange,
  onTermsChange,
  onBack,
  onJoinRequest,
}: GroupDetailViewProps) {
  const full = isGroupFull(group);
  const fillPercent = Math.round(
    (group.current_members / group.expected_members) * 100,
  );

  const description = decodeHtmlEntities(
    group.description || 'No description provided.',
  );

  return (
    <div className="space-y-5 py-4">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-600 via-teal-500 to-emerald-500 p-6 shadow-md">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-6 right-12 h-20 w-20 rounded-full bg-white/10" />

        <div className="relative">
          <h3 className="text-xl font-bold text-white">{group.group_name}</h3>
          <p className="mt-0.5 text-sm text-white/80">
            Administered by {group.admin_name}
          </p>

          {/* Member progress */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {group.current_members} of {group.expected_members} members
              </span>
              <span>{fillPercent}% filled</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(fillPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Members"
          value={`${group.current_members} / ${group.expected_members}`}
        />
        <StatCard
          icon={
            <Banknote className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          }
          label="Contribution"
          value={formatContribution(group.contribution_amount)}
        />
        <StatCard
          icon={
            <Calendar className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          }
          label="Frequency"
          value={<span className="capitalize">{group.frequency}</span>}
        />
      </div>

      {/* Description */}
      {group.description && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h4 className="mb-1.5 text-sm font-semibold text-foreground">
            About this group
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      )}

      {/* Rules */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Group Rules
        </h4>
        <ul className="space-y-2">
          {GROUP_RULES.map((rule, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/15 text-center text-[10px] font-bold leading-4 text-primary">
                {i + 1}
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Status section: already member | full | join form */}
      {isAlreadyMember ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
            You&apos;re already a member!
          </h4>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-500">
            You created or joined this savings group. No need to request again.
          </p>
        </div>
      ) : full ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center dark:border-rose-800 dark:bg-rose-950/30">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
            <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h4 className="font-semibold text-rose-700 dark:text-rose-400">
            This group is full
          </h4>
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-500">
            All {group.expected_members} spots have been filled. Check back
            later or browse other groups.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Introduction{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Textarea
              placeholder="Tell the admin why you'd like to join this circle..."
              value={joinReason}
              onChange={(e) => onJoinReasonChange(e.target.value)}
              className="min-h-24 resize-none bg-background"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-primary focus:ring-primary"
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
            />
            <span className="text-sm leading-relaxed text-muted-foreground">
              I have read and agree to abide by the group rules and contribution
              schedule. I understand that financial commitment is essential for
              the circle&apos;s success.
            </span>
          </label>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-3 border-t border-border pt-5">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isAlreadyMember ? (
          <Button
            disabled
            className="flex-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300"
          >
            <Check className="mr-2 h-4 w-4" />
            Already a Member
          </Button>
        ) : full ? (
          <Button disabled className="flex-1 cursor-not-allowed opacity-60">
            Group is Full
          </Button>
        ) : (
          <Button
            className="flex-1"
            disabled={!termsAccepted || isJoining}
            onClick={onJoinRequest}
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Send Join Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
