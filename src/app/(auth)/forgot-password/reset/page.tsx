// src/app/(auth)/forgot-password/reset/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import type { AxiosError } from 'axios';

import { Button } from '@/src/components/ui/button';
import {
  PageShell,
  AuthBrandMark,
  AuthInput,
} from '@/src/components/auth/PageShell';
import { authService } from '@/src/services/auth.service';
import { resetPasswordSchema, ResetPasswordForm } from '@/src/lib/schemas';
import { passwordResetStore } from '@/src/lib/password-reset-store';
import { cn } from '@/src/components/ui/utils';

function getErrorMessage(error: unknown): string {
  const e = error as AxiosError<{ error?: string }> | undefined;
  return (
    e?.response?.data?.error ??
    e?.message ??
    'Something went wrong. Please try again.'
  );
}

/* ── Password strength bar ─────────────────────────────────────────────── */
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {checks.map((ok, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < score ? colors[score] : 'rgba(128,128,128,0.15)',
            }}
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color: colors[score] }}>
        {labels[score]}
      </p>
    </div>
  );
}

/* ── Password field with show/hide ─────────────────────────────────────── */
function PasswordField({
  id,
  label,
  placeholder,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
}) {
  const [show, setShow] = useState(false);

  return (
    <AuthInput
      id={id}
      label={label}
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      icon={Lock}
      error={error}
      rightElement={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="text-gray-350 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/55 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...registration}
    />
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function ForgotPasswordResetPage() {
  const router = useRouter();

  // Snapshot store once at mount — prevents guard from re-firing mid-navigation
  const storeSnapshot = useRef(passwordResetStore.get());
  const store = storeSnapshot.current;

  useEffect(() => {
    if (!store.phone || !store.code) {
      router.replace('/forgot-password');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone: store.phone ?? '',
      code: store.code ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('password', '');

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      router.push('/forgot-password/success');
    },
  });

  const onSubmit = (data: ResetPasswordForm) => mutation.mutate(data);

  const requirements = [
    { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPasswordValue) },
    { label: 'One number', met: /[0-9]/.test(newPasswordValue) },
  ];

  return (
    <PageShell>
      <div className="flex flex-col items-center">
        {/* ── Back link ── */}
        <Link
          href="/forgot-password/verify"
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
          Back
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
                  s < 3
                    ? 'w-8 bg-gray-300 dark:bg-white/20'
                    : 'w-8 bg-linear-to-r from-emerald-500 to-cyan-500'
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 dark:text-white/30 font-mono tabular-nums">
              3 / 3
            </span>
          </div>

          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            Create new password
          </h1>
          <p className="text-[13.5px] text-gray-400 dark:text-white/50 mb-7 leading-relaxed">
            Choose something strong and unique. You&apos;ll use this to sign in
            going forward.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden fields */}
            <input type="hidden" {...register('phone')} />
            <input type="hidden" {...register('code')} />

            {mutation.isError && (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]
                border-red-200 bg-red-50/80 text-red-600
                dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {getErrorMessage(mutation.error)}
              </div>
            )}

            <PasswordField
              id="password"
              label="New Password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              registration={register('password')}
            />

            {/* Strength + requirements */}
            {newPasswordValue && (
              <div
                className="rounded-xl border px-4 py-3 space-y-3
                border-gray-100 bg-gray-50/50 dark:border-white/6 dark:bg-white/2"
              >
                <StrengthBar password={newPasswordValue} />
                <div className="space-y-1.5">
                  {requirements.map(({ label, met }) => (
                    <div key={label} className="flex items-center gap-2">
                      <CheckCircle2
                        className={cn(
                          'h-3.5 w-3.5 transition-colors duration-200 shrink-0',
                          met
                            ? 'text-emerald-500'
                            : 'text-gray-200 dark:text-white/15',
                        )}
                      />
                      <span
                        className={cn(
                          'text-[12px] transition-colors duration-200',
                          met
                            ? 'text-gray-600 dark:text-white/60'
                            : 'text-gray-300 dark:text-white/22',
                        )}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              registration={register('confirmPassword')}
            />

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
              }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password…
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

// // src/app/(auth)/forgot-password/reset/page.tsx

// 'use client';

// /**
//  * /app/(auth)/forgot-password/reset/page.tsx
//  *
//  * Step 3 of the password-reset flow.
//  * User creates a new password.
//  * On success → redirects to /forgot-password/success
//  */

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useMutation } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import {
//   Eye,
//   EyeOff,
//   Lock,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
// } from 'lucide-react';
// import Link from 'next/link';
// import type { AxiosError } from 'axios';

// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Label } from '@/src/components/ui/label';
// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { authService } from '@/src/services/auth.service';
// import { resetPasswordSchema, ResetPasswordForm } from '@/src/lib/schemas';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// function getErrorMessage(error: unknown): string {
//   const e = error as AxiosError<{ error?: string }> | undefined;
//   return (
//     e?.response?.data?.error ??
//     e?.message ??
//     'Something went wrong. Please try again.'
//   );
// }

// /** Password strength indicator */
// function StrengthBar({ password }: { password: string }) {
//   const checks = [
//     password.length >= 8,
//     /[A-Z]/.test(password),
//     /[0-9]/.test(password),
//     /[^A-Za-z0-9]/.test(password),
//   ];
//   const score = checks.filter(Boolean).length;
//   const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
//   const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

//   if (!password) return null;

//   return (
//     <div className="space-y-1.5">
//       <div className="flex gap-1">
//         {checks.map((ok, i) => (
//           <div
//             key={i}
//             className="h-1 flex-1 rounded-full transition-all duration-300"
//             style={{
//               backgroundColor:
//                 i < score ? colors[score] : 'rgba(255,255,255,0.08)',
//             }}
//           />
//         ))}
//       </div>
//       <p className="text-xs" style={{ color: colors[score] }}>
//         {labels[score]}
//       </p>
//     </div>
//   );
// }

// /** Single password field with show/hide toggle */
// function PasswordField({
//   id,
//   label,
//   placeholder,
//   registration,
//   error,
// }: {
//   id: string;
//   label: string;
//   placeholder: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   registration: any;
//   error?: string;
// }) {
//   const [show, setShow] = useState(false);
//   const [focused, setFocused] = useState(false);

//   return (
//     <div className="space-y-2">
//       <Label
//         htmlFor={id}
//         className="text-white/60 text-xs font-medium uppercase tracking-wider"
//       >
//         {label}
//       </Label>
//       <div
//         className={`relative rounded-xl border transition-all duration-200 ${
//           focused
//             ? 'border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
//             : 'border-white/10'
//         } bg-white/[0.04]`}
//       >
//         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
//         <Input
//           id={id}
//           type={show ? 'text' : 'password'}
//           placeholder={placeholder}
//           className="border-0 bg-transparent pl-10 pr-11 h-12 text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
//           onFocus={() => setFocused(true)}
//           onBlur={() => setFocused(false)}
//           {...registration}
//         />
//         <button
//           type="button"
//           onClick={() => setShow((s) => !s)}
//           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
//           tabIndex={-1}
//         >
//           {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//         </button>
//       </div>
//       {error && <p className="text-xs text-red-400">{error}</p>}
//     </div>
//   );
// }

// export default function ForgotPasswordResetPage() {
//   const router = useRouter();

//   // Snapshot the store ONCE at mount time into a ref.
//   // This prevents the guard from re-firing mid-navigation when the store
//   // is still being populated or when we're transitioning away.
//   const storeSnapshot = useRef(passwordResetStore.get());
//   const store = storeSnapshot.current;

//   useEffect(() => {
//     if (!store.phone || !store.code) {
//       router.replace('/forgot-password');
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // empty deps — run once on mount only

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm<ResetPasswordForm>({
//     resolver: zodResolver(resetPasswordSchema),
//     defaultValues: {
//       phone: store.phone ?? '',
//       code: store.code ?? '',
//       password: '',
//       confirmPassword: '',
//     },
//   });

//   const newPasswordValue = watch('password', '');

//   const mutation = useMutation({
//     mutationFn: authService.resetPassword,
//     onSuccess: () => {
//       // Do NOT clear the store here — the success page guard would fire
//       // before the route change completes and bounce back to step 1.
//       // The success page clears the store itself on mount.
//       router.push('/forgot-password/success');
//     },
//   });

//   const onSubmit = (data: ResetPasswordForm) => mutation.mutate(data);

//   const requirements = [
//     { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
//     { label: 'One uppercase letter', met: /[A-Z]/.test(newPasswordValue) },
//     { label: 'One number', met: /[0-9]/.test(newPasswordValue) },
//   ];

//   return (
//     <AuthShell>
//       <Link
//         href="/forgot-password/verify"
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
//         Back
//       </Link>

//       <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Step indicator */}
//         <div className="flex items-center gap-2 mb-6">
//           {[1, 2, 3].map((step) => (
//             <div
//               key={step}
//               className={`h-1.5 rounded-full transition-all duration-300 ${
//                 step < 3
//                   ? 'w-8 bg-white/20'
//                   : 'w-8 bg-gradient-to-r from-emerald-500 to-cyan-500'
//               }`}
//             />
//           ))}
//           <span className="ml-auto text-xs text-white/30 font-mono">3 / 3</span>
//         </div>

//         <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
//           Create new password
//         </h1>
//         <p className="text-sm text-white/50 mb-8 leading-relaxed">
//           Choose something strong and unique. You&apos;ll use this to sign in
//           going forward.
//         </p>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//           {/* Hidden fields */}
//           <input type="hidden" {...register('phone')} />
//           <input type="hidden" {...register('code')} />

//           {mutation.isError && (
//             <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
//               {getErrorMessage(mutation.error)}
//             </div>
//           )}

//           <PasswordField
//             id="password"
//             label="New Password"
//             placeholder="Create a strong password"
//             registration={register('password')}
//             error={errors.password?.message}
//           />

//           {newPasswordValue && (
//             <div className="space-y-2 px-1">
//               <StrengthBar password={newPasswordValue} />
//               <div className="space-y-1.5 pt-1">
//                 {requirements.map(({ label, met }) => (
//                   <div key={label} className="flex items-center gap-2">
//                     <CheckCircle2
//                       className={`h-3.5 w-3.5 transition-colors duration-200 ${
//                         met ? 'text-emerald-400' : 'text-white/15'
//                       }`}
//                     />
//                     <span
//                       className={`text-xs transition-colors duration-200 ${met ? 'text-white/60' : 'text-white/25'}`}
//                     >
//                       {label}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <PasswordField
//             id="confirmPassword"
//             label="Confirm New Password"
//             placeholder="Repeat your password"
//             registration={register('confirmPassword')}
//             error={errors.confirmPassword?.message}
//           />

//           <Button
//             type="submit"
//             disabled={mutation.isPending}
//             className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
//             style={{
//               background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
//             }}
//           >
//             {mutation.isPending ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Resetting password…
//               </>
//             ) : (
//               'Reset password'
//             )}
//           </Button>
//         </form>
//       </div>
//     </AuthShell>
//   );
// }

// // app/(auth)/forgot-password/reset/page.tsx

// 'use client';

// /**
//  * /app/(auth)/forgot-password/reset/page.tsx
//  *
//  * Step 3 of the password-reset flow.
//  * User creates a new password.
//  * On success → redirects to /forgot-password/success
//  */

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useMutation } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import {
//   Eye,
//   EyeOff,
//   Lock,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
// } from 'lucide-react';
// import Link from 'next/link';
// import type { AxiosError } from 'axios';

// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Label } from '@/src/components/ui/label';
// import { AuthShell, BrandMark } from '@/src/components/auth/AuthShell';
// import { authService } from '@/src/services/auth.service';
// import { resetPasswordSchema, ResetPasswordForm } from '@/src/lib/schemas';
// import { passwordResetStore } from '@/src/lib/password-reset-store';

// function getErrorMessage(error: unknown): string {
//   const e = error as AxiosError<{ error?: string }> | undefined;
//   return (
//     e?.response?.data?.error ??
//     e?.message ??
//     'Something went wrong. Please try again.'
//   );
// }

// /** Password strength indicator */
// function StrengthBar({ password }: { password: string }) {
//   const checks = [
//     password.length >= 8,
//     /[A-Z]/.test(password),
//     /[0-9]/.test(password),
//     /[^A-Za-z0-9]/.test(password),
//   ];
//   const score = checks.filter(Boolean).length;
//   const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
//   const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

//   if (!password) return null;

//   return (
//     <div className="space-y-1.5">
//       <div className="flex gap-1">
//         {checks.map((ok, i) => (
//           <div
//             key={i}
//             className="h-1 flex-1 rounded-full transition-all duration-300"
//             style={{
//               backgroundColor:
//                 i < score ? colors[score] : 'rgba(255,255,255,0.08)',
//             }}
//           />
//         ))}
//       </div>
//       <p className="text-xs" style={{ color: colors[score] }}>
//         {labels[score]}
//       </p>
//     </div>
//   );
// }

// /** Single password field with show/hide toggle */
// function PasswordField({
//   id,
//   label,
//   placeholder,
//   registration,
//   error,
// }: {
//   id: string;
//   label: string;
//   placeholder: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   registration: any;
//   error?: string;
// }) {
//   const [show, setShow] = useState(false);
//   const [focused, setFocused] = useState(false);

//   return (
//     <div className="space-y-2">
//       <Label
//         htmlFor={id}
//         className="text-white/60 text-xs font-medium uppercase tracking-wider"
//       >
//         {label}
//       </Label>
//       <div
//         className={`relative rounded-xl border transition-all duration-200 ${
//           focused
//             ? 'border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
//             : 'border-white/10'
//         } bg-white/4`}
//       >
//         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
//         <Input
//           id={id}
//           type={show ? 'text' : 'password'}
//           placeholder={placeholder}
//           className="border-0 bg-transparent pl-10 pr-11 h-12 text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
//           onFocus={() => setFocused(true)}
//           onBlur={() => setFocused(false)}
//           {...registration}
//         />
//         <button
//           type="button"
//           onClick={() => setShow((s) => !s)}
//           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
//           tabIndex={-1}
//         >
//           {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//         </button>
//       </div>
//       {error && <p className="text-xs text-red-400">{error}</p>}
//     </div>
//   );
// }

// export default function ForgotPasswordResetPage() {
//   const router = useRouter();
//   const store = passwordResetStore.get();

//   useEffect(() => {
//     if (!store.phone || !store.code) {
//       router.replace('/forgot-password');
//     }
//   }, [store.phone, store.code, router]);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm<ResetPasswordForm>({
//     resolver: zodResolver(resetPasswordSchema),
//     defaultValues: {
//       phone: store.phone ?? '',
//       code: store.code ?? '',
//       password: '',
//       confirmPassword: '',
//     },
//   });

//   const newPasswordValue = watch('password', '');

//   const mutation = useMutation({
//     mutationFn: authService.resetPassword,
//     onSuccess: () => {
//       passwordResetStore.clear();
//       router.push('/forgot-password/success');
//     },
//   });

//   const onSubmit = (data: ResetPasswordForm) => mutation.mutate(data);

//   const requirements = [
//     { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
//     { label: 'One uppercase letter', met: /[A-Z]/.test(newPasswordValue) },
//     { label: 'One number', met: /[0-9]/.test(newPasswordValue) },
//   ];

//   return (
//     <AuthShell>
//       <Link
//         href="/forgot-password/verify"
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
//         Back
//       </Link>

//       <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-8">
//         <BrandMark />

//         {/* Step indicator */}
//         <div className="flex items-center gap-2 mb-6">
//           {[1, 2, 3].map((step) => (
//             <div
//               key={step}
//               className={`h-1.5 rounded-full transition-all duration-300 ${
//                 step < 3
//                   ? 'w-8 bg-white/20'
//                   : 'w-8 bg-linear-to-r from-emerald-500 to-cyan-500'
//               }`}
//             />
//           ))}
//           <span className="ml-auto text-xs text-white/30 font-mono">3 / 3</span>
//         </div>

//         <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
//           Create new password
//         </h1>
//         <p className="text-sm text-white/50 mb-8 leading-relaxed">
//           Choose something strong and unique. You&apos;ll use this to sign in
//           going forward.
//         </p>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//           {/* Hidden fields */}
//           <input type="hidden" {...register('phone')} />
//           <input type="hidden" {...register('code')} />

//           {mutation.isError && (
//             <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
//               {getErrorMessage(mutation.error)}
//             </div>
//           )}

//           <PasswordField
//             id="password"
//             label="New Password"
//             placeholder="Create a strong password"
//             registration={register('password')}
//             error={errors.password?.message}
//           />

//           {newPasswordValue && (
//             <div className="space-y-2 px-1">
//               <StrengthBar password={newPasswordValue} />
//               <div className="space-y-1.5 pt-1">
//                 {requirements.map(({ label, met }) => (
//                   <div key={label} className="flex items-center gap-2">
//                     <CheckCircle2
//                       className={`h-3.5 w-3.5 transition-colors duration-200 ${
//                         met ? 'text-emerald-400' : 'text-white/15'
//                       }`}
//                     />
//                     <span
//                       className={`text-xs transition-colors duration-200 ${met ? 'text-white/60' : 'text-white/25'}`}
//                     >
//                       {label}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <PasswordField
//             id="confirmPassword"
//             label="Confirm New Password"
//             placeholder="Repeat your password"
//             registration={register('confirmPassword')}
//             error={errors.confirmPassword?.message}
//           />

//           <Button
//             type="submit"
//             disabled={mutation.isPending}
//             className="w-full h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
//             style={{
//               background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
//             }}
//           >
//             {mutation.isPending ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Resetting password…
//               </>
//             ) : (
//               'Reset password'
//             )}
//           </Button>
//         </form>
//       </div>
//     </AuthShell>
//   );
// }
