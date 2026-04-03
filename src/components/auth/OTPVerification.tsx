'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Shield,
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

  const isComplete = otp.every((d) => d !== '');

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
                  background:
                    'linear-gradient(135deg, rgba(220,38,38,0.12) 0%, rgba(245,158,11,0.12) 100%)',
                }}
              >
                <Shield className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                Verify your phone
              </h1>
            </div>
            <p className="text-[13.5px] text-gray-400 dark:text-white/40 leading-relaxed">
              We sent a 6-digit code to{' '}
              <span className="text-gray-700 dark:text-white/70 font-medium">
                {phoneNumber || '...'}
              </span>
            </p>
          </div>

          <div className="space-y-5">
            {/* ── Error banner ── */}
            {(verifyMutation.isError || resendMutation.isError) && (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]
                  border-red-200 bg-red-50/80 text-red-600
                  dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {(
                  verifyMutation.error as {
                    response?: { data?: { error?: string } };
                  }
                )?.response?.data?.error ||
                  resendMutation.error?.message ||
                  'An error occurred. Please try again.'}
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

            {/* ── OTP label ── */}
            <div>
              <p className="block text-gray-500 dark:text-white/45 text-[10.5px] font-bold uppercase tracking-[0.15em] mb-3">
                Enter 6-digit code
              </p>

              {/* ── OTP Inputs ── */}
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
                    disabled={verifyMutation.isPending}
                    className={cn(
                      'w-full h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200',
                      'bg-white/70 dark:bg-white/4',
                      'text-gray-900 dark:text-white',
                      'focus:outline-none',
                      digit
                        ? 'border-amber-400/80 dark:border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.12)] dark:shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
                        : 'border-gray-200/80 dark:border-white/8 hover:border-gray-300/80 dark:hover:border-white/[0.14] focus:border-amber-400/80 dark:focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]',
                      verifyMutation.isPending &&
                        'opacity-60 cursor-not-allowed',
                    )}
                  />
                ))}
              </div>
            </div>

            {/* ── Verifying indicator ── */}
            {verifyMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-[13px] text-gray-400 dark:text-white/35">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                Verifying your code…
              </div>
            )}

            {/* ── Verify button ── */}
            <Button
              onClick={() =>
                verifyMutation.mutate({
                  phone_number: phoneNumber,
                  code: otp.join(''),
                })
              }
              disabled={!isComplete || verifyMutation.isPending}
              className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
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

            {/* ── Resend ── */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-center text-[13px]">
              {resendTimer > 0 ? (
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

// // src/components/auth/OTPVerification.tsx

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { Check, AlertCircle, Loader2 } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from '@/src/components/ui/card';
// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// interface OTPVerificationProps {
//   phoneNumber: string;
//   onVerifySuccess: (code: string) => void;
// }

// export function OTPVerification({
//   phoneNumber,
//   onVerifySuccess,
// }: OTPVerificationProps) {
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [resendTimer, setResendTimer] = useState(60);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   const verifyMutation = useMutation({
//     mutationFn: authService.verifyOtp,
//     onSuccess: (_data, variables) => {
//       onVerifySuccess(variables.code);
//     },
//   });

//   const resendMutation = useMutation({
//     mutationFn: () => authService.resendOtp(phoneNumber),
//     onSuccess: () => {
//       setResendTimer(60);
//     },
//   });

//   useEffect(() => {
//     if (resendTimer > 0) {
//       const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendTimer]);

//   const handleChange = (index: number, value: string) => {
//     if (value.length <= 1 && /^\d*$/.test(value)) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);

//       if (value && index < 5) {
//         inputRefs.current[index + 1]?.focus();
//       }

//       if (newOtp.every((digit) => digit !== '') && index === 5) {
//         verifyMutation.mutate({
//           phone_number: phoneNumber,
//           code: newOtp.join(''),
//         });
//       }
//     }
//   };

//   const handleKeyDown = (
//     index: number,
//     e: React.KeyboardEvent<HTMLInputElement>,
//   ) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleResendClick = () => {
//     resendMutation.mutate();
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
//       <Card className="w-full max-w-md bg-card border-border rounded-2xl shadow-xl">
//         <CardHeader className="text-center pb-6 pt-10">
//           <div className="flex justify-center mb-6">
//             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
//               <Check className="h-8 w-8 text-primary" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
//             Verify Your Phone
//           </CardTitle>
//           <CardDescription className="text-muted-foreground mt-2">
//             We&apos;ve sent a 6-digit code to <br />
//             <span className="text-foreground font-medium">
//               {phoneNumber || '...'}
//             </span>
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-6 px-6 pb-10">
//           {/* Error / Success Messages */}
//           {(verifyMutation.isError || resendMutation.isError) && (
//             <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-center gap-3">
//               <AlertCircle className="h-5 w-5 shrink-0" />
//               {(
//                 verifyMutation.error as {
//                   response?: { data?: { error?: string } };
//                 }
//               )?.response?.data?.error ||
//                 resendMutation.error?.message ||
//                 'An error occurred'}
//             </div>
//           )}

//           {resendMutation.isSuccess && (
//             <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm text-center">
//               New code sent successfully!
//             </div>
//           )}

//           {/* OTP Inputs */}
//           <div className="flex justify-center gap-3 md:gap-4">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 ref={(el) => {
//                   inputRefs.current[index] = el;
//                 }}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={1}
//                 value={digit}
//                 onChange={(e) => handleChange(index, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(index, e)}
//                 className={cn(
//                   'w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-medium border-2 rounded-lg focus:border-primary focus:ring-primary/30 focus:outline-none bg-background transition-colors',
//                   verifyMutation.isPending && 'opacity-70 cursor-not-allowed',
//                 )}
//                 disabled={verifyMutation.isPending}
//               />
//             ))}
//           </div>

//           {verifyMutation.isPending && (
//             <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
//               <Loader2 className="h-4 w-4 animate-spin text-primary" />
//               Verifying...
//             </div>
//           )}

//           {/* Resend */}
//           <div className="text-center text-sm pt-2">
//             {resendTimer > 0 ? (
//               <span className="text-muted-foreground">
//                 Resend code in {resendTimer}s
//               </span>
//             ) : (
//               <button
//                 onClick={handleResendClick}
//                 disabled={resendMutation.isPending}
//                 className={cn(
//                   'text-primary hover:underline font-medium',
//                   resendMutation.isPending && 'opacity-50 cursor-not-allowed',
//                 )}
//               >
//                 {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
//               </button>
//             )}
//           </div>

//           {/* Verify Button */}
//           <Button
//             onClick={() =>
//               verifyMutation.mutate({
//                 phone_number: phoneNumber,
//                 code: otp.join(''),
//               })
//             }
//             disabled={otp.some((digit) => !digit) || verifyMutation.isPending}
//             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium mt-4"
//           >
//             Verify & Continue
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
