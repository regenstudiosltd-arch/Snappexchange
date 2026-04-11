'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Wallet,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
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
import { authService } from '@/src/services/auth.service';
import {
  MomoOtpRequiredResponse,
  ProfileUpdatePayload,
  UserProfile,
} from '@/src/lib/schemas';
import { cn } from '../ui/utils';

//  Types

type OtpState =
  | { phase: 'idle' }
  | {
      phase: 'otp_pending';
      pendingPayload: ProfileUpdatePayload;
      maskedPhone: string;
      otpPhone: string;
      resendTimer: number;
      otpDigits: string[];
      error: string | null;
    }
  | { phase: 'locked'; message: string };

// Helpers

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

function extractError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { status?: number; data?: { error?: string; detail?: string } };
    message?: string;
  };
  if (e?.response?.status === 429) {
    return (
      e.response.data?.error ?? 'Too many failed attempts. Please wait 1 hour.'
    );
  }
  return e?.response?.data?.error ?? e?.message ?? fallback;
}

function isLockout(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 429;
}

// OTP digit input

function OtpInput({
  digits,
  onChange,
  disabled,
}: {
  digits: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    onChange(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={cn(
            'w-full h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-200',
            'bg-background/60 text-foreground focus:outline-none',
            digit
              ? 'border-cyan-400/80 dark:border-cyan-500/50 shadow-[0_0_0_3px_rgba(6,182,212,0.12)]'
              : 'border-border/70 hover:border-border focus:border-cyan-400/80 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)]',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
      ))}
    </div>
  );
}

// Main component

interface PayoutSectionProps {
  payoutSettings: PayoutFormState;
  onPayoutChange: (updated: PayoutFormState) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function PayoutSection({
  payoutSettings,
  onPayoutChange,
  onSuccess,
  onError,
}: PayoutSectionProps) {
  const queryClient = useQueryClient();
  const set = (patch: Partial<PayoutFormState>) =>
    onPayoutChange({ ...payoutSettings, ...patch });

  const [otpState, setOtpState] = useState<OtpState>({ phase: 'idle' });

  // Countdown ticker
  useEffect(() => {
    if (otpState.phase !== 'otp_pending' || otpState.resendTimer <= 0) return;
    const t = setTimeout(
      () =>
        setOtpState((prev) =>
          prev.phase === 'otp_pending'
            ? { ...prev, resendTimer: prev.resendTimer - 1 }
            : prev,
        ),
      1000,
    );
    return () => clearTimeout(t);
  }, [otpState]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      authService.updateProfile(payload),

    onSuccess: (data: MomoOtpRequiredResponse | UserProfile) => {
      // Step 1 result: backend needs OTP
      if ('next_step' in data && data.next_step === 'verify_momo_change') {
        setOtpState((prev) =>
          prev.phase === 'otp_pending'
            ? {
                ...prev,
                maskedPhone: data.masked_phone,
                otpPhone: data.phone,
                resendTimer: 60,
                otpDigits: Array(6).fill(''),
                error: null,
              }
            : prev,
        );
        return;
      }

      // Step 2 result: OTP verified, change applied
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setOtpState({ phase: 'idle' });
      onSuccess('Payout account updated successfully!');
    },

    onError: (err: unknown) => {
      if (otpState.phase === 'otp_pending') {
        if (isLockout(err)) {
          setOtpState({
            phase: 'locked',
            message: extractError(
              err,
              'Too many failed attempts. Please wait 1 hour.',
            ),
          });
          return;
        }
        setOtpState((prev) =>
          prev.phase === 'otp_pending'
            ? {
                ...prev,
                error: extractError(err, 'Invalid OTP. Please try again.'),
              }
            : prev,
        );
        return;
      }
      onError(extractError(err, 'Failed to update payout account.'));
    },
  });

  // Handlers

  /**
   * Step 1: capture payload NOW before firing mutation.
   * We store it in otpState so onSuccess can use it for Step 2 without
   * any stale-closure risk from the form being edited mid-flight.
   */
  const handleSave = useCallback(() => {
    const payload: ProfileUpdatePayload = {
      momo_provider: payoutSettings.provider,
      momo_number: payoutSettings.accountNumber,
      momo_name: payoutSettings.accountName,
    };
    // Transition to otp_pending immediately so onSuccess knows to update
    // phone info rather than treating this as an error.
    // If backend returns 200 directly (no gated field changed), onSuccess
    // calls setOtpState({ phase: 'idle' }) which overrides this.
    setOtpState({
      phase: 'otp_pending',
      pendingPayload: payload,
      maskedPhone: '',
      otpPhone: '',
      resendTimer: 60,
      otpDigits: Array(6).fill(''),
      error: null,
    });
    mutation.mutate(payload);
  }, [payoutSettings, mutation]);

