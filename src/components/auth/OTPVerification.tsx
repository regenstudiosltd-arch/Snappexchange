'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/src/components/ui/card';

interface OTPVerificationProps {
  phoneNumber: string;
  isVerifying: boolean;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export function OTPVerification({
  phoneNumber,
  isVerifying,
  onVerify,
  onResend,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        onVerify(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendClick = () => {
    setResendTimer(60);
    onResend();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#DC2626]/5 via-[#F59E0B]/5 to-[#059669]/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#DC2626] via-[#F59E0B] to-[#059669]">
              <Check className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit code to <br />
            <span className="text-foreground font-medium">
              {phoneNumber || '...'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
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
                className="w-12 h-14 text-center text-xl border-2 rounded-lg focus:border-[#DC2626] focus:outline-none bg-white transition-colors"
                disabled={isVerifying}
              />
            ))}
          </div>

          {isVerifying && (
            <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Verifying...
            </div>
          )}

          <div className="text-center text-sm">
            {resendTimer > 0 ? (
              <span className="text-muted-foreground">
                Resend code in {resendTimer}s
              </span>
            ) : (
              <button
                onClick={handleResendClick}
                className="text-[#DC2626] hover:underline font-medium"
              >
                Resend OTP
              </button>
            )}
          </div>

          <Button
            onClick={() => onVerify(otp.join(''))}
            disabled={otp.some((digit) => !digit) || isVerifying}
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white"
          >
            Verify & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
