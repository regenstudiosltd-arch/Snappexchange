'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Moon,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { authService } from '@/src/services/auth.service';
import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';
import { useTheme } from '@/src/context/ThemeContext';

// 1. PARENT - Data Fetcher
export function SettingsPage() {
  const {
    data: backendProfile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <p className="text-sm md:text-lg animate-pulse">Loading settings...</p>
      </div>
    );
  }

  if (error || !backendProfile) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load profile.
      </div>
    );
  }

  return <SettingsForm backendProfile={backendProfile} />;
}

// 2. CHILD - Full Form with all sections
function SettingsForm({ backendProfile }: { backendProfile: UserProfile }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // === PASSWORD CHANGE STATES ===
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // === MODAL + COUNTDOWN ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // === LIVE BACKEND STATES ===
  const [profileSettings, setProfileSettings] = useState({
    fullName: backendProfile.full_name || '',
    email: backendProfile.email || '',
    phoneNumber: backendProfile.momo_number || '',
    digitalAddress: backendProfile.ghana_post_address || '',
    userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
  });

  const [payoutSettings, setPayoutSettings] = useState({
    provider: backendProfile.momo_provider || 'mtn',
    accountNumber: backendProfile.momo_number || '',
    accountName: backendProfile.momo_name || '',
  });

  // === STATIC STATES ===
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    contributionReminders: true,
    groupUpdates: true,
    promotions: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    loginAlerts: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    language: 'en',
  });

  // === MUTATIONS ===
  const profileMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      authService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string } } };
      setErrorMsg(apiError.response?.data?.error || 'Profile update failed');
      setTimeout(() => setErrorMsg(''), 4000);
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      authService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setSuccessMsg('Payout account updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string } } };
      setErrorMsg(apiError.response?.data?.error || 'Payout update failed');
      setTimeout(() => setErrorMsg(''), 4000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      authService.changePassword(payload),
    onSuccess: () => {
      setIsModalOpen(true);
      setCountdown(5);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string } } };
      setErrorMsg(apiError.response?.data?.error || 'Password update failed');
      setTimeout(() => setErrorMsg(''), 4000);
    },
  });

  // === COUNTDOWN AUTO-REDIRECT ===
  useEffect(() => {
    if (!isModalOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          signOut({ redirect: false }).then(() => router.push('/login'));
          setIsModalOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isModalOpen, router]);

  // === HANDLERS ===
  const handleSaveProfile = () => {
    profileMutation.mutate({
      full_name: profileSettings.fullName,
      email: profileSettings.email,
      momo_number: profileSettings.phoneNumber,
      ghana_post_address: profileSettings.digitalAddress,
      user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
    });
  };

  const handleSavePayout = () => {
    const payload: ProfileUpdatePayload = {
      momo_provider: payoutSettings.provider as
        | 'mtn'
        | 'telecel'
        | 'airteltigo',
      momo_number: payoutSettings.accountNumber,
      momo_name: payoutSettings.accountName,
    };
    payoutMutation.mutate(payload);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem(
      'snappx_notifications',
      JSON.stringify(notificationSettings),
    );
    setSuccessMsg('Notification settings updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveSecurity = () => {
    localStorage.setItem('snappx_security', JSON.stringify(securitySettings));
    setSuccessMsg('Security settings updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg('All password fields are required');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters');
      return;
    }

    passwordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl mb-20 md:mb-0">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Feedback Banner */}
        {(successMsg || errorMsg) && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-1 ${
              successMsg
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800'
            }`}
          >
            {successMsg ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {successMsg || errorMsg}
          </div>
        )}

        {/* PROFILE SETTINGS */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-[16px] md:text-[20px]">
                Profile Information
              </CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileSettings.fullName}
                  onChange={(e) =>
                    setProfileSettings({
                      ...profileSettings,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={profileSettings.userType}
                  onValueChange={(v) =>
                    setProfileSettings({ ...profileSettings, userType: v })
                  }
                >
                  <SelectTrigger id="userType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-10"
                  value={profileSettings.email}
                  onChange={(e) =>
                    setProfileSettings({
                      ...profileSettings,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={profileSettings.phoneNumber}
                  onChange={(e) =>
                    setProfileSettings({
                      ...profileSettings,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="digitalAddress">Ghana Post GPS Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="digitalAddress"
                  className="pl-10"
                  value={profileSettings.digitalAddress}
                  onChange={(e) =>
                    setProfileSettings({
                      ...profileSettings,
                      digitalAddress: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={profileMutation.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {profileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Profile...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* PAYOUT SETTINGS */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-[16px] md:text-[20px]">
                Payout Account
              </CardTitle>
            </div>
            <CardDescription>Manage your default payout method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payoutProvider">Provider</Label>
              <Select
                value={payoutSettings.provider}
                onValueChange={(v) =>
                  setPayoutSettings({
                    ...payoutSettings,
                    provider: v as 'mtn' | 'telecel' | 'airteltigo',
                  })
                }
              >
                <SelectTrigger id="payoutProvider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN MoMo</SelectItem>
                  <SelectItem value="telecel">Telecel Cash</SelectItem>
                  <SelectItem value="airteltigo">AirtelTigo Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={payoutSettings.accountNumber}
                onChange={(e) =>
                  setPayoutSettings({
                    ...payoutSettings,
                    accountNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={payoutSettings.accountName}
                onChange={(e) =>
                  setPayoutSettings({
                    ...payoutSettings,
                    accountName: e.target.value,
                  })
                }
              />
            </div>
            <Button
              onClick={handleSavePayout}
              disabled={payoutMutation.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {payoutMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Payout...
                </>
              ) : (
                'Update Payout Account'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* NOTIFICATION SETTINGS */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-[16px] md:text-[20px]">
                Notifications
              </CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(v) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: v,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via SMS
                </p>
              </div>
              <Switch
                checked={notificationSettings.smsNotifications}
                onCheckedChange={(v) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: v,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(v) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: v,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Contribution Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me before due dates
                </p>
              </div>
              <Switch
                checked={notificationSettings.contributionReminders}
                onCheckedChange={(v) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    contributionReminders: v,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Group Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notify about group activities
                </p>
              </div>
              <Switch
                checked={notificationSettings.groupUpdates}
                onCheckedChange={(v) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    groupUpdates: v,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Promotions & Tips</Label>
                <p className="text-sm text-muted-foreground">
                  Receive savings tips and offers
                </p>
              </div>
              <Switch
                checked={notificationSettings.promotions}
                onCheckedChange={(v) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    promotions: v,
                  })
                }
              />
            </div>
            <Button
              onClick={handleSaveNotifications}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Save Notification Preferences
            </Button>
          </CardContent>
        </Card>

        {/* SECURITY SETTINGS  */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-[16px] md:text-[20px]">
                Security
              </CardTitle>
            </div>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(v) =>
                  setSecuritySettings({ ...securitySettings, twoFactorAuth: v })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Biometric Login</Label>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face ID
                </p>
              </div>
              <Switch
                checked={securitySettings.biometricLogin}
                onCheckedChange={(v) =>
                  setSecuritySettings({
                    ...securitySettings,
                    biometricLogin: v,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified of new logins
                </p>
              </div>
              <Switch
                checked={securitySettings.loginAlerts}
                onCheckedChange={(v) =>
                  setSecuritySettings({ ...securitySettings, loginAlerts: v })
                }
              />
            </div>
            <Separator />

            {/* CHANGE PASSWORD SECTION */}
            <div className="space-y-2">
              <Label>Change Password</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              <Button
                onClick={handleUpdatePassword}
                disabled={passwordMutation.isPending}
                variant="outline"
              >
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>

            <Button
              onClick={handleSaveSecurity}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* APPEARANCE SETTINGS */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-[16px] md:text-[20px]">
                Appearance
              </CardTitle>
            </div>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={(v) =>
                  setTheme(v as 'light' | 'dark' | 'system')
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={appearanceSettings.language}
                onValueChange={(v) =>
                  setAppearanceSettings({ ...appearanceSettings, language: v })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tw">Twi</SelectItem>
                  <SelectItem value="ga">Ga</SelectItem>
                  <SelectItem value="ee">Ewe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* DANGER ZONE */}
        <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SUCCESS MODAL WITH 5-SECOND CIRCULAR COUNTDOWN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Animated Success Icon */}
            <div className="relative flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 dark:bg-emerald-900/30 opacity-75 duration-1000" />
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 relative z-10" />
            </div>

            {/* Clean Header & Description */}
            <DialogHeader className="flex flex-col items-center text-center space-y-2 mb-8">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                Password Updated!
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground max-w-65">
                Your security details have been saved. We are securely routing
                you to the login screen.
              </DialogDescription>
            </DialogHeader>

            <div className="relative flex items-center justify-center mb-8">
              <svg
                className="w-20 h-20 -rotate-90 transform drop-shadow-sm"
                viewBox="0 0 100 100"
              >
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none stroke-muted"
                  strokeWidth="6"
                />
                {/* Smooth animated progress track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none stroke-emerald-500 transition-all duration-1000 ease-linear"
                  strokeWidth="6"
                  strokeDasharray="282.74"
                  strokeDashoffset={282.74 * (1 - countdown / 5)}
                  strokeLinecap="round"
                />
              </svg>
              {/* Pulsing countdown number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {countdown}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => {
                signOut({ redirect: false }).then(() => router.push('/login'));
              }}
              variant="outline"
              className="w-full h-12 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
            >
              Skip & Login Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
