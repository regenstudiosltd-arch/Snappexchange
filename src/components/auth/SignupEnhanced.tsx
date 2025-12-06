"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Calendar, MapPin, Smartphone, Upload, ArrowRight, ArrowLeft, Camera } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { LivePictureCapture } from "../LivePictureCapture";

interface SignupFormData {
  country: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  userType: "Student" | "Worker" | "";
  phoneNumber: string;
  digitalAddress: string;
  profilePicture: File | null;
  payoutProvider: "Telecel Cash" | "MTN Momo" | "Airtel Cash" | "";
  accountNumber: string;
  accountName: string;
  password: string;
  confirmPassword: string;
}

interface SignupEnhancedProps {
  onComplete: () => void;
}

export function SignupEnhanced({ onComplete }: SignupEnhancedProps) {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [gpsAddress, setGpsAddress] = useState("");
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    country: "Ghana",
    fullName: "",
    email: "",
    dateOfBirth: "",
    userType: "",
    phoneNumber: "",
    digitalAddress: "",
    profilePicture: null,
    payoutProvider: "",
    accountNumber: "",
    accountName: "",
    password: "",
    confirmPassword: "",
  });

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData("profilePicture", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    setShowCamera(true);
  };

  const handleCapturedImage = (imageData: string) => {
    if (imageData) {
      setProfilePreview(imageData);
      setShowCamera(false);
    }
  };

  const handleFetchGPS = () => {
    setIsFetchingGPS(true);
    // Simulate GPS fetch
    setTimeout(() => {
      const mockGPS = `GA-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setGpsAddress(mockGPS);
      updateFormData("digitalAddress", mockGPS);
      setIsFetchingGPS(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save to localStorage and trigger OTP verification
      localStorage.setItem("pendingUser", JSON.stringify(formData));
      onComplete();
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DC2626]/5 via-[#F59E0B]/5 to-[#059669]/5 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-[#DC2626] via-[#F59E0B] to-[#059669]">
              <span className="text-white text-xl">SX</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Step {step} of {totalSteps} - {
              step === 1 ? "Personal Information" :
              step === 2 ? "Profile & Contact" :
              step === 3 ? "Payout Details" :
              "Security"
            }
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  step > i ? "bg-[#DC2626]" : "bg-gray-200"
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
                  <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => updateFormData("userType", "Student")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.userType === "Student"
                          ? "border-[#DC2626] bg-[#DC2626]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData("userType", "Worker")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.userType === "Worker"
                          ? "border-[#DC2626] bg-[#DC2626]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Worker
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Profile & Contact */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="0XX XXX XXXX"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digitalAddress">Digital Address (GhanaPost GPS)</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="digitalAddress"
                        type="text"
                        placeholder="GH-XXX-XXXX"
                        value={formData.digitalAddress}
                        onChange={(e) => updateFormData("digitalAddress", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchGPS}
                      disabled={isFetchingGPS}
                      className="w-full border-cyan-300 hover:bg-cyan-50 hover:border-cyan-400"
                    >
                      {isFetchingGPS ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600 mr-2"></div>
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
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        GPS location detected!
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex flex-col items-center gap-4">
                    {profilePreview && (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <label
                        htmlFor="profilePicture"
                        className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload
                        </span>
                      </label>
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleCameraCapture}
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

                {/* Camera Capture Dialog */}
                <Dialog open={showCamera} onOpenChange={setShowCamera}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Capture Profile Photo</DialogTitle>
                      <DialogDescription>
                        Take a clear photo of your face for verification
                      </DialogDescription>
                    </DialogHeader>
                    <LivePictureCapture 
                      onCapture={handleCapturedImage}
                      capturedImage={profilePreview}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Step 3: Payout Details */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Mobile Money Provider</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["MTN Momo", "Telecel Cash", "Airtel Cash"].map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => updateFormData("payoutProvider", provider)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.payoutProvider === provider
                            ? "border-[#DC2626] bg-[#DC2626]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-sm">{provider}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="accountNumber"
                      type="text"
                      placeholder="0XX XXX XXXX"
                      value={formData.accountNumber}
                      onChange={(e) => updateFormData("accountNumber", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="accountName"
                      type="text"
                      placeholder="Name on mobile money account"
                      value={formData.accountName}
                      onChange={(e) => updateFormData("accountName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Security */}
            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <a href="#" className="text-[#DC2626] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#DC2626] hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] group"
                disabled={
                  (step === 1 && !formData.userType) ||
                  (step === 3 && !formData.payoutProvider)
                }
              >
                {step === 4 ? "Create Account" : "Continue"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}