// src/components/settings/Payoutsection.tsx

'use client';

import { CreditCard, Wallet } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  PayoutFormState,
  MomoProvider,
  MOMO_PROVIDERS,
  SaveButton,
  SectionShell,
  SectionHeader,
  SectionBody,
  SectionFooter,
} from './Shared';

interface PayoutSectionProps {
  payoutSettings: PayoutFormState;
  onPayoutChange: (updated: PayoutFormState) => void;
  onSave: () => void;
  isPending: boolean;
}

const PROVIDER_COLORS: Record<MomoProvider, string> = {
  mtn: 'text-yellow-600 dark:text-yellow-400',
  telecel: 'text-red-600 dark:text-red-400',
  airteltigo: 'text-blue-600 dark:text-blue-400',
};

const PROVIDER_BG: Record<MomoProvider, string> = {
  mtn: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/40',
  telecel: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/40',
  airteltigo:
    'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40',
};

export function PayoutSection({
  payoutSettings,
  onPayoutChange,
  onSave,
  isPending,
}: PayoutSectionProps) {
  const set = (patch: Partial<PayoutFormState>) =>
    onPayoutChange({ ...payoutSettings, ...patch });

  const provider = payoutSettings.provider;

  return (
    <SectionShell id="payout">
      <SectionHeader
        icon={<CreditCard className="h-4 w-4" />}
        title="Payout Account"
        description="Your linked mobile money account for payouts"
      />

      <SectionBody>
        {/* Active provider badge */}
        {payoutSettings.accountName && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${PROVIDER_BG[provider]}`}
          >
            <Wallet
              className={`h-4 w-4 shrink-0 ${PROVIDER_COLORS[provider]}`}
            />
            <span className={PROVIDER_COLORS[provider]}>
              {MOMO_PROVIDERS.find((p) => p.value === provider)?.label} ·{' '}
              {payoutSettings.accountNumber}
            </span>
          </div>
        )}

        {/* Provider select */}
        <div className="space-y-1.5">
          <Label
            htmlFor="payoutProvider"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Network Provider
          </Label>
          <Select
            value={payoutSettings.provider}
            onValueChange={(v) => set({ provider: v as MomoProvider })}
          >
            <SelectTrigger
              id="payoutProvider"
              className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60 shadow-lg">
              {MOMO_PROVIDERS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-sm">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account number + name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="accountNumber"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Account Number
            </Label>
            <Input
              id="accountNumber"
              type="tel"
              className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              value={payoutSettings.accountNumber}
              onChange={(e) => set({ accountNumber: e.target.value })}
              placeholder="0XX XXX XXXX"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="accountName"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Account Name
            </Label>
            <Input
              id="accountName"
              className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              value={payoutSettings.accountName}
              onChange={(e) => set({ accountName: e.target.value })}
              placeholder="Name on account"
            />
          </div>
        </div>
      </SectionBody>

      <SectionFooter>
        <SaveButton
          onClick={onSave}
          isPending={isPending}
          idleLabel="Update Payout Account"
          pendingLabel="Saving…"
        />
      </SectionFooter>
    </SectionShell>
  );
}
