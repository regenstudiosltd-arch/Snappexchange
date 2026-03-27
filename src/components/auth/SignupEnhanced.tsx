'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  LucideIcon,
  AlertCircle,
  Loader2,
  LucideChevronLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LivePictureCapture } from '../LivePictureCapture';
import Image from 'next/image';
import { signupSchema, SignupForm } from '@/src/lib/schemas';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';
import Link from 'next/link';

interface SignupEnhancedProps {
  onComplete: (phoneNumber: string) => void;
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  id: string;
  error?: string;
}

const FormInput = ({
  label,
  icon: Icon,
  className,
  error,
  type,
  ...props
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
        {label}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
        )}

        <Input
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            'bg-background border-border rounded-lg h-12 focus-visible:ring-primary/30 placeholder:text-muted-foreground',
            Icon ? 'pl-11' : '',
            isPassword ? 'pr-11' : '',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className,
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-destructive mt-1 block">{error}</span>
      )}
    </div>
  );
};

interface SelectionGridProps {
  label: string;
  options: readonly string[];
  currentValue: string;
  onChange: (value: string) => void;
}

const SelectionGrid = ({
  label,
  options,
  currentValue,
  onChange,
}: SelectionGridProps) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <div
      className={`grid gap-3 ${
        options.length > 2 ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'h-14 rounded-xl border transition-all flex items-center justify-center font-medium capitalize',
            currentValue === option
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border bg-background text-muted-foreground hover:bg-muted hover:border-primary/30',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

// --- Constants ---
const PAYOUT_PROVIDERS = ['mtn', 'telecel', 'airteltigo'] as const;
const USER_TYPES = ['student', 'worker'] as const;
const STEP_TITLES = [
  'Personal Information',
  'Profile & Contact',
  'Payout Details',
  'Security',
];

export function SignupEnhanced({ onComplete }: SignupEnhancedProps) {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);

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
    defaultValues: {
      userType: 'student',
      momoProvider: 'mtn',
    },
  });

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data, variables: SignupForm) => {
      const formMomoNumber = variables.momoNumber;
      const phoneToVerify = data.phone || data.phone_number || formMomoNumber;
      onComplete(phoneToVerify);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('profilePicture', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imgBase64: string | null) => {
    if (imgBase64) {
      setProfilePreview(imgBase64);
      fetch(imgBase64)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'profile_capture.jpg', {
            type: 'image/jpeg',
          });
          setValue('profilePicture', file, { shouldValidate: true });
        });
      setShowCamera(false);
    }
  };

  const handleFetchGPS = () => {
    setIsFetchingGPS(true);
    setTimeout(() => {
      const mockGPS = `GA-${Math.floor(100 + Math.random() * 900)}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`;
      setValue('ghanaPostAddress', mockGPS, { shouldValidate: true });
      setIsFetchingGPS(false);
    }, 1500);
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof SignupForm)[] = [];

    if (step === 1)
      fieldsToValidate = ['fullName', 'email', 'dateOfBirth', 'userType'];
    if (step === 2) fieldsToValidate = ['momoNumber', 'ghanaPostAddress'];
    if (step === 3)
      fieldsToValidate = ['momoProvider', 'momoName', 'momoNumber'];

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <>
      <Link href="/" className="inline-block mb-4">
        <div className="group flex items-center gap-2 px-3 py-2 rounded-lg w-fit transition-all duration-200 cursor-pointer hover:bg-muted/60">
          <LucideChevronLeft className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-foreground" />

          <h3 className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            Back to home
          </h3>
        </div>
      </Link>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pb-8 pt-3">
        <Card className="w-full max-w-2xl bg-card border-border rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-10">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-[#DC2626] via-[#F59E0B] to-[#059669]">
                <span className="text-white text-xl">SX</span>
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Step {step} of 4 - {STEP_TITLES[step - 1]}
            </CardDescription>

            {/* Progress Bar */}
            <div className="flex gap-2 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    step >= i ? 'bg-primary' : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-6 md:px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Global Error Message */}
              {signupMutation.isError && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>
                    {(
                      signupMutation.error as {
                        response?: { data?: { error?: string } };
                      }
                    ).response?.data?.error ||
                      'Registration failed. Please try again.'}
                  </span>
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <>
                  <FormInput
                    id="fullName"
                    label="Full Name"
                    icon={User}
                    placeholder="Enter your full name"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />

                  <FormInput
                    id="email"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    placeholder="your@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <FormInput
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
                      <SelectionGrid
                        label="User Type"
                        options={USER_TYPES}
                        currentValue={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </>
              )}

              {/* Step 2: Profile & Contact */}
              {step === 2 && (
                <>
                  <FormInput
                    id="momoNumber"
                    label="Phone Number"
                    type="tel"
                    icon={Phone}
                    placeholder="0XX XXX XXXX"
                    error={errors.momoNumber?.message}
                    {...register('momoNumber')}
                  />

                  <div className="space-y-3">
                    <FormInput
                      id="ghanaPostAddress"
                      label="Digital Address (GhanaPost GPS)"
                      icon={MapPin}
                      placeholder="GH-XXX-XXXX"
                      error={errors.ghanaPostAddress?.message}
                      {...register('ghanaPostAddress')}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchGPS}
                      disabled={isFetchingGPS}
                      className="w-full"
                    >
                      {isFetchingGPS ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Fetching GPS...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Get My GPS Address
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground">Profile Picture</Label>
                    <div className="flex flex-col items-center gap-5">
                      {profilePreview && (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-md">
                          <Image
                            src={profilePreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <label
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                            'border-border hover:border-primary/50 hover:bg-primary/5',
                          )}
                        >
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Upload
                          </span>
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
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                            'border-border hover:border-primary/50 hover:bg-primary/5',
                          )}
                        >
                          <Camera className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Live Camera
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Dialog open={showCamera} onOpenChange={setShowCamera}>
                    <DialogContent className="max-w-2xl bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          Capture Profile Photo
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
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

              {/* Step 3: Payout Details */}
              {step === 3 && (
                <>
                  <Controller
                    control={control}
                    name="momoProvider"
                    render={({ field }) => (
                      <SelectionGrid
                        label="Mobile Money Provider"
                        options={PAYOUT_PROVIDERS}
                        currentValue={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <FormInput
                    id="momoName"
                    label="Account Name"
                    icon={User}
                    placeholder="Name on mobile money account"
                    error={errors.momoName?.message}
                    {...register('momoName')}
                  />
                </>
              )}

              {/* Step 4: Security */}
              {step === 4 && (
                <>
                  <FormInput
                    id="password"
                    label="Password"
                    type="password"
                    icon={Lock}
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <p className="text-xs text-muted-foreground -mt-2 mb-3">
                    Must be at least 8 characters.
                  </p>

                  <FormInput
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <div className="flex items-start gap-3 pt-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      required
                    />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    className="flex-1 h-11"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium"
                  >
                    {signupMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                    {!signupMutation.isPending && (
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
