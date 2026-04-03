// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/src/components/ui/button';
import {
  PageShell,
  AuthBrandMark,
  AuthInput,
} from '@/src/components/auth/PageShell';
import { authService } from '@/src/services/auth.service';
import { forgotPasswordSchema, ForgotPasswordForm } from '@/src/lib/schemas';
import { passwordResetStore } from '@/src/lib/password-reset-store';
import type { AxiosError } from 'axios';

function getErrorMessage(error: unknown): string {
  const e = error as AxiosError<{ error?: string }> | undefined;
  return (
    e?.response?.data?.error ??
    e?.message ??
    'Something went wrong. Please try again.'
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { login_field: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordForm) =>
      authService.forgotPassword(data.login_field),
    onSuccess: (data) => {
      passwordResetStore.set({
        phone: data.phone,
        maskedPhone: data.masked_phone || data.phone,
      });
      router.push('/forgot-password/verify');
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => mutation.mutate(data);

  return (
    <PageShell>
      <div className="flex flex-col items-center">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 mb-6 text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/80 text-sm transition-colors duration-200 w-full max-w-md"
        >
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to login
        </Link>

        <div className="w-full max-w-md rounded-2xl border backdrop-blur-xl p-8 ...">
          {' '}
          {/* keep your existing card styles */}
          <AuthBrandMark />
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === 1
                    ? 'w-8 bg-linear-to-r from-red-500 to-amber-500'
                    : 'w-4 bg-gray-200 dark:bg-white/10'
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 dark:text-white/30 font-mono tabular-nums">
              1 / 3
            </span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-[13.5px] text-gray-400 dark:text-white/50 mb-7 leading-relaxed">
            Enter your <strong>registered phone number</strong> and we’ll send
            you a 6-digit verification code via SMS.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mutation.isError && (
              <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] border-red-200 bg-red-50/80 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {getErrorMessage(mutation.error)}
              </div>
            )}

            <AuthInput
              id="login_field"
              label="Registered Phone Number"
              placeholder="0551234567 or +233551234567"
              icon={Phone}
              error={errors.login_field?.message}
              {...register('login_field')}
            />

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-12 rounded-xl font-semibold text-white ..."
              style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
              }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                <>
                  Send verification code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-[13px] text-gray-400 dark:text-white/25">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}

// // src/app/(auth)/forgot-password/page.tsx

// 'use client';

// import { useRouter } from 'next/navigation';
// import { useMutation } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ArrowRight, Loader2, AlertCircle, Phone } from 'lucide-react';
// import Link from 'next/link';
// import type { AxiosError } from 'axios';

// import { Button } from '@/src/components/ui/button';
// import {
//   PageShell,
//   AuthBrandMark,
//   AuthInput,
// } from '@/src/components/auth/PageShell';
// import { authService } from '@/src/services/auth.service';
// import { forgotPasswordSchema, ForgotPasswordForm } from '@/src/lib/schemas';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// function getErrorMessage(error: unknown): string {
//   const e = error as AxiosError<{ error?: string }> | undefined;
//   return (
//     e?.response?.data?.error ??
//     e?.message ??
//     'Something went wrong. Please try again.'
//   );
// }

// export default function ForgotPasswordPage() {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordForm>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: { login_field: '' },
//   });

//   const mutation = useMutation({
//     mutationFn: (data: ForgotPasswordForm) =>
//       authService.forgotPassword(data.login_field),
//     onSuccess: (data) => {
//       passwordResetStore.set({
//         phone: data.phone,
//         maskedPhone: data.masked_phone || data.phone,
//       });
//       router.push('/forgot-password/verify');
//     },
//   });

//   const onSubmit = (data: ForgotPasswordForm) => mutation.mutate(data);

//   return (
//     <PageShell>
//       <div className="flex flex-col items-center">
//         {/* ── Back link ── */}
//         <Link
//           href="/login"
//           className="group inline-flex items-center gap-2 mb-6 text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/80 text-sm transition-colors duration-200 w-full max-w-md"
//         >
//           <svg
//             className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
//             viewBox="0 0 16 16"
//             fill="none"
//           >
//             <path
//               d="M10 12L6 8l4-4"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           Back to login
//         </Link>

//         {/* ── Card ── */}
//         <div
//           className="w-full max-w-md rounded-2xl border backdrop-blur-xl p-8 transition-colors duration-300
//             bg-white/75 border-gray-200/70 shadow-[0_24px_80px_rgba(0,0,0,0.08)]
//             dark:bg-white/3 dark:border-white/8 dark:shadow-none"
//           style={{
//             animation: 'fpCardIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
//           }}
//         >
//           <style>{`
//             @keyframes fpCardIn {
//               from { opacity: 0; transform: translateY(16px); }
//               to   { opacity: 1; transform: translateY(0); }
//             }
//           `}</style>

//           <AuthBrandMark />

//           {/* Step indicator */}
//           <div className="flex items-center gap-2 mb-6">
//             {[1, 2, 3].map((s) => (
//               <div
//                 key={s}
//                 className={`h-1.5 rounded-full transition-all duration-300 ${
//                   s === 1
//                     ? 'w-8 bg-linear-to-r from-red-500 to-amber-500'
//                     : 'w-4 bg-gray-200 dark:bg-white/10'
//                 }`}
//               />
//             ))}
//             <span className="ml-auto text-xs text-gray-400 dark:text-white/30 font-mono tabular-nums">
//               1 / 3
//             </span>
//           </div>

//           <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
//             Forgot your password?
//           </h1>
//           <p className="text-[13.5px] text-gray-400 dark:text-white/50 mb-7 leading-relaxed">
//             No worries. Enter the email or phone number linked to your SnappX
//             account and we&apos;ll send you a verification code.
//           </p>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             {/* Error banner */}
//             {mutation.isError && (
//               <div
//                 className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]
//                 border-red-200 bg-red-50/80 text-red-600
//                 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
//               >
//                 <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
//                 {getErrorMessage(mutation.error)}
//               </div>
//             )}

//             <AuthInput
//               id="login_field"
//               label="Email or Phone Number"
//               placeholder="you@email.com or 0551234567"
//               icon={Phone}
//               error={errors.login_field?.message}
//               {...register('login_field')}
//             />

//             <Button
//               type="submit"
//               disabled={mutation.isPending}
//               className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
//               style={{
//                 background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
//               }}
//             >
//               {mutation.isPending ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Sending code…
//                 </>
//               ) : (
//                 <>
//                   Send verification code
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </>
//               )}
//             </Button>
//           </form>

//           <p className="mt-6 text-center text-[13px] text-gray-400 dark:text-white/25">
//             Remember your password?{' '}
//             <Link
//               href="/login"
//               className="text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-400 font-semibold transition-colors"
//             >
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </PageShell>
//   );
// }

// // src/app/(auth)/forgot-password/page.tsx

// 'use client';

// /**
//  * /app/(auth)/forgot-password/page.tsx
//  *
//  * Step 1 of the password-reset flow.
//  * User enters their email or MoMo phone number.
//  * On success → redirects to /forgot-password/verify
//  */

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useMutation } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ArrowRight, Loader2, AlertCircle, Phone } from 'lucide-react';
// import Link from 'next/link';
// import type { AxiosError } from 'axios';

// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Label } from '@/src/components/ui/label';
// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { authService } from '@/src/services/auth.service';
// import { forgotPasswordSchema, ForgotPasswordForm } from '@/src/lib/schemas';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// function getErrorMessage(error: unknown): string {
//   const e = error as AxiosError<{ error?: string }> | undefined;
//   return (
//     e?.response?.data?.error ??
//     e?.message ??
//     'Something went wrong. Please try again.'
//   );
// }

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const [inputFocused, setInputFocused] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordForm>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: { login_field: '' },
//   });

//   const mutation = useMutation({
//     mutationFn: (data: ForgotPasswordForm) =>
//       authService.forgotPassword(data.login_field),
//     onSuccess: (data) => {
//       passwordResetStore.set({
//         phone: data.phone,
//         maskedPhone: data.masked_phone || data.phone,
//       });
//       router.push('/forgot-password/verify');
//     },
//   });

//   const onSubmit = (data: ForgotPasswordForm) => mutation.mutate(data);

//   return (
//     <AuthShell>
//       {/* Back link */}
//       <Link
//         href="/login"
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
//         Back to login
//       </Link>

//       {/* Card */}
//       <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Step indicator */}
//         <div className="flex items-center gap-2 mb-6">
//           {[1, 2, 3].map((step) => (
//             <div key={step} className="flex items-center gap-2">
//               <div
//                 className={`h-1.5 rounded-full transition-all duration-300 ${
//                   step === 1
//                     ? 'w-8 bg-linear-to-r from-red-500 to-amber-500'
//                     : 'w-4 bg-white/10'
//                 }`}
//               />
//             </div>
//           ))}
//           <span className="ml-auto text-xs text-white/30 font-mono">1 / 3</span>
//         </div>

//         <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
//           Forgot your password?
//         </h1>
//         <p className="text-sm text-white/50 mb-8 leading-relaxed">
//           No worries. Enter the email or phone number linked to your SnappX
//           account and we&apos;ll send you a verification code.
//         </p>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//           {/* Error banner */}
//           {mutation.isError && (
//             <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
//               {getErrorMessage(mutation.error)}
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label
//               htmlFor="login_field"
//               className="text-white/60 text-xs font-medium uppercase tracking-wider"
//             >
//               Email or Phone Number
//             </Label>

//             <div
//               className={`relative rounded-xl border transition-all duration-200 ${
//                 inputFocused
//                   ? 'border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
//                   : 'border-white/10'
//               } bg-white/4`}
//             >
//               <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
//               <Input
//                 id="login_field"
//                 placeholder="you@email.com or 0551234567"
//                 className="border-0 bg-transparent pl-10 h-12 text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
//                 onFocus={() => setInputFocused(true)}
//                 {...register('login_field', {
//                   onBlur: () => setInputFocused(false),
//                 })}
//               />
//             </div>

