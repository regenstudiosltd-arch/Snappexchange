// src/components/auth/LoginEnhanced.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Lock,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { loginSchema, LoginForm } from '@/src/lib/schemas';
import { PageShell, AuthBrandMark, AuthInput } from './PageShell';

interface LoginEnhancedProps {
  onSuccess: () => void;
  onNavigate: (view: string) => void;
}

export function LoginEnhanced({ onSuccess, onNavigate }: LoginEnhancedProps) {
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        login_field: data.login_field,
        password: data.password,
        remember_me: data.rememberMe,
      });

      if (result?.error) {
        setLoginError(result.error);
      } else if (result?.ok) {
        onSuccess();
      }
    } catch {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col items-center">
        {/* ── Back to home ── */}
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 mb-6 text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/70 text-sm transition-colors duration-200 w-full max-w-md"
        >
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        {/* ── Card ── */}
        <div
          className="w-full max-w-md rounded-2xl border backdrop-blur-xl p-8 transition-colors duration-300
          bg-white/75 border-gray-200/70 shadow-[0_24px_80px_rgba(0,0,0,0.08)]
          dark:bg-white/3 dark:border-white/[0.07] dark:shadow-none"
          style={{
            animation: 'loginCardIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes loginCardIn {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <AuthBrandMark />

          {/* ── Heading ── */}
          <div className="mb-7">
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
              Welcome back
            </h1>
            <p className="text-[13.5px] text-gray-400 dark:text-white/40 mt-1 leading-relaxed">
              Sign in to your SnappX account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ── Error banner ── */}
            {loginError && (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]
                border-red-200 bg-red-50/80 text-red-600
                dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {loginError}
              </div>
            )}

            {/* ── Email / Phone ── */}
            <AuthInput
              id="login_field"
              label="Email or Phone Number"
              placeholder="you@email.com or 0551234567"
              icon={Phone}
              error={errors.login_field?.message}
              {...register('login_field')}
            />

            {/* ── Password ── */}
            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-gray-350 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/55 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              {...register('password')}
            />

            {/* ── Remember me + Forgot password ── */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-md border-gray-300 dark:border-white/20 text-amber-500
                    dark:checked:bg-amber-500 focus:ring-amber-400/20 focus:ring-offset-0
                    bg-white/80 dark:bg-white/5 transition-colors cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-[13px] text-gray-400 dark:text-white/35 group-hover:text-gray-600 dark:group-hover:text-white/55 transition-colors">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[13px] text-amber-600/90 dark:text-amber-500/75 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-white border-0 mt-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* ── Sign up link ── */}
          <div className="mt-7 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-[13px]">
            <span className="text-gray-400 dark:text-white/28">
              New to SnappX?{' '}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// // src/components/auth/LoginEnhanced.tsx

// 'use client';

// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { signIn } from 'next-auth/react';
// import {
//   Mail,
//   Lock,
//   ArrowRight,
//   AlertCircle,
//   LucideChevronLeft,
//   Loader2,
//   Eye,
//   EyeOff,
// } from 'lucide-react';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import Link from 'next/link';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { loginSchema, LoginForm } from '@/src/lib/schemas';

// interface LoginEnhancedProps {
//   onSuccess: () => void;
//   onNavigate: (view: string) => void;
// }

// export function LoginEnhanced({ onSuccess, onNavigate }: LoginEnhancedProps) {
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       rememberMe: false,
//     },
//   });

//   const onSubmit = async (data: LoginForm) => {
//     setIsLoading(true);
//     setError('');

//     try {
//       const result = await signIn('credentials', {
//         redirect: false,
//         login_field: data.login_field,
//         password: data.password,
//         remember_me: data.rememberMe,
//       });

//       if (result?.error) {
//         setError(result.error);
//       } else if (result?.ok) {
//         onSuccess();
//       }
//     } catch {
//       setError('An unexpected error occurred.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Link href="/" className="inline-block mb-4">
//         <div className="group flex items-center gap-2 px-3 py-2 rounded-lg w-fit transition-all duration-200 cursor-pointer hover:bg-muted/60">
//           <LucideChevronLeft className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-foreground" />
//           <h3 className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
//             Back to home
//           </h3>
//         </div>
//       </Link>

//       <div className="min-h-screen flex items-center justify-center px-4 pb-8 pt-3">
//         <Card className="w-full max-w-md bg-card border-border shadow-xl rounded-2xl overflow-hidden">
//           <CardHeader className="text-center pb-6 pt-10">
//             <div className="flex justify-center mb-4">
//               <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-[#DC2626] via-[#F59E0B] to-[#059669]">
//                 <span className="text-white text-xl">SX</span>
//               </div>
//             </div>
//             <CardTitle className="text-2xl font-bold text-foreground">
//               Welcome Back
//             </CardTitle>
//             <CardDescription className="text-muted-foreground mt-2">
//               Login to your SnappX account
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="px-6 pb-10">
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//               {error && (
//                 <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3">
//                   <AlertCircle className="h-5 w-5 shrink-0" />
//                   <span>{error}</span>
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <Label htmlFor="login_field" className="text-foreground">
//                   Email or Phone Number
//                 </Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
//                   <Input
//                     id="login_field"
//                     placeholder="Enter your email or phone"
//                     className="pl-11 bg-background h-11"
//                     {...register('login_field')}
//                   />
//                 </div>
//                 {errors.login_field && (
//                   <p className="text-xs text-destructive mt-1">
//                     {errors.login_field.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-foreground">
//                   Password
//                 </Label>

//                 <div className="relative">
//                   <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />

//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your password"
//                     className="pl-11 pr-11 bg-background h-11"
//                     {...register('password')}
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>

//                 {errors.password && (
//                   <p className="text-xs text-destructive mt-1">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center justify-between pt-2">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="rounded border-border text-primary focus:ring-primary"
//                     {...register('rememberMe')}
//                   />
//                   <span className="text-sm text-muted-foreground">
//                     Remember me
//                   </span>
//                 </label>

//                 <button
//                   type="button"
//                   onClick={() => onNavigate('forgot-password')}
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Forgot password?
//                 </button>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium mt-2"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin mr-2" />
//                     Signing in...
//                   </>
//                 ) : (
//                   <>
//                     Login
//                     <ArrowRight className="ml-2 h-5 w-5 transition-transform" />
//                   </>
//                 )}
//               </Button>

//               <div className="text-center text-sm text-muted-foreground pt-4">
//                 Don&apos;t have an account?{' '}
//                 <button
//                   type="button"
//                   onClick={() => onNavigate('signup')}
//                   className="text-primary hover:underline font-medium"
//                 >
//                   Sign up
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// }
