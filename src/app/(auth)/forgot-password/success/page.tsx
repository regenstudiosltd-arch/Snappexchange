// src/app/(auth)/forgot-password/success/page.tsx

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PageShell, AuthBrandMark } from '@/src/components/auth/PageShell';
import { Button } from '@/src/components/ui/button';
import { passwordResetStore } from '@/src/lib/password-reset-store';

/* ── Constants ──────────────────────────────────────────────────────────── */
const COUNTDOWN_SEC = 5;
const CIRCUMFERENCE = 2 * Math.PI * 45; // radius 45 → ≈ 282.74

/* ── Countdown hook (identical logic to original) ───────────────────────── */
function useCountdown(active: boolean, total: number, onComplete: () => void) {
  const [count, setCount] = useState(total);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      setCount(total);
    };
  }, [active, total]);

  return count;
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function ForgotPasswordSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    passwordResetStore.clear();
  }, []);

  const handleComplete = useCallback(() => {
    router.push('/login');
  }, [router]);

  const countdown = useCountdown(true, COUNTDOWN_SEC, handleComplete);
  const strokeDashoffset = CIRCUMFERENCE * (1 - countdown / COUNTDOWN_SEC);

  return (
    <PageShell>
      <div className="flex flex-col items-center">
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
            @keyframes checkDraw {
              from { stroke-dashoffset: 40; opacity: 0; }
              to   { stroke-dashoffset: 0;  opacity: 1; }
            }
          `}</style>

          <AuthBrandMark />

          {/* ── Animated success icon ── */}
          <div className="flex justify-center mb-8">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Ping ring */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{
                  background:
                    'radial-gradient(circle, #10B981 0%, transparent 70%)',
                }}
              />

              {/* Glow — light mode softer, dark mode as-is */}
              <div
                className="absolute inset-0 rounded-full opacity-20 dark:opacity-30"
                style={{ boxShadow: '0 0 40px 8px #10B981' }}
              />

              {/* Icon container */}
              <div
                className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)',
                  border: '1.5px solid rgba(16,185,129,0.35)',
                }}
              >
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <path
                    d="M7 16l7 7 11-11"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 40,
                      strokeDashoffset: 0,
                      animation: 'checkDraw 0.5s ease-out 0.1s both',
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Text ── */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
              Password reset!
            </h1>
            <p className="text-[13.5px] text-gray-400 dark:text-white/50 leading-relaxed max-w-xs mx-auto">
              Your password has been updated successfully. You&apos;ll be
              redirected to the login screen shortly.
            </p>
          </div>

          {/* ── Circular countdown ── */}
          <div className="flex justify-center mb-7">
            <div
              className="relative flex items-center justify-center"
              role="timer"
              aria-label={`Redirecting in ${countdown} seconds`}
            >
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none"
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="6"
                />
                {/* Track dark */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none hidden dark:block"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="6"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none transition-all duration-1000 ease-linear"
                  stroke="url(#successGrad)"
                  strokeWidth="6"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="successGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Number */}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white tabular-nums"
              >
                {countdown}
              </span>
            </div>
          </div>

          {/* ── Skip button ── */}
          <Button
            onClick={handleComplete}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium transition-all duration-200
              border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300
              dark:border-white/10 dark:bg-white/4 dark:text-white/60 dark:hover:bg-white/8 dark:hover:text-white dark:hover:border-white/20"
          >
            Go to login now
          </Button>

          {/* Decorative divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/6" />
            <span className="text-[10.5px] text-gray-300 dark:text-white/20 font-mono tracking-widest uppercase">
              Secure Redirect
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/6" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// // src/app/(auth)/forgot-password/success/page.tsx

// 'use client';

// /**
//  * /app/(auth)/forgot-password/success/page.tsx
//  *
//  * Final step of the password-reset flow.
//  * Shows an animated success state with a circular countdown,
//  * then redirects to /login — mirroring the SettingsPage modal pattern.
//  */

// import { useEffect, useRef, useCallback, useState } from 'react';
// import { useRouter } from 'next/navigation';

// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { Button } from '@/src/components/ui/button';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// // ─── Constants ───────────────────────────────────────────────────────────────

// const COUNTDOWN_SEC = 5;
// const CIRCUMFERENCE = 2 * Math.PI * 45; // radius = 45 → ≈ 282.74

// // ─── Hook — identical logic to SettingsPage's useCountdown ───────────────────

// function useCountdown(active: boolean, total: number, onComplete: () => void) {
//   const [count, setCount] = useState(total);
//   const onCompleteRef = useRef(onComplete);

//   useEffect(() => {
//     onCompleteRef.current = onComplete;
//   });

//   useEffect(() => {
//     if (!active) return;

//     const interval = setInterval(() => {
//       setCount((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           // Schedule outside the updater — calling router.push() inside a
//           // setState updater runs during React's render phase and triggers
//           // the "Cannot update a component while rendering" warning.
//           setTimeout(() => onCompleteRef.current(), 0);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//       setCount(total);
//     };
//   }, [active, total]);

//   return count;
// }

// // ─── Component ───────────────────────────────────────────────────────────────

// export default function ForgotPasswordSuccessPage() {
//   const router = useRouter();

//   // Clean up the session store now that the flow is complete.
//   // This is the correct place — after a successful reset, not before navigating here.
//   useEffect(() => {
//     passwordResetStore.clear();
//   }, []);

//   const handleComplete = useCallback(() => {
//     router.push('/login');
//   }, [router]);

//   const countdown = useCountdown(true, COUNTDOWN_SEC, handleComplete);

//   const strokeDashoffset = CIRCUMFERENCE * (1 - countdown / COUNTDOWN_SEC);

//   return (
//     <AuthShell>
//       <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Animated success icon */}
//         <div className="flex justify-center mb-8">
//           <div className="relative flex h-20 w-20 items-center justify-center">
//             {/* Ping ring */}
//             <div
//               aria-hidden
//               className="absolute inset-0 rounded-full animate-ping opacity-25"
//               style={{
//                 background:
//                   'radial-gradient(circle, #10B981 0%, transparent 70%)',
//               }}
//             />
//             {/* Outer glow ring */}
//             <div
//               className="absolute inset-0 rounded-full opacity-30"
//               style={{
//                 boxShadow: '0 0 40px 8px #10B981',
//               }}
//             />
//             {/* Icon container */}
//             <div
//               className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
//               style={{
//                 background:
//                   'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
//                 border: '1.5px solid rgba(16,185,129,0.4)',
//               }}
//             >
//               {/* Animated check mark */}
//               <svg
//                 viewBox="0 0 32 32"
//                 fill="none"
//                 className="w-8 h-8"
//                 style={{ animation: 'checkDraw 0.5s ease-out 0.1s both' }}
//               >
//                 <style>{`
//                   @keyframes checkDraw {
//                     from { stroke-dashoffset: 40; opacity: 0; }
//                     to   { stroke-dashoffset: 0;  opacity: 1; }
//                   }
//                   .check-path {
//                     stroke-dasharray: 40;
//                     stroke-dashoffset: 0;
//                     animation: checkDraw 0.5s ease-out 0.1s both;
//                   }
//                 `}</style>
//                 <path
//                   className="check-path"
//                   d="M7 16l7 7 11-11"
//                   stroke="#10B981"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Text */}
//         <div className="text-center mb-8 space-y-2">
//           <h1 className="text-2xl font-bold text-white tracking-tight">
//             Password reset!
//           </h1>
//           <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
//             Your password has been updated successfully. You&apos;ll be
//             redirected to the login screen shortly.
//           </p>
//         </div>

//         {/* Circular countdown — mirrors SettingsPage modal exactly */}
//         <div className="flex justify-center mb-8">
//           <div
//             className="relative flex items-center justify-center"
//             role="timer"
//             aria-label={`Redirecting in ${countdown} seconds`}
//           >
//             <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
//               {/* Track */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 className="fill-none"
//                 stroke="rgba(255,255,255,0.06)"
//                 strokeWidth="6"
//               />
//               {/* Progress arc */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 className="fill-none transition-all duration-1000 ease-linear"
//                 stroke="url(#successGrad)"
//                 strokeWidth="6"
//                 strokeDasharray={CIRCUMFERENCE}
//                 strokeDashoffset={strokeDashoffset}
//                 strokeLinecap="round"
//               />
//               <defs>
//                 <linearGradient
//                   id="successGrad"
//                   x1="0%"
//                   y1="0%"
//                   x2="100%"
//                   y2="0%"
//                 >
//                   <stop offset="0%" stopColor="#10B981" />
//                   <stop offset="100%" stopColor="#0891B2" />
//                 </linearGradient>
//               </defs>
//             </svg>

//             {/* Number */}
//             <span
//               aria-hidden
//               className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white tabular-nums"
//             >
//               {countdown}
//             </span>
//           </div>
//         </div>

//         {/* Skip button */}
//         <Button
//           onClick={handleComplete}
//           variant="outline"
//           className="w-full h-12 rounded-xl border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white hover:border-white/20 transition-all duration-200"
//         >
//           Go to login now
//         </Button>

//         {/* Decorative divider with label */}
//         <div className="mt-6 flex items-center gap-3">
//           <div className="flex-1 h-px bg-white/6" />
//           <span className="text-xs text-white/20 font-mono">
//             SECURE REDIRECT
//           </span>
//           <div className="flex-1 h-px bg-white/6" />
//         </div>
//       </div>
//     </AuthShell>
//   );
// }

// 'use client';

// /**
//  * /app/(auth)/forgot-password/success/page.tsx
//  *
//  * Final step of the password-reset flow.
//  * Shows an animated success state with a circular countdown,
//  * then redirects to /login — mirroring the SettingsPage modal pattern.
//  */

// import { useEffect, useRef, useCallback, useState } from 'react';
// import { useRouter } from 'next/navigation';

// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { Button } from '@/src/components/ui/button';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// // ─── Constants ───────────────────────────────────────────────────────────────

// const COUNTDOWN_SEC = 5;
// const CIRCUMFERENCE = 2 * Math.PI * 45; // radius = 45 → ≈ 282.74

// // ─── Hook — identical logic to SettingsPage's useCountdown ───────────────────

// function useCountdown(active: boolean, total: number, onComplete: () => void) {
//   const [count, setCount] = useState(total);
//   const onCompleteRef = useRef(onComplete);

//   useEffect(() => {
//     onCompleteRef.current = onComplete;
//   });

//   useEffect(() => {
//     if (!active) return;

//     const interval = setInterval(() => {
//       setCount((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           onCompleteRef.current();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//       setCount(total);
//     };
//   }, [active, total]);

//   return count;
// }

// // ─── Component ───────────────────────────────────────────────────────────────

// export default function ForgotPasswordSuccessPage() {
//   const router = useRouter();

//   // Clean up the session store now that the flow is complete.
//   // This is the correct place — after a successful reset, not before navigating here.
//   useEffect(() => {
//     passwordResetStore.clear();
//   }, []);

//   const handleComplete = useCallback(() => {
//     router.push('/login');
//   }, [router]);

//   const countdown = useCountdown(true, COUNTDOWN_SEC, handleComplete);

//   const strokeDashoffset = CIRCUMFERENCE * (1 - countdown / COUNTDOWN_SEC);

//   return (
//     <AuthShell>
//       <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Animated success icon */}
//         <div className="flex justify-center mb-8">
//           <div className="relative flex h-20 w-20 items-center justify-center">
//             {/* Ping ring */}
//             <div
//               aria-hidden
//               className="absolute inset-0 rounded-full animate-ping opacity-25"
//               style={{
//                 background:
//                   'radial-gradient(circle, #10B981 0%, transparent 70%)',
//               }}
//             />
//             {/* Outer glow ring */}
//             <div
//               className="absolute inset-0 rounded-full opacity-30"
//               style={{
//                 boxShadow: '0 0 40px 8px #10B981',
//               }}
//             />
//             {/* Icon container */}
//             <div
//               className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
//               style={{
//                 background:
//                   'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
//                 border: '1.5px solid rgba(16,185,129,0.4)',
//               }}
//             >
//               {/* Animated check mark */}
//               <svg
//                 viewBox="0 0 32 32"
//                 fill="none"
//                 className="w-8 h-8"
//                 style={{ animation: 'checkDraw 0.5s ease-out 0.1s both' }}
//               >
//                 <style>{`
//                   @keyframes checkDraw {
//                     from { stroke-dashoffset: 40; opacity: 0; }
//                     to   { stroke-dashoffset: 0;  opacity: 1; }
//                   }
//                   .check-path {
//                     stroke-dasharray: 40;
//                     stroke-dashoffset: 0;
//                     animation: checkDraw 0.5s ease-out 0.1s both;
//                   }
//                 `}</style>
//                 <path
//                   className="check-path"
//                   d="M7 16l7 7 11-11"
//                   stroke="#10B981"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Text */}
//         <div className="text-center mb-8 space-y-2">
//           <h1 className="text-2xl font-bold text-white tracking-tight">
//             Password reset!
//           </h1>
//           <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
//             Your password has been updated successfully. You&apos;ll be
//             redirected to the login screen shortly.
//           </p>
//         </div>

//         {/* Circular countdown — mirrors SettingsPage modal exactly */}
//         <div className="flex justify-center mb-8">
//           <div
//             className="relative flex items-center justify-center"
//             role="timer"
//             aria-label={`Redirecting in ${countdown} seconds`}
//           >
//             <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
//               {/* Track */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 className="fill-none"
//                 stroke="rgba(255,255,255,0.06)"
//                 strokeWidth="6"
//               />
//               {/* Progress arc */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 className="fill-none transition-all duration-1000 ease-linear"
//                 stroke="url(#successGrad)"
//                 strokeWidth="6"
//                 strokeDasharray={CIRCUMFERENCE}
//                 strokeDashoffset={strokeDashoffset}
//                 strokeLinecap="round"
//               />
//               <defs>
//                 <linearGradient
//                   id="successGrad"
//                   x1="0%"
//                   y1="0%"
//                   x2="100%"
//                   y2="0%"
//                 >
//                   <stop offset="0%" stopColor="#10B981" />
//                   <stop offset="100%" stopColor="#0891B2" />
//                 </linearGradient>
//               </defs>
//             </svg>

//             {/* Number */}
//             <span
//               aria-hidden
//               className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white tabular-nums"
//             >
//               {countdown}
//             </span>
//           </div>
//         </div>

//         {/* Skip button */}
//         <Button
//           onClick={handleComplete}
//           variant="outline"
//           className="w-full h-12 rounded-xl border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-200"
//         >
//           Go to login now
//         </Button>

//         {/* Decorative divider with label */}
//         <div className="mt-6 flex items-center gap-3">
//           <div className="flex-1 h-px bg-white/[0.06]" />
//           <span className="text-xs text-white/20 font-mono">
//             SECURE REDIRECT
//           </span>
//           <div className="flex-1 h-px bg-white/[0.06]" />
//         </div>
//       </div>
//     </AuthShell>
//   );
// }

// // app/(auth)/forgot-password/success/page.tsx

// 'use client';

// /**
//  * /app/(auth)/forgot-password/success/page.tsx
//  *
//  * Final step of the password-reset flow.
//  * Shows an animated success state with a circular countdown,
//  * then redirects to /login — mirroring the SettingsPage modal pattern.
//  */

// import { useEffect, useRef, useCallback, useState } from 'react';
// import { useRouter } from 'next/navigation';

// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { Button } from '@/src/components/ui/button';

// // ─── Constants ───────────────────────────────────────────────────────────────

// const COUNTDOWN_SEC = 5;
// const CIRCUMFERENCE = 2 * Math.PI * 45; // radius = 45 → ≈ 282.74

// // ─── Hook — identical logic to SettingsPage's useCountdown ───────────────────

// function useCountdown(active: boolean, total: number, onComplete: () => void) {
//   const [count, setCount] = useState(total);
//   const onCompleteRef = useRef(onComplete);

//   useEffect(() => {
//     onCompleteRef.current = onComplete;
//   });

//   useEffect(() => {
//     if (!active) return;

//     const interval = setInterval(() => {
//       setCount((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           onCompleteRef.current();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//       setCount(total);
//     };
//   }, [active, total]);

//   return count;
// }

// // ─── Component ───────────────────────────────────────────────────────────────

// export default function ForgotPasswordSuccessPage() {
//   const router = useRouter();

//   const handleComplete = useCallback(() => {
//     router.push('/login');
//   }, [router]);

//   const countdown = useCountdown(true, COUNTDOWN_SEC, handleComplete);

//   const strokeDashoffset = CIRCUMFERENCE * (1 - countdown / COUNTDOWN_SEC);

//   return (
//     <AuthShell>
//       <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Animated success icon */}
//         <div className="flex justify-center mb-8">
//           <div className="relative flex h-20 w-20 items-center justify-center">
//             {/* Ping ring */}
//             <div
//               aria-hidden
//               className="absolute inset-0 rounded-full animate-ping opacity-25"
//               style={{
//                 background:
//                   'radial-gradient(circle, #10B981 0%, transparent 70%)',
//               }}
//             />
//             {/* Outer glow ring */}
//             <div
//               className="absolute inset-0 rounded-full opacity-30"
//               style={{
//                 boxShadow: '0 0 40px 8px #10B981',
//               }}
//             />
//             {/* Icon container */}
//             <div
//               className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
//               style={{
//                 background:
//                   'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
//                 border: '1.5px solid rgba(16,185,129,0.4)',
//               }}
//             >
//               {/* Animated check mark */}
//               <svg
//                 viewBox="0 0 32 32"
//                 fill="none"
//                 className="w-8 h-8"
//                 style={{ animation: 'checkDraw 0.5s ease-out 0.1s both' }}
//               >
//                 <style>{`
//                   @keyframes checkDraw {
//                     from { stroke-dashoffset: 40; opacity: 0; }
//                     to   { stroke-dashoffset: 0;  opacity: 1; }
//                   }
//                   .check-path {
//                     stroke-dasharray: 40;
//                     stroke-dashoffset: 0;
//                     animation: checkDraw 0.5s ease-out 0.1s both;
//                   }
//                 `}</style>
//                 <path
//                   className="check-path"
//                   d="M7 16l7 7 11-11"
//                   stroke="#10B981"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Text */}
//         <div className="text-center mb-8 space-y-2">
//           <h1 className="text-2xl font-bold text-white tracking-tight">
//             Password reset!
//           </h1>
//           <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
//             Your password has been updated successfully. You&apos;ll be
//             redirected to the login screen shortly.
//           </p>
//         </div>

//         {/* Circular countdown — mirrors SettingsPage modal exactly */}
//         <div className="flex justify-center mb-8">
//           <div
//             className="relative flex items-center justify-center"
//             role="timer"
//             aria-label={`Redirecting in ${countdown} seconds`}
//           >
//             <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
//               {/* Track */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 className="fill-none"
//                 stroke="rgba(255,255,255,0.06)"
//                 strokeWidth="6"
//               />
//               {/* Progress arc */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 className="fill-none transition-all duration-1000 ease-linear"
//                 stroke="url(#successGrad)"
//                 strokeWidth="6"
//                 strokeDasharray={CIRCUMFERENCE}
//                 strokeDashoffset={strokeDashoffset}
//                 strokeLinecap="round"
//               />
//               <defs>
//                 <linearGradient
//                   id="successGrad"
//                   x1="0%"
//                   y1="0%"
//                   x2="100%"
//                   y2="0%"
//                 >
//                   <stop offset="0%" stopColor="#10B981" />
//                   <stop offset="100%" stopColor="#0891B2" />
//                 </linearGradient>
//               </defs>
//             </svg>

//             {/* Number */}
//             <span
//               aria-hidden
//               className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white tabular-nums"
//             >
//               {countdown}
//             </span>
//           </div>
//         </div>

//         {/* Skip button */}
//         <Button
//           onClick={handleComplete}
//           variant="outline"
//           className="w-full h-12 rounded-xl border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-200"
//         >
//           Go to login now
//         </Button>

//         {/* Decorative divider with label */}
//         <div className="mt-6 flex items-center gap-3">
//           <div className="flex-1 h-px bg-white/[0.06]" />
//           <span className="text-xs text-white/20 font-mono">
//             SECURE REDIRECT
//           </span>
//           <div className="flex-1 h-px bg-white/[0.06]" />
//         </div>
//       </div>
//     </AuthShell>
//   );
// }
