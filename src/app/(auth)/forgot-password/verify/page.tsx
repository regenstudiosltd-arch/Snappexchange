// src/app/(auth)/forgot-password/verify/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/src/components/ui/button';
import { PageShell, AuthBrandMark } from '@/src/components/auth/PageShell';
import { authService } from '@/src/services/auth.service';
import { passwordResetStore } from '@/src/lib/password-reset-store';

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

export default function ForgotPasswordVerifyPage() {
  const router = useRouter();
  const store = passwordResetStore.get();

  useEffect(() => {
    if (!store.phone) {
      router.replace('/forgot-password');
    }
  }, [store.phone, router]);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const verifyMutation = useMutation({
    mutationFn: (code: string) =>
      authService.verifyOtp({ phone_number: store.phone!, code }),
    onSuccess: (_data, code) => {
      passwordResetStore.set({ code });
      router.push('/forgot-password/reset');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp(store.phone!),
    onSuccess: () => {
      setResendTimer(RESEND_DELAY);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    },
  });

  const submitOtp = (digits: string[]) => {
    const code = digits.join('');
    if (code.length === OTP_LENGTH) verifyMutation.mutate(code);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = d;
      });
      setOtp(next);
      const focusAt = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[focusAt]?.focus();
      if (next.every((d) => d !== '')) submitOtp(next);
      return;
    }

    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== '') && index === OTP_LENGTH - 1)
      submitOtp(next);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1]?.focus();
  };

  const allFilled = otp.every((d) => d !== '');
  const maskedPhone = store.maskedPhone ?? store.phone ?? '...';

  return (
    <PageShell>
      <div className="flex flex-col items-center">
        {/* ── Back link ── */}
        <Link
          href="/forgot-password"
          className="group inline-flex items-center gap-2 mb-6 text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/80 text-sm transition-colors duration-200 w-full max-w-md"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Change number
        </Link>

        {/* ── Card ── */}
        <div
          className="w-full max-w-md rounded-2xl border backdrop-blur-xl p-8 transition-colors duration-300
            bg-white/75 border-gray-200/70 shadow-[0_24px_80px_rgba(0,0,0,0.08)]
            dark:bg-white/3 dark:border-white/8 dark:shadow-none"
          style={{
            animation: 'fpCardIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes fpCardIn {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <AuthBrandMark />

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === 1
                    ? 'w-8 bg-gray-300 dark:bg-white/20'
                    : s === 2
                      ? 'w-8 bg-linear-to-r from-amber-500 to-emerald-500'
                      : 'w-4 bg-gray-200 dark:bg-white/10'
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 dark:text-white/30 font-mono tabular-nums">
              2 / 3
            </span>
          </div>

          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            Check your phone
          </h1>
          <p className="text-[13.5px] text-gray-400 dark:text-white/50 mb-7 leading-relaxed">
            We sent a 6-digit code to{' '}
            <span className="text-gray-700 dark:text-white/80 font-medium">
              {maskedPhone}
            </span>
            . Enter it below to continue.
          </p>

          {/* Error banners */}
          {(verifyMutation.isError || resendMutation.isError) && (
            <div
              className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] mb-6
              border-red-200 bg-red-50/80 text-red-600
              dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {verifyMutation.isError
                ? 'Invalid or expired code. Please try again.'
                : 'Failed to resend code. Try again shortly.'}
            </div>
          )}

          {/* Resend success */}
          {resendMutation.isSuccess && (
            <div
              className="rounded-xl border px-4 py-3 text-[13px] text-center mb-6
              border-emerald-200 bg-emerald-50/80 text-emerald-700
              dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              New code sent!
            </div>
          )}

          {/* OTP boxes */}
          <div className="flex justify-center gap-2.5 mb-7">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                disabled={verifyMutation.isPending}
                className={[
                  'w-11 h-14 rounded-xl text-center text-xl font-bold',
                  'border-2 outline-none transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  /* Light mode base */
                  'bg-white/80 text-gray-900',
                  /* Dark mode base */
                  'dark:bg-white/4 dark:text-white',
                  /* Active (focused) */
                  activeIndex === index
                    ? [
                        'border-amber-400 scale-105',
                        'shadow-[0_0_0_3px_rgba(245,158,11,0.15)]',
                        'dark:border-amber-500/60 dark:shadow-[0_0_0_3px_rgba(245,158,11,0.10)]',
                      ].join(' ')
                    : digit
                      ? [
                          'border-emerald-400/70 bg-emerald-50/60',
                          'dark:border-emerald-500/40 dark:bg-emerald-500/6',
                        ].join(' ')
                      : [
                          'border-gray-200 hover:border-gray-300',
                          'dark:border-white/10 dark:hover:border-white/20',
                        ].join(' '),
                ].join(' ')}
              />
            ))}
          </div>

          {/* Verify button */}
          <Button
            onClick={() => submitOtp(otp)}
            disabled={!allFilled || verifyMutation.isPending}
            className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: allFilled
                ? 'linear-gradient(135deg, #F59E0B 0%, #059669 100%)'
                : undefined,
            }}
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              'Verify code'
            )}
          </Button>

          {/* Resend */}
          <div className="mt-6 text-center text-[13px]">
            {resendTimer > 0 ? (
              <span className="text-gray-400 dark:text-white/25">
                Resend code in{' '}
                <span className="text-gray-600 dark:text-white/50 font-mono tabular-nums">
                  {resendTimer}s
                </span>
              </span>
            ) : (
              <button
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-400 font-semibold transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {resendMutation.isPending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// // app/(auth)/forgot-password/verify/page.tsx

// 'use client';

// /**
//  * /app/(auth)/forgot-password/verify/page.tsx
//  *
//  * Step 2 of the password-reset flow.
//  * User enters the 6-digit OTP sent to their phone.
//  * On success → redirects to /forgot-password/reset
//  */

// import { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useMutation } from '@tanstack/react-query';
// import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
// import Link from 'next/link';

// import { Button } from '@/src/components/ui/button';
// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { authService } from '@/src/services/auth.service';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// const OTP_LENGTH = 6;
// const RESEND_DELAY = 60;

// export default function ForgotPasswordVerifyPage() {
//   const router = useRouter();
//   const store = passwordResetStore.get();

//   // Guard: if no phone in store, send back to step 1
//   useEffect(() => {
//     if (!store.phone) {
//       router.replace('/forgot-password');
//     }
//   }, [store.phone, router]);

//   const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
//   const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   // Resend countdown
//   useEffect(() => {
//     if (resendTimer <= 0) return;
//     const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
//     return () => clearTimeout(t);
//   }, [resendTimer]);

//   const verifyMutation = useMutation({
//     mutationFn: (code: string) =>
//       authService.verifyOtp({ phone_number: store.phone!, code }),
//     onSuccess: (_data, code) => {
//       passwordResetStore.set({ code });
//       router.push('/forgot-password/reset');
//     },
//   });

//   const resendMutation = useMutation({
//     mutationFn: () => authService.resendOtp(store.phone!),
//     onSuccess: () => {
//       setResendTimer(RESEND_DELAY);
//       setOtp(Array(OTP_LENGTH).fill(''));
//       inputRefs.current[0]?.focus();
//     },
//   });

//   const submitOtp = (digits: string[]) => {
//     const code = digits.join('');
//     if (code.length === OTP_LENGTH) {
//       verifyMutation.mutate(code);
//     }
//   };

//   const handleChange = (index: number, value: string) => {
//     // Accept paste of full code
//     if (value.length > 1) {
//       const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
//       const next = [...otp];
//       digits.forEach((d, i) => {
//         if (index + i < OTP_LENGTH) next[index + i] = d;
//       });
//       setOtp(next);
//       const focusAt = Math.min(index + digits.length, OTP_LENGTH - 1);
//       inputRefs.current[focusAt]?.focus();
//       if (next.every((d) => d !== '')) submitOtp(next);
//       return;
//     }

//     if (!/^\d*$/.test(value)) return;
//     const next = [...otp];
//     next[index] = value;
//     setOtp(next);

//     if (value && index < OTP_LENGTH - 1) {
//       inputRefs.current[index + 1]?.focus();
//     }

//     if (next.every((d) => d !== '') && index === OTP_LENGTH - 1) {
//       submitOtp(next);
//     }
//   };

//   const handleKeyDown = (
//     index: number,
//     e: React.KeyboardEvent<HTMLInputElement>,
//   ) => {
//     if (e.key === 'Backspace') {
//       if (otp[index]) {
//         const next = [...otp];
//         next[index] = '';
//         setOtp(next);
//       } else if (index > 0) {
//         inputRefs.current[index - 1]?.focus();
//       }
//     }
//     if (e.key === 'ArrowLeft' && index > 0)
//       inputRefs.current[index - 1]?.focus();
//     if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1)
//       inputRefs.current[index + 1]?.focus();
//   };

//   const allFilled = otp.every((d) => d !== '');
//   const maskedPhone = store.maskedPhone ?? store.phone ?? '...';

//   return (
//     <AuthShell>
//       {/* Back link */}
//       <Link
//         href="/forgot-password"
//         className="group inline-flex items-center gap-2 mb-6 text-white/40 hover:text-white/80 text-sm transition-colors duration-200"
//       >
//         <svg
//           className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
//           viewBox="0 0 16 16"
//           fill="none"
//         >
//           <path
//             d="M10 12L6 8l4-4"
//             stroke="currentColor"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//         Change number
//       </Link>

//       <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Step indicator */}
//         <div className="flex items-center gap-2 mb-6">
//           {[1, 2, 3].map((step) => (
//             <div
//               key={step}
//               className={`h-1.5 rounded-full transition-all duration-300 ${
//                 step === 1
//                   ? 'w-8 bg-white/20'
//                   : step === 2
//                     ? 'w-8 bg-gradient-to-r from-amber-500 to-emerald-500'
//                     : 'w-4 bg-white/10'
//               }`}
//             />
//           ))}
//           <span className="ml-auto text-xs text-white/30 font-mono">2 / 3</span>
//         </div>

//         <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
//           Check your phone
//         </h1>
//         <p className="text-sm text-white/50 mb-8 leading-relaxed">
//           We sent a 6-digit code to{' '}
//           <span className="text-white/80 font-medium">{maskedPhone}</span>.
//           Enter it below to continue.
//         </p>

//         {/* Error */}
//         {(verifyMutation.isError || resendMutation.isError) && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
//             <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
//             {verifyMutation.isError
//               ? 'Invalid or expired code. Please try again.'
//               : 'Failed to resend code. Try again shortly.'}
//           </div>
//         )}

//         {/* Resend success */}
//         {resendMutation.isSuccess && (
//           <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 mb-6 text-center">
//             New code sent!
//           </div>
//         )}

//         {/* OTP boxes */}
//         <div className="flex justify-center gap-3 mb-8">
//           {otp.map((digit, index) => (
//             <input
//               key={index}
//               ref={(el) => {
//                 inputRefs.current[index] = el;
//               }}
//               type="text"
//               inputMode="numeric"
//               maxLength={6}
//               value={digit}
//               onChange={(e) => handleChange(index, e.target.value)}
//               onKeyDown={(e) => handleKeyDown(index, e)}
//               onFocus={() => setActiveIndex(index)}
//               onBlur={() => setActiveIndex(null)}
//               disabled={verifyMutation.isPending}
//               className={[
//                 'w-12 h-14 rounded-xl text-center text-2xl font-bold text-white',
//                 'border bg-white/[0.04] outline-none',
//                 'transition-all duration-200',
//                 'disabled:opacity-50 disabled:cursor-not-allowed',
//                 activeIndex === index
//                   ? 'border-amber-500/60 shadow-[0_0_0_3px_rgba(245,158,11,0.1)] scale-105'
//                   : digit
//                     ? 'border-emerald-500/40 bg-emerald-500/5'
//                     : 'border-white/10',
//               ].join(' ')}
//             />
//           ))}
//         </div>

//         {/* Verify button */}
//         <Button
//           onClick={() => submitOtp(otp)}
//           disabled={!allFilled || verifyMutation.isPending}
//           className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
//           style={{
//             background: allFilled
//               ? 'linear-gradient(135deg, #F59E0B 0%, #059669 100%)'
//               : 'rgba(255,255,255,0.06)',
//           }}
//         >
//           {verifyMutation.isPending ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Verifying…
//             </>
//           ) : (
//             'Verify code'
//           )}
//         </Button>

//         {/* Resend */}
//         <div className="mt-6 text-center text-sm">
//           {resendTimer > 0 ? (
//             <span className="text-white/25">
//               Resend code in{' '}
//               <span className="text-white/50 font-mono">{resendTimer}s</span>
//             </span>
//           ) : (
//             <button
//               onClick={() => resendMutation.mutate()}
//               disabled={resendMutation.isPending}
//               className="inline-flex items-center gap-1.5 text-amber-500/80 hover:text-amber-400 transition-colors disabled:opacity-50"
//             >
//               <RotateCcw className="h-3.5 w-3.5" />
//               {resendMutation.isPending ? 'Sending…' : 'Resend code'}
//             </button>
//           )}
//         </div>
//       </div>
//     </AuthShell>
//   );
// }
