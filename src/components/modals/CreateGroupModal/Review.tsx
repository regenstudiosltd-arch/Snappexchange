'use client';

import { CheckCircle2 } from 'lucide-react';
import { CreateGroupForm } from './types';
import { TERMS_AND_CONDITIONS } from './constants';
import { formatContributionSummary } from './utils';

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">
        {value || '—'}
      </span>
    </div>
  );
}

interface Step3Props {
  form: CreateGroupForm;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
}

export function Review({ form, termsAccepted, onTermsChange }: Step3Props) {
  return (
    <div className="space-y-5">
      {/* Group summary card */}
      <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
        {/* Header */}
        <div className="border-b border-border bg-muted/40 px-5 py-3">
          <p className="text-sm font-semibold text-foreground">Group Summary</p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
          <SummaryRow label="Group Name" value={form.groupName} />
          <SummaryRow
            label="Contribution"
            value={formatContributionSummary(
              form.contributionAmount,
              form.contributionFrequency,
            )}
          />
          <SummaryRow label="Payout Timeline" value={form.payoutTimeline} />
          <SummaryRow
            label="Expected Members"
            value={form.memberCount ? `${form.memberCount} members` : ''}
          />
          {form.groupDescription && (
            <div className="col-span-full flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </span>
              <span className="text-sm text-foreground leading-relaxed">
                {form.groupDescription}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KYC confirmation */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Identity documents and live photo captured successfully.
        </p>
      </div>

      {/* Terms */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          Terms &amp; Conditions
        </p>

        <div className="max-h-52 space-y-2.5 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 pr-3">
          {TERMS_AND_CONDITIONS.map((term, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              <p className="leading-relaxed text-muted-foreground">{term}</p>
            </div>
          ))}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-primary focus:ring-primary"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            I agree to the terms and conditions and will manage this group
            responsibly.
          </span>
        </label>
      </div>
    </div>
  );
}
