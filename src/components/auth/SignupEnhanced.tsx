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

// --- Types & Interfaces ---

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
  ...props
}: FormInputProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={props.id} className="text-sm font-semibold text-gray-800">
      {label}
    </Label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
      )}
      <Input
        {...props}
        className={`bg-[#F9FAFB] border-gray-200 rounded-lg h-12 focus-visible:ring-gray-300 placeholder:text-gray-400 ${
          Icon ? 'pl-10' : ''
        } ${className || ''} ${
          error ? 'border-red-500 focus-visible:ring-red-500' : ''
        }`}
      />
    </div>
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

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
    <Label className="text-sm font-semibold text-gray-800">{label}</Label>
    <div
      className={`grid gap-4 ${
        options.length > 2 ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-14 rounded-xl border transition-all flex items-center justify-center font-medium capitalize ${
            currentValue === option
              ? 'border-red-600 bg-red-50 text-gray-900'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
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
        1000 + Math.random() * 9000
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#DC2626]/5 via-[#F59E0B]/5 to-[#059669]/5 px-4 py-8">
      <Card className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-[#DC2626] via-[#F59E0B] to-[#059669]">
              <span className="text-white text-xl">SX</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Step {step} of 4 - {STEP_TITLES[step - 1]}
          </CardDescription>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  step >= i ? 'bg-[#DC2626]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Global Error Message */}
            {signupMutation.isError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {(
                  signupMutation.error as {
                    response?: { data?: { error?: string } };
                  }
                ).response?.data?.error ||
                  'Registration failed. Please try again.'}
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

            {/* Profile & Contact */}
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

                <div className="space-y-2">
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
                    className="w-full border-cyan-300 hover:bg-cyan-50 hover:border-cyan-400"
                  >
                    {isFetchingGPS ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600 mr-2" />
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

                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex flex-col items-center gap-4">
                    {profilePreview && (
                      <Image
                        src={profilePreview}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground" />
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
                        className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-cyan-300 hover:border-cyan-400 cursor-pointer transition-colors bg-cyan-50"
                      >
                        <Camera className="h-5 w-5 text-cyan-600" />
                        <span className="text-sm text-cyan-600">
                          Live Camera
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <Dialog open={showCamera} onOpenChange={setShowCamera}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Capture Profile Photo</DialogTitle>
                      <DialogDescription>
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

            {/* Payout Details */}
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

            {/* Security */}
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
                <p className="text-xs text-muted-foreground -mt-2 mb-2">
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

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300"
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-[#DC2626] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#DC2626] hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] group text-white"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] group text-white"
                >
                  {signupMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                  {!signupMutation.isPending && (
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