//             {errors.login_field && (
//               <p className="text-xs text-red-400 mt-1">
//                 {errors.login_field.message}
//               </p>
//             )}
//           </div>

//           <Button
//             type="submit"
//             disabled={mutation.isPending}
//             className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
//             style={{
//               background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
//             }}
//           >
//             {mutation.isPending ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Sending code…
//               </>
//             ) : (
//               <>
//                 Send verification code
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </>
//             )}
//           </Button>
//         </form>

//         <p className="mt-6 text-center text-xs text-white/25">
//           Remember your password?{' '}
//           <Link
//             href="/login"
//             className="text-amber-500/80 hover:text-amber-400 transition-colors"
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </AuthShell>
//   );
// }

// 'use client';

// /**
//  * /app/(auth)/forgot-password/page.tsx
//  *
//  * Step 1 of the password-reset flow.
//  * User enters their email or MoMo phone number.
//  * On success → redirects to /forgot-password/verify
//  */

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useMutation } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ArrowRight, Loader2, AlertCircle, Phone } from 'lucide-react';
// import Link from 'next/link';
// import type { AxiosError } from 'axios';

// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Label } from '@/src/components/ui/label';
// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { authService } from '@/src/services/auth.service';
// import { forgotPasswordSchema, ForgotPasswordForm } from '@/src/lib/schemas';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// function getErrorMessage(error: unknown): string {
//   const e = error as AxiosError<{ error?: string }> | undefined;
//   return (
//     e?.response?.data?.error ??
//     e?.message ??
//     'Something went wrong. Please try again.'
//   );
// }

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const [inputFocused, setInputFocused] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordForm>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: { login_field: '' },
//   });

//   const mutation = useMutation({
//     mutationFn: (data: ForgotPasswordForm) =>
//       authService.forgotPassword(data.login_field),
//     onSuccess: (data) => {
//       passwordResetStore.set({
//         phone: data.phone,
//         maskedPhone: data.masked_phone || data.phone,
//       });
//       router.push('/forgot-password/verify');
//     },
//   });

//   const onSubmit = (data: ForgotPasswordForm) => mutation.mutate(data);

//   return (
//     <AuthShell>
//       {/* Back link */}
//       <Link
//         href="/login"
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
//         Back to login
//       </Link>

//       {/* Card */}
//       <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Step indicator */}
//         <div className="flex items-center gap-2 mb-6">
//           {[1, 2, 3].map((step) => (
//             <div key={step} className="flex items-center gap-2">
//               <div
//                 className={`h-1.5 rounded-full transition-all duration-300 ${
//                   step === 1
//                     ? 'w-8 bg-gradient-to-r from-red-500 to-amber-500'
//                     : 'w-4 bg-white/10'
//                 }`}
//               />
//             </div>
//           ))}
//           <span className="ml-auto text-xs text-white/30 font-mono">1 / 3</span>
//         </div>

//         <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
//           Forgot your password?
//         </h1>
//         <p className="text-sm text-white/50 mb-8 leading-relaxed">
//           No worries. Enter the email or phone number linked to your SnappX
//           account and we&apos;ll send you a verification code.
//         </p>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//           {/* Error banner */}
//           {mutation.isError && (
//             <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
//               {getErrorMessage(mutation.error)}
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label
//               htmlFor="login_field"
//               className="text-white/60 text-xs font-medium uppercase tracking-wider"
//             >
//               Email or Phone Number
//             </Label>

//             <div
//               className={`relative rounded-xl border transition-all duration-200 ${
//                 inputFocused
//                   ? 'border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
//                   : 'border-white/10'
//               } bg-white/[0.04]`}
//             >
//               <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
//               <Input
//                 id="login_field"
//                 placeholder="you@email.com or 0551234567"
//                 className="border-0 bg-transparent pl-10 h-12 text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
//                 onFocus={() => setInputFocused(true)}
//                 onBlur={() => setInputFocused(false)}
//                 {...register('login_field')}
//               />
//             </div>

//             {errors.login_field && (
//               <p className="text-xs text-red-400 mt-1">
//                 {errors.login_field.message}
//               </p>
//             )}
//           </div>

//           <Button
//             type="submit"
//             disabled={mutation.isPending}
//             className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
//             style={{
//               background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
//             }}
//           >
//             {mutation.isPending ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Sending code…
//               </>
//             ) : (
//               <>
//                 Send verification code
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </>
//             )}
//           </Button>
//         </form>

//         <p className="mt-6 text-center text-xs text-white/25">
//           Remember your password?{' '}
//           <Link
//             href="/login"
//             className="text-amber-500/80 hover:text-amber-400 transition-colors"
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </AuthShell>
//   );
// }
