'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  MapPin,
  Smartphone,
  Upload,
  ArrowRight,
  ArrowLeft,
  Camera,
  LucideIcon,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LivePictureCapture } from '../LivePictureCapture';
import Image from 'next/image';

// --- Types ---
interface SignupFormData {
  country: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  userType: 'Student' | 'Worker' | '';
  phoneNumber: string;
  digitalAddress: string;
  profilePicture: File | null;
  payoutProvider: 'Telecel Cash' | 'MTN Momo' | 'Airtel Cash' | '';
  accountNumber: string;
  accountName: string;
  password: string;
  confirmPassword: string;
}

interface SignupEnhancedProps {
  onComplete: () => void;
}

// --- Reusable Components (DRY) ---

// 1. Reusable Input with Icon
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  id: string;
}

const FormInput = ({
  label,
  icon: Icon,
  className,
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
        } ${className || ''}`}
      />
    </div>
  </div>
);

// 2. Reusable Selection Grid (For User Type & Payout)
interface SelectionGridProps<T extends string> {
  label: string;
  options: readonly T[];
  currentValue: T;
  onChange: (value: T) => void;
}

const SelectionGrid = <T extends string>({
  label,
  options,
  currentValue,
  onChange,
}: SelectionGridProps<T>) => (
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
          className={`h-14 rounded-xl border transition-all flex items-center justify-center font-medium ${
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
const PAYOUT_PROVIDERS = ['MTN Momo', 'Telecel Cash', 'Airtel Cash'] as const;
const USER_TYPES = ['Student', 'Worker'] as const;

// --- Main Component ---
export function SignupEnhanced({ onComplete }: SignupEnhancedProps) {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [gpsAddress, setGpsAddress] = useState('');
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);

  const [formData, setFormData] = useState<SignupFormData>({
    country: 'Ghana',
    fullName: '',
    email: '',
    dateOfBirth: '',
    userType: '',
    phoneNumber: '',
    digitalAddress: '',
    profilePicture: null,
    payoutProvider: '',
    accountNumber: '',
    accountName: '',
    password: '',
    confirmPassword: '',
  });

  const updateFormData = <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFetchGPS = () => {
    setIsFetchingGPS(true);
    setTimeout(() => {
      const mockGPS = `GA-${Math.floor(100 + Math.random() * 900)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      setGpsAddress(mockGPS);
      updateFormData('digitalAddress', mockGPS);
      setIsFetchingGPS(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      localStorage.setItem('pendingUser', JSON.stringify(formData));
      onComplete();
    }
  };

  const stepTitles = [
    'Personal Information',
    'Profile & Contact',
    'Payout Details',
    'Security',
  ];

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
            Step {step} of 4 - {stepTitles[step - 1]}
          </CardDescription>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  step > i - 1 ? 'bg-[#DC2626]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => updateFormData('country', value)}
                  >
                    <SelectTrigger className="bg-[#F9FAFB] border-gray-200 rounded-lg h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#F9FAFB]">
                      <SelectItem value="Ghana">Ghana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormInput
                  id="fullName"
                  label="Full Name"
                  icon={User}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  required
                />

                <FormInput
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                />

                <FormInput
                  id="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  icon={Calendar}
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    updateFormData('dateOfBirth', e.target.value)
                  }
                  required
                />

                <SelectionGrid
                  label="User Type"
                  options={USER_TYPES}
                  currentValue={formData.userType}
                  onChange={(val) => updateFormData('userType', val)}
                />
              </>
            )}

            {/* Step 2: Profile & Contact */}
            {step === 2 && (
              <>
                <FormInput
                  id="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  icon={Phone}
                  placeholder="0XX XXX XXXX"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    updateFormData('phoneNumber', e.target.value)
                  }
                  required
                />

                <div className="space-y-2">
                  <FormInput
                    id="digitalAddress"
                    label="Digital Address (GhanaPost GPS)"
                    icon={MapPin}
                    placeholder="GH-XXX-XXXX"
                    value={formData.digitalAddress}
                    onChange={(e) =>
                      updateFormData('digitalAddress', e.target.value)
                    }
                    required
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

                  {gpsAddress && (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center">
                        ✓
                      </span>
                      GPS location detected!
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex flex-col items-center gap-4">
                    {profilePreview && (
                      <Image
                        src={profilePreview}
                        alt="Profile preview"
                        width={200}
                        height={200}
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
                      onCapture={(img) => {
                        if (img) {
                          setProfilePreview(img);
                          setShowCamera(false);
                        }
                      }}
                      capturedImage={profilePreview}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Step 3: Payout Details */}
            {step === 3 && (
              <>
                <SelectionGrid
                  label="Mobile Money Provider"
                  options={PAYOUT_PROVIDERS}
                  currentValue={formData.payoutProvider}
                  onChange={(val) => updateFormData('payoutProvider', val)}
                />

                <FormInput
                  id="accountNumber"
                  label="Account Number"
                  icon={Smartphone}
                  placeholder="0XX XXX XXXX"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    updateFormData('accountNumber', e.target.value)
                  }
                  required
                />

                <FormInput
                  id="accountName"
                  label="Account Name"
                  icon={User}
                  placeholder="Name on mobile money account"
                  value={formData.accountName}
                  onChange={(e) =>
                    updateFormData('accountName', e.target.value)
                  }
                  required
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
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground -mt-2 mb-2">
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers
                </p>

                <FormInput
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateFormData('confirmPassword', e.target.value)
                  }
                  required
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
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] group text-white"
                disabled={
                  (step === 1 && !formData.userType) ||
                  (step === 3 && !formData.payoutProvider)
                }
              >
                {step === 4 ? 'Create Account' : 'Continue'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