  const handleConfirmOtp = useCallback(() => {
    if (otpState.phase !== 'otp_pending') return;
    const code = otpState.otpDigits.join('');
    if (code.length !== 6) return;
    mutation.mutate({ ...otpState.pendingPayload, otp_code: code });
  }, [otpState, mutation]);

  const handleCancel = useCallback(() => {
    mutation.reset();
    setOtpState({ phase: 'idle' });
  }, [mutation]);

  const handleResend = useCallback(() => {
    if (otpState.phase !== 'otp_pending') return;
    setOtpState((prev) =>
      prev.phase === 'otp_pending'
        ? { ...prev, otpDigits: Array(6).fill(''), error: null }
        : prev,
    );
    mutation.mutate(otpState.pendingPayload);
  }, [otpState, mutation]);

  const handleOtpChange = useCallback(
    (digits: string[]) => {
      setOtpState((prev) =>
        prev.phase === 'otp_pending'
          ? { ...prev, otpDigits: digits, error: null }
          : prev,
      );
      // Auto-submit on complete
      if (digits.every((d) => d !== '') && otpState.phase === 'otp_pending') {
        mutation.mutate({
          ...otpState.pendingPayload,
          otp_code: digits.join(''),
        });
      }
    },
    [otpState, mutation],
  );

  // ── Derived ──────────────────────────────────────────────────────────────────
  const provider = payoutSettings.provider;
  const isOtpPending = otpState.phase === 'otp_pending';
  const isLocked = otpState.phase === 'locked';
  const isOtpComplete =
    isOtpPending && otpState.otpDigits.every((d) => d !== '');

  return (
    <SectionShell id="payout">
      <SectionHeader
        icon={<CreditCard className="h-4 w-4" />}
        title="Payout Account"
        description="Your linked mobile money account for payouts and withdrawals"
      />

      <SectionBody>
        {/* Lockout banner */}
        {isLocked && (
          <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-300">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Verification locked</p>
              <p>{otpState.message}</p>
              <button
                type="button"
                onClick={() => setOtpState({ phase: 'idle' })}
                className="text-red-600 dark:text-red-400 underline underline-offset-2 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* OTP verification panel */}
        {isOtpPending && (
          <div
            className="rounded-xl border border-cyan-200 bg-cyan-50/60 dark:border-cyan-500/20 dark:bg-cyan-500/6 p-4 space-y-4"
            role="region"
            aria-label="MoMo verification"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 shrink-0">
                  <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    Verify your MoMo number
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {otpState.maskedPhone ? (
                      <>
                        Code sent to{' '}
                        <span className="font-medium text-foreground">
                          {otpState.maskedPhone}
                        </span>
                      </>
                    ) : (
                      'Sending code to your MoMo number…'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Cancel verification"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Enter 6-digit code
              </p>
              <OtpInput
                digits={otpState.otpDigits}
                onChange={handleOtpChange}
                disabled={mutation.isPending}
              />
            </div>

            {otpState.error && (
              <div className="flex items-start gap-2 text-[12.5px] text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {otpState.error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="button"
                onClick={handleConfirmOtp}
                disabled={!isOtpComplete || mutation.isPending}
                size="sm"
                className="h-9 px-5 text-sm font-medium rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-500/20 transition-all disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                    Confirm
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={mutation.isPending}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <div className="ml-auto text-[12.5px] text-muted-foreground">
                {otpState.resendTimer > 0 ? (
                  <span>
                    Resend in{' '}
                    <span className="font-semibold tabular-nums text-foreground">
                      {otpState.resendTimer}s
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={mutation.isPending}
                    className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form fields — disabled while OTP pending or locked */}
        <fieldset
          disabled={isOtpPending || isLocked}
          className="space-y-4 disabled:opacity-60"
        >
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
              disabled={isOtpPending || isLocked}
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

          {!isOtpPending && !isLocked && (
            <div className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3 border-amber-100 bg-amber-50/60 dark:border-amber-500/15 dark:bg-amber-500/6">
              <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400/80 mt-0.5 shrink-0" />
              <p className="text-[12px] text-amber-700 dark:text-amber-400/80 leading-relaxed">
                Changing your provider, number, or account name requires OTP
                verification. A code will be sent to your MoMo number.
              </p>
            </div>
          )}
        </fieldset>
      </SectionBody>

      {!isOtpPending && !isLocked && (
        <SectionFooter>
          <SaveButton
            onClick={handleSave}
            isPending={mutation.isPending}
            idleLabel="Update Payout Account"
            pendingLabel="Saving…"
          />
        </SectionFooter>
      )}
    </SectionShell>
  );
}
