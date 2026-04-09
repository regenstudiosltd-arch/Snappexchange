'use client';

import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  Camera,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LivePictureCapture } from '../landingPage/LivePictureCapture';
import Image from 'next/image';
import { signupSchema, SignupForm } from '@/src/lib/schemas';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';
import Link from 'next/link';
import {
  PageShell,
  AuthBrandMark,
  AuthInput,
  AuthSelectionGrid,
} from './PageShell';

interface SignupEnhancedProps {
  onComplete: (phoneNumber: string) => void;
}

const PAYOUT_PROVIDERS = ['mtn', 'telecel', 'airteltigo'] as const;
const USER_TYPES = ['student', 'worker'] as const;

const STEPS = [
  { number: 1, label: 'Personal' },
  { number: 2, label: 'Contact' },
  { number: 3, label: 'Payout' },
  { number: 4, label: 'Security' },
] as const;

function PasswordStrengthBar({ password }: { password: string }) {
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
    <div className="space-y-1.5 pt-0.5">
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
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-semibold"
          style={{ color: colors[score] }}
        >
          {labels[score]}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-white/28">
          {score}/4 requirements met
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  error,
  ...props
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
      {...props}
    />
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.number;
        const active = currentStep === step.number;

        return (
          <div
            key={step.number}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300',
                  done
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-400/40'
                    : active
                      ? 'text-white ring-0 scale-110'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/25 ring-1 ring-gray-200/80 dark:ring-white/6',
                )}
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
                      }
                    : undefined
                }
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.number}
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 hidden sm:block',
                  done
                    ? 'text-emerald-600/70 dark:text-emerald-400/50'
                    : active
                      ? 'text-amber-600 dark:text-amber-400/80'
                      : 'text-gray-300 dark:text-white/20',
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className="flex-1 mx-2 mb-3.5 sm:mb-5 h-px transition-all duration-500"
                style={{
                  background: done
                    ? 'linear-gradient(90deg, #10B981, #10B981)'
                    : active
                      ? 'linear-gradient(90deg, #F59E0B 0%, rgba(128,128,128,0.15) 100%)'
                      : 'rgba(128,128,128,0.15)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SignupEnhanced({ onComplete }: SignupEnhancedProps) {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { userType: 'student', momoProvider: 'mtn' },
  });

  const newPassword = useWatch({ control, name: 'password', defaultValue: '' });
  const agreeToTerms = useWatch({
    control,
    name: 'agreeToTerms',
    defaultValue: false,
  });

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data, variables: SignupForm) => {
      const phoneToVerify =
        data.phone || data.phone_number || variables.momoNumber;
      onComplete(phoneToVerify);
    },
  });

  const isSubmitDisabled = signupMutation.isPending || !agreeToTerms;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue('profilePicture', file, { shouldValidate: true });
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCapture = (imgBase64: string | null) => {
    if (!imgBase64) return;
    setProfilePreview(imgBase64);
    fetch(imgBase64)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], 'profile_capture.jpg', {
          type: 'image/jpeg',
        });
        setValue('profilePicture', file, { shouldValidate: true });
      });
    setShowCamera(false);
  };

  const goToStep = (next: number) => {
    setStep(next);
    setAnimKey((k) => k + 1);
  };

  const handleNextStep = async () => {
    const fieldsMap: Record<number, (keyof SignupForm)[]> = {
      1: ['fullName', 'email', 'dateOfBirth', 'userType'],
      2: ['momoNumber', 'ghanaPostAddress'],
      3: ['momoProvider', 'momoName', 'momoNumber'],
    };
    const valid = await trigger(fieldsMap[step] ?? []);
    if (valid) goToStep(step + 1);
  };

  const onSubmit = (data: SignupForm) => signupMutation.mutate(data);

  return (
    <PageShell>
      <div className="flex flex-col items-center">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 mb-6 text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/70 text-sm transition-colors duration-200 w-full max-w-lg"
        >
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        <div
          className="w-full max-w-lg rounded-2xl border backdrop-blur-xl p-8 transition-colors duration-300
            bg-white/75 border-gray-200/70 shadow-[0_24px_80px_rgba(0,0,0,0.08)]
            dark:bg-white/3 dark:border-white/[0.07] dark:shadow-none"
          style={{
            animation: 'signupCardIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes signupCardIn {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes stepContentIn {
              from { opacity: 0; transform: translateY(10px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <AuthBrandMark />

          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
              Create your account
            </h1>
            <p className="text-[13.5px] text-gray-400 dark:text-white/40 mt-1">
              Step {step} of 4
            </p>
          </div>

          <StepIndicator currentStep={step} />

          {signupMutation.isError && (
            <div
              className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] mb-5
              border-red-200 bg-red-50/80 text-red-600
              dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {(
                signupMutation.error as {
                  response?: { data?: { error?: string } };
                }
              ).response?.data?.error ||
                'Registration failed. Please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              key={animKey}
              className="space-y-4"
              style={{
                animation:
                  'stepContentIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
              }}
            >
              {/* Step 1: Personal */}
              {step === 1 && (
                <>
                  <AuthInput
                    id="fullName"
                    label="Full Name"
                    placeholder="Enter your full name"
                    icon={User}
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <AuthInput
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    icon={Mail}
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <AuthInput
                    id="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    icon={Calendar}
                    error={errors.dateOfBirth?.message}
                    {...register('dateOfBirth')}
                  />
                  <Controller
                    control={control}
                    name="userType"
                    render={({ field }) => (
                      <AuthSelectionGrid
                        label="I am a…"
                        options={USER_TYPES}
                        currentValue={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </>
              )}

              {/* Step 2: Contact & Profile */}
              {step === 2 && (
                <>
                  <AuthInput
                    id="momoNumber"
                    label="Phone Number"
                    type="tel"
                    placeholder="0XX XXX XXXX"
                    icon={Phone}
                    error={errors.momoNumber?.message}
                    {...register('momoNumber')}
                  />

                  {/* Ghana Post GPS */}
                  <div className="space-y-2">
                    <AuthInput
                      id="ghanaPostAddress"
                      label="Digital Address (GhanaPost GPS)"
                      placeholder="e.g. GA-123-4567"
                      icon={MapPin}
                      error={errors.ghanaPostAddress?.message}
                      {...register('ghanaPostAddress')}
                    />

                    <div
                      className="flex items-start gap-3 rounded-xl border px-3.5 py-3
                        border-blue-100 bg-blue-50/60
                        dark:border-blue-500/15 dark:bg-blue-500/6"
                    >
                      <p className="text-[12.5px] text-blue-600 dark:text-blue-400/80 leading-relaxed">
                        Don&apos;t know your address?{' '}
                        <a
                          href="https://ghanapostgps.com/map"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline underline-offset-2 inline-flex items-center gap-1
                            hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          Look it up on GhanaPostGPS
                          <ExternalLink className="h-3 w-3" />
                        </a>{' '}
                        — it&apos;s free and takes about 30 seconds.
                      </p>
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-2">
                    <Label className="block text-gray-500 dark:text-white/45 text-[10.5px] font-bold uppercase tracking-[0.15em]">
                      Profile Picture
                    </Label>

                    {profilePreview && (
                      <div className="flex justify-center mb-3">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-amber-400/40 dark:ring-amber-500/30 shadow-lg">
                          <Image
                            src={profilePreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                        border-gray-200 dark:border-white/8 text-gray-400 dark:text-white/30
                        hover:border-amber-400/60 dark:hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400/70
                        hover:bg-amber-50/30 dark:hover:bg-amber-500/5"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-[12px] font-medium">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                          border-gray-200 dark:border-white/8 text-gray-400 dark:text-white/30
                          hover:border-amber-400/60 dark:hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400/70
                          hover:bg-amber-50/30 dark:hover:bg-amber-500/5"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="text-[12px] font-medium">
                          Live Camera
                        </span>
                      </button>
                    </div>
                  </div>

                  <Dialog open={showCamera} onOpenChange={setShowCamera}>
                    <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-border">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-foreground">
                          Capture Profile Photo
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-muted-foreground">
                          Take a clear photo of your face for verification
                        </DialogDescription>
                      </DialogHeader>
                      <LivePictureCapture
                        onCapture={handleCapture}
                        capturedImage={profilePreview}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* Step 3: Payout */}
              {step === 3 && (
                <>
                  <div className="rounded-xl border p-4 mb-2 border-blue-100 bg-blue-50/60 dark:border-blue-500/15 dark:bg-blue-500/6">
                    <p className="text-[12.5px] text-blue-600 dark:text-blue-400/80 leading-relaxed">
                      Your payout details are used to send your earnings
                      directly to your mobile money wallet.
                    </p>
                  </div>

                  <Controller
                    control={control}
                    name="momoProvider"
                    render={({ field }) => (
                      <AuthSelectionGrid
                        label="Mobile Money Provider"
                        options={PAYOUT_PROVIDERS}
                        currentValue={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <AuthInput
                    id="momoName"
                    label="Account Name"
                    placeholder="Name on your mobile money account"
                    icon={User}
                    error={errors.momoName?.message}
                    {...register('momoName')}
                  />
                </>
              )}

              {/* Step 4: Security */}
              {step === 4 && (
                <>
                  <PasswordField
                    id="password"
                    label="Create Password"
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  {newPassword && (
                    <div
                      className="rounded-xl border px-4 py-3 space-y-3
                      border-gray-100 bg-gray-50/50 dark:border-white/6 dark:bg-white/2"
                    >
                      <PasswordStrengthBar password={newPassword} />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {[
                          {
                            label: 'At least 8 characters',
                            met: newPassword.length >= 8,
                          },
                          {
                            label: 'One uppercase letter',
                            met: /[A-Z]/.test(newPassword),
                          },
                          {
                            label: 'One number',
                            met: /[0-9]/.test(newPassword),
                          },
                          {
                            label: 'Special character',
                            met: /[^A-Za-z0-9]/.test(newPassword),
                          },
                        ].map(({ label, met }) => (
                          <div
                            key={label}
                            className="flex items-center gap-1.5"
                          >
                            <CheckCircle2
                              className={cn(
                                'h-3 w-3 transition-colors duration-200 shrink-0',
                                met
                                  ? 'text-emerald-500'
                                  : 'text-gray-200 dark:text-white/12',
                              )}
                            />
                            <span
                              className={cn(
                                'text-[11px] transition-colors duration-200',
                                met
                                  ? 'text-gray-600 dark:text-white/55'
                                  : 'text-gray-300 dark:text-white/20',
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
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        {...register('agreeToTerms')}
                        className="mt-0.5 h-4 w-4 rounded-md border-gray-300 dark:border-white/20 text-amber-500 focus:ring-amber-400/20 focus:ring-offset-0 bg-white/80 dark:bg-white/5 cursor-pointer accent-amber-500"
                      />
                      <label
                        htmlFor="agreeToTerms"
                        className="text-[13px] text-gray-400 dark:text-white/35 leading-relaxed cursor-pointer select-none"
                      >
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          className="text-amber-600 dark:text-amber-500/75 hover:underline font-medium"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="text-amber-600 dark:text-amber-500/75 hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 pl-7">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-7 pt-6 border-t border-gray-100 dark:border-white/5">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  className="flex-1 h-12 rounded-xl font-semibold border transition-all duration-200
                    border-gray-200 dark:border-white/8
                    bg-white/60 dark:bg-white/4
                    text-gray-600 dark:text-white/55
                    hover:bg-gray-50 dark:hover:bg-white/[0.07]
                    hover:border-gray-300 dark:hover:border-white/15"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background:
                      'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
                  }}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="flex-1 h-12 rounded-xl font-semibold text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitDisabled
                      ? 'linear-gradient(135deg, #05966988 0%, #0891B288 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
                  }}
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-5 text-center text-[13px]">
            <span className="text-gray-400 dark:text-white/28">
              Already have an account?{' '}
            </span>
            <Link
              href="/login"
              className="text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
