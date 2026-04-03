'use client';

import { Banknote, Users } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { cn } from '@/src/components/ui/utils';
import { CreateGroupForm, FieldErrors } from './types';
import { CONTRIBUTION_MAX, FREQUENCIES } from './constants';

interface Step2Props {
  form: CreateGroupForm;
  fieldErrors: FieldErrors;
  onFieldChange: (
    field: keyof CreateGroupForm,
    value: string | File | null,
  ) => void;
  onFieldError: (field: keyof CreateGroupForm, error: string) => void;
}

export function GroupDetails({
  form,
  fieldErrors,
  onFieldChange,
  onFieldError,
}: Step2Props) {
  return (
    <div className="space-y-5">
      {/* Group Name */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          Group Name *
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={form.groupName}
            onChange={(e) => onFieldChange('groupName', e.target.value)}
            placeholder="e.g. Family Savings Circle"
            className="bg-background pl-10"
          />
        </div>
      </div>

      {/* Contribution + Frequency */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Contribution Amount (₵) *
          </Label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              value={form.contributionAmount}
              onChange={(e) => {
                onFieldChange('contributionAmount', e.target.value);
                // Inline validation on change
                const amount = parseFloat(e.target.value);
                if (e.target.value && (isNaN(amount) || amount <= 0)) {
                  onFieldError(
                    'contributionAmount',
                    'Amount must be greater than 0.',
                  );
                } else if (amount > CONTRIBUTION_MAX) {
                  onFieldError(
                    'contributionAmount',
                    `Amount cannot exceed ₵${CONTRIBUTION_MAX.toLocaleString()}.`,
                  );
                } else {
                  onFieldError('contributionAmount', '');
                }
              }}
              placeholder="e.g. 100"
              className={cn(
                'bg-background pl-10',
                fieldErrors.contributionAmount &&
                  'border-destructive focus-visible:ring-destructive',
              )}
            />
          </div>
          {fieldErrors.contributionAmount ? (
            <p className="text-xs text-destructive">
              {fieldErrors.contributionAmount}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Max: ₵{CONTRIBUTION_MAX.toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Frequency *
          </Label>
          <Select
            value={form.contributionFrequency}
            onValueChange={(v) => onFieldChange('contributionFrequency', v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payout + Members */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Payout Timeline *
          </Label>
          <Input
            value={form.payoutTimeline}
            onChange={(e) => onFieldChange('payoutTimeline', e.target.value)}
            placeholder="e.g. 30 days"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            How often should payouts rotate?
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Expected Members *
          </Label>
          <Input
            type="number"
            min={2}
            value={form.memberCount}
            onChange={(e) => onFieldChange('memberCount', e.target.value)}
            placeholder="e.g. 10"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">Minimum 2 members</p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          Group Description{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          value={form.groupDescription}
          onChange={(e) => onFieldChange('groupDescription', e.target.value)}
          placeholder="Describe the purpose and rules of your savings group..."
          className="min-h-22 resize-none bg-background"
        />
      </div>
    </div>
  );
}
