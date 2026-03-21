'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/src/components/ui/card';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerifySuccess: () => void;
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
    onSuccess: () => {
      onVerifySuccess();
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp(phoneNumber),
    onSuccess: () => {
      setResendTimer(60);
    },
  });

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

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

  const handleResendClick = () => {
    resendMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md bg-card border-border rounded-2xl shadow-xl">
        <CardHeader className="text-center pb-6 pt-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
            Verify Your Phone
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            We&apos;ve sent a 6-digit code to <br />
            <span className="text-foreground font-medium">
              {phoneNumber || '...'}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-10">
          {/* Error / Success Messages */}
          {(verifyMutation.isError || resendMutation.isError) && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {(
                verifyMutation.error as {
                  response?: { data?: { error?: string } };
                }
              )?.response?.data?.error ||
                resendMutation.error?.message ||
                'An error occurred'}
            </div>
          )}

          {resendMutation.isSuccess && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm text-center">
              New code sent successfully!
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 md:gap-4">
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
                className={cn(
                  'w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-medium border-2 rounded-lg focus:border-primary focus:ring-primary/30 focus:outline-none bg-background transition-colors',
                  verifyMutation.isPending && 'opacity-70 cursor-not-allowed',
                )}
                disabled={verifyMutation.isPending}
              />
            ))}
          </div>

          {verifyMutation.isPending && (
            <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Verifying...
            </div>
          )}

          {/* Resend */}
          <div className="text-center text-sm pt-2">
            {resendTimer > 0 ? (
              <span className="text-muted-foreground">
                Resend code in {resendTimer}s
              </span>
            ) : (
              <button
                onClick={handleResendClick}
                disabled={resendMutation.isPending}
                className={cn(
                  'text-primary hover:underline font-medium',
                  resendMutation.isPending && 'opacity-50 cursor-not-allowed',
                )}
              >
                {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={() =>
              verifyMutation.mutate({
                phone_number: phoneNumber,
                code: otp.join(''),
              })
            }
            disabled={otp.some((digit) => !digit) || verifyMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium mt-4"
          >
            Verify & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
