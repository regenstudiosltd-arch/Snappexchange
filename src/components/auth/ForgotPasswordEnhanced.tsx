// src/components/auth/ForgotPasswordEnhanced.tsx

'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { OTPVerification } from './OTPVerification';
import { authService } from '@/src/services/auth.service';
import {
  forgotPasswordSchema,
  ForgotPasswordForm,
  resetPasswordSchema,
  ResetPasswordForm,
} from '@/src/lib/schemas';
import type { AxiosError } from 'axios';

const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Something went wrong. Please try again.';

  const axiosError = error as AxiosError<{ error?: string }>;
  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error;
  }
  if (axiosError.message) {
    return axiosError.message;
  }
  return 'Something went wrong. Please try again.';
};

type Step = 'email' | 'otp' | 'new-password' | 'success';

export function ForgotPasswordEnhanced() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [phone, setPhone] = useState<string>('');
  const [maskedPhone, setMaskedPhone] = useState<string>('');

  // Step 1: Request OTP
  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (data) => {
      setPhone(data.phone);
      setMaskedPhone(data.masked_phone || data.phone);
      setStep('otp');
    },
  });

  // Step 3: Reset Password
  const resetMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => setStep('success'),
  });

  const emailForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { login_field: '' },
  });

  const passwordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { phone: '', code: '', password: '', confirmPassword: '' },
  });

  const onEmailSubmit = (data: ForgotPasswordForm) => {
    forgotMutation.mutate(data.login_field);
  };

  const handleOtpSuccess = (code: string) => {
    passwordForm.setValue('phone', phone);
    passwordForm.setValue('code', code);
    setStep('new-password');
  };

  const onPasswordSubmit = (data: ResetPasswordForm) => {
    resetMutation.mutate(data);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-base">
              Your password has been updated. You can now log in with your new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6 pt-10">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-red-600 via-amber-500 to-emerald-600">
              <span className="text-white text-2xl font-bold">SX</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 'email' && 'Enter your email or phone number'}
            {step === 'otp' && `We sent a code to ${maskedPhone}`}
            {step === 'new-password' && 'Create a new password'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-10">
          {/* STEP 1: EMAIL / PHONE */}
          {step === 'email' && (
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="login_field">Email or Phone Number</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="login_field"
                    placeholder="you@email.com or 0551234567"
                    className="pl-11"
                    {...emailForm.register('login_field')}
                  />
                </div>
                {emailForm.formState.errors.login_field && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.login_field.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={forgotMutation.isPending}
              >
                {forgotMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {forgotMutation.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {getErrorMessage(forgotMutation.error)}
                </div>
              )}
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <OTPVerification
              phoneNumber={phone}
              onVerifySuccess={handleOtpSuccess} // ← now type-safe
            />
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'new-password' && (
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('password')}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register('confirmPassword')}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              {resetMutation.isError && (
                <div className="text-sm text-destructive text-center">
                  {getErrorMessage(resetMutation.error)}
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('otp')}
                className="w-full text-muted-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to OTP
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import {
//   Mail,
//   ArrowRight,
//   ArrowLeft,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Label } from '@/src/components/ui/label';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/src/components/ui/card';
// import { OTPVerification } from './OTPVerification';
// import { authService } from '@/src/services/auth.service';
// import {
//   forgotPasswordSchema,
//   ForgotPasswordForm,
//   resetPasswordSchema,
//   ResetPasswordForm,
// } from '@/src/lib/schemas';

// type Step = 'email' | 'otp' | 'new-password' | 'success';

// export function ForgotPasswordEnhanced() {
//   const router = useRouter();
//   const [step, setStep] = useState<Step>('email');
//   const [phone, setPhone] = useState<string>('');
//   const [maskedPhone, setMaskedPhone] = useState<string>('');

//   // Step 1: Request OTP
//   const forgotMutation = useMutation({
//     mutationFn: authService.forgotPassword,
//     onSuccess: (data) => {
//       setPhone(data.phone);
//       setMaskedPhone(data.masked_phone || data.phone);
//       setStep('otp');
//     },
//   });

//   // Step 3: Reset Password
//   const resetMutation = useMutation({
//     mutationFn: authService.resetPassword,
//     onSuccess: () => setStep('success'),
//   });

//   const emailForm = useForm<ForgotPasswordForm>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: { login_field: '' },
//   });

//   const passwordForm = useForm<ResetPasswordForm>({
//     resolver: zodResolver(resetPasswordSchema),
//     defaultValues: { phone: '', code: '', password: '', confirmPassword: '' },
//   });

//   const onEmailSubmit = (data: ForgotPasswordForm) => {
//     forgotMutation.mutate(data.login_field);
//   };

//   const handleOtpSuccess = (code: string) => {
//     passwordForm.setValue('phone', phone);
//     passwordForm.setValue('code', code);
//     setStep('new-password');
//   };

//   const onPasswordSubmit = (data: ResetPasswordForm) => {
//     resetMutation.mutate(data);
//   };

//   if (step === 'success') {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <Card className="w-full max-w-md text-center">
//           <CardHeader>
//             <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
//               <CheckCircle className="h-8 w-8 text-emerald-600" />
//             </div>
//             <CardTitle className="text-2xl">
//               Password Reset Successful
//             </CardTitle>
//             <CardDescription className="text-base">
//               Your password has been updated. You can now log in with your new
//               password.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button
//               onClick={() => router.push('/login')}
//               className="w-full h-11"
//             >
//               Go to Login
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-8">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center pb-6 pt-10">
//           <div className="flex justify-center mb-4">
//             <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-red-600 via-amber-500 to-emerald-600">
//               <span className="text-white text-2xl font-bold">SX</span>
//             </div>
//           </div>
//           <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
//           <CardDescription className="text-muted-foreground">
//             {step === 'email' && 'Enter your email or phone number'}
//             {step === 'otp' && `We sent a code to ${maskedPhone}`}
//             {step === 'new-password' && 'Create a new password'}
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="px-6 pb-10">
//           {/* STEP 1: EMAIL / PHONE */}
//           {step === 'email' && (
//             <form
//               onSubmit={emailForm.handleSubmit(onEmailSubmit)}
//               className="space-y-6"
//             >
//               <div className="space-y-2">
//                 <Label htmlFor="login_field">Email or Phone Number</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
//                   <Input
//                     id="login_field"
//                     placeholder="you@email.com or 0551234567"
//                     className="pl-11"
//                     {...emailForm.register('login_field')}
//                   />
//                 </div>
//                 {emailForm.formState.errors.login_field && (
//                   <p className="text-sm text-destructive">
//                     {emailForm.formState.errors.login_field.message}
//                   </p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-11"
//                 disabled={forgotMutation.isPending}
//               >
//                 {forgotMutation.isPending ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Sending OTP...
//                   </>
//                 ) : (
//                   <>
//                     Continue <ArrowRight className="ml-2 h-4 w-4" />
//                   </>
//                 )}
//               </Button>

//               {forgotMutation.isError && (
//                 <div className="flex items-center gap-2 text-sm text-destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   {(forgotMutation.error as any)?.response?.data?.error ||
//                     'Something went wrong. Please try again.'}
//                 </div>
//               )}
//             </form>
//           )}

//           {/* STEP 2: OTP */}
//           {step === 'otp' && (
//             <OTPVerification
//               phoneNumber={phone}
//               onVerifySuccess={handleOtpSuccess}
//             />
//           )}

//           {/* STEP 3: NEW PASSWORD */}
//           {step === 'new-password' && (
//             <form
//               onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
//               className="space-y-6"
//             >
//               <div className="space-y-2">
//                 <Label htmlFor="password">New Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   {...passwordForm.register('password')}
//                 />
//                 {passwordForm.formState.errors.password && (
//                   <p className="text-sm text-destructive">
//                     {passwordForm.formState.errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   placeholder="••••••••"
//                   {...passwordForm.register('confirmPassword')}
//                 />
//                 {passwordForm.formState.errors.confirmPassword && (
//                   <p className="text-sm text-destructive">
//                     {passwordForm.formState.errors.confirmPassword.message}
//                   </p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-11"
//                 disabled={resetMutation.isPending}
//               >
//                 {resetMutation.isPending ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Resetting Password...
//                   </>
//                 ) : (
//                   'Reset Password'
//                 )}
//               </Button>

//               {resetMutation.isError && (
//                 <div className="text-sm text-destructive text-center">
//                   {(resetMutation.error as any)?.response?.data?.error ||
//                     'Failed to reset password. Please try again.'}
//                 </div>
//               )}

//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => setStep('otp')}
//                 className="w-full text-muted-foreground"
//               >
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to OTP
//               </Button>
//             </form>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
