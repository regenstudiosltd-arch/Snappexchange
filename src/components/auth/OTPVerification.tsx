'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Shield,
  Lock,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';
import { PageShell, AuthBrandMark } from './PageShell';
import Link from 'next/link';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerifySuccess: (code: string) => void;
}

//  Helpers
function extractErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';

  const err = error as {
    response?: {
      status?: number;
      data?: { error?: string; detail?: string };
    };
    message?: string;
  };

  const status = err.response?.status;
  const data = err.response?.data;

  // Lockout — HTTP 429
  if (status === 429) {
    // Our custom lockout message from otp_lockout.py
    if (data?.error) return data.error;
    // django-ratelimit throttle message
    if (data?.detail)
      return 'Too many attempts. Please wait a few minutes and try again.';
    return 'Too many failed attempts. Please wait 1 hour before trying again.';
  }

  // Backend validation errors
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  // Network / unknown
  if (err.message) return err.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Returns true when the error represents a hard lockout (HTTP 429).
 * Used to show a different, more prominent UI state.
 */
function isLockoutError(error: unknown): boolean {
  const err = error as { response?: { status?: number } } | undefined;
  return err?.response?.status === 429;
}

export function OTPVerification({
  phoneNumber,
  onVerifySuccess,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (_data, variables) => {
      onVerifySuccess(variables.code);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp(phoneNumber),
    onSuccess: () => {
      setResendTimer(60);
      // Clear any previous verify errors when user gets a fresh OTP
      verifyMutation.reset();
    },
  });

  // ── Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // ── OTP input handlers
  const handleChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-advance focus
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits filled
      if (newOtp.every((digit) => digit !== '') && index === 5) {
        verifyMutation.mutate({
          phone_number: phoneNumber,
          code: newOtp.join(''),
        });
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
    if (pasted.length === 6) {
      verifyMutation.mutate({ phone_number: phoneNumber, code: pasted });
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const isComplete = otp.every((d) => d !== '');
  const isLockedOut =
    verifyMutation.isError && isLockoutError(verifyMutation.error);
  const errorMessage = verifyMutation.isError
    ? extractErrorMessage(verifyMutation.error)
    : resendMutation.isError
      ? extractErrorMessage(resendMutation.error)
      : null;

  // When locked out, disable the inputs and verify button entirely
  const isDisabled = verifyMutation.isPending || isLockedOut;

  return (
    <PageShell>
      <div className="flex flex-col items-center">
        {/* ── Back link ── */}
        <Link
          href="/login"
          className="group inline-flex items-center gap-1.5 mb-6 text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/70 text-sm transition-colors duration-200 w-full max-w-md"
        >
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to login
        </Link>

        {/* ── Card ── */}
        <div
          className="w-full max-w-md rounded-2xl border backdrop-blur-xl p-8 transition-colors duration-300
            bg-white/75 border-gray-200/70 shadow-[0_24px_80px_rgba(0,0,0,0.08)]
            dark:bg-white/3 dark:border-white/[0.07] dark:shadow-none"
          style={{
            animation: 'otpCardIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes otpCardIn {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <AuthBrandMark />

          {/* ── Icon + Heading ── */}
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                style={{
                  background: isLockedOut
                    ? 'rgba(239,68,68,0.12)'
                    : 'linear-gradient(135deg, rgba(220,38,38,0.12) 0%, rgba(245,158,11,0.12) 100%)',
                }}
              >
                {isLockedOut ? (
                  <Lock className="h-4 w-4 text-red-500 dark:text-red-400" />
                ) : (
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                {isLockedOut
                  ? 'Account temporarily locked'
                  : 'Verify your phone'}
              </h1>
            </div>
            <p className="text-[13.5px] text-gray-400 dark:text-white/40 leading-relaxed">
              {isLockedOut ? (
                'Too many incorrect attempts. Please wait before trying again.'
              ) : (
                <>
                  We sent a 6-digit code to{' '}
                  <span className="text-gray-700 dark:text-white/70 font-medium">
                    {phoneNumber || '...'}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="space-y-5">
            {/* ── Error / lockout banner ── */}
            {errorMessage && (
              <div
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]',
                  isLockedOut
                    ? // Hard lockout — more prominent red styling
                      'border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-300'
                    : // Regular error
                      'border-red-200 bg-red-50/80 text-red-600 dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-400',
                )}
              >
                {isLockedOut ? (
                  <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ── Resend success ── */}
            {resendMutation.isSuccess && (
              <div
                className="rounded-xl border px-4 py-3 text-[13px] text-center
                  border-amber-200/80 bg-amber-50/80 text-amber-700
                  dark:border-amber-500/20 dark:bg-amber-500/8 dark:text-amber-400"
              >
                New code sent successfully!
              </div>
            )}

            {/* ── OTP inputs — hidden when locked out ── */}
            {!isLockedOut && (
              <div>
                <p className="block text-gray-500 dark:text-white/45 text-[10.5px] font-bold uppercase tracking-[0.15em] mb-3">
                  Enter 6-digit code
                </p>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isDisabled}
                      className={cn(
                        'w-full h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200',
                        'bg-white/70 dark:bg-white/4',
                        'text-gray-900 dark:text-white',
                        'focus:outline-none',
                        digit
                          ? 'border-amber-400/80 dark:border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.12)] dark:shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
                          : 'border-gray-200/80 dark:border-white/8 hover:border-gray-300/80 dark:hover:border-white/[0.14] focus:border-amber-400/80 dark:focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]',
                        isDisabled && 'opacity-50 cursor-not-allowed',
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Verifying indicator ── */}
            {verifyMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-[13px] text-gray-400 dark:text-white/35">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                Verifying your code…
              </div>
            )}

            {/* ── Verify button — hidden when locked out ── */}
            {!isLockedOut && (
              <Button
                onClick={() =>
                  verifyMutation.mutate({
                    phone_number: phoneNumber,
                    code: otp.join(''),
                  })
                }
                disabled={!isComplete || isDisabled}
                className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
                }}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {/* ── Resend section ── */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-center text-[13px]">
              {isLockedOut ? (
                // When locked out, tell user to try again later
                // Don't offer resend — the backend will reject it too
                <span className="text-gray-400 dark:text-white/28">
                  Please wait 1 hour, then{' '}
                  <Link
                    href="/login"
                    className="text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
                  >
                    return to login
                  </Link>
                </span>
              ) : resendTimer > 0 ? (
                <span className="text-gray-400 dark:text-white/28">
                  Resend code in{' '}
                  <span className="text-amber-600 dark:text-amber-500/80 font-semibold tabular-nums">
                    {resendTimer}s
                  </span>
                </span>
              ) : (
                <>
                  <span className="text-gray-400 dark:text-white/28">
                    Didn&apos;t receive it?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                    className="text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendMutation.isPending ? 'Sending…' : 'Resend OTP'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
