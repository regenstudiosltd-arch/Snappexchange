'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Moon,
  Mail,
  Phone,
  MapPin,
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

export function SettingsPage() {
  const [profileData, setProfileData] = useState({
    fullName: 'Kwame Mensah',
    email: 'kwame.mensah@example.com',
    phoneNumber: '+233541413623',
    digitalAddress: 'GA-123-4567',
    userType: 'Worker',
  });

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
    theme: 'light',
    language: 'en',
  });

  const handleSaveProfile = () => {
    // Save profile data
    localStorage.setItem('snappx_profile', JSON.stringify(profileData));
    alert('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    localStorage.setItem(
      'snappx_notifications',
      JSON.stringify(notificationSettings)
    );
    alert('Notification settings updated!');
  };

  const handleSaveSecurity = () => {
    // Save security settings
    localStorage.setItem('snappx_security', JSON.stringify(securitySettings));
    alert('Security settings updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-1">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-[16px] md:text-[20px]">
              Profile Information
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={profileData.userType}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, userType: value })
                }
              >
                <SelectTrigger
                  id="userType"
                  className="h-11 w-full rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 data-placeholder:text-gray-400"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                  <SelectItem
                    value="Student"
                    className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                  >
                    Student
                  </SelectItem>
                  <SelectItem
                    value="Worker"
                    className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                  >
                    Worker
                  </SelectItem>
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
                type="email"
                className="pl-10 border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
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
                type="tel"
                className="pl-10 border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
                value={profileData.phoneNumber}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
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
                className="pl-10 border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
                value={profileData.digitalAddress}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    digitalAddress: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-[16px] md:text-[20px]">
              Payout Account
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Manage your default payout method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutProvider">Provider</Label>
            <Select defaultValue="mtn">
              <SelectTrigger
                id="payoutProvider"
                className="h-11 w-full rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 data-placeholder:text-gray-400"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                <SelectItem
                  value="mtn"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  MTN Momo
                </SelectItem>
                <SelectItem
                  value="telecel"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  Telecel Cash
                </SelectItem>
                <SelectItem
                  value="airtel"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  Airtel Cash
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="024XXXXXXX"
              defaultValue="0541413623"
              className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="Your registered name"
              defaultValue="Kwame Mensah"
              className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
            />
          </div>

          <Button className="bg-gray-100 border border-gray-200">
            Update Payout Account
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-[16px] md:text-[20px]">
              Notifications
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <Switch
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via SMS</p>
            </div>
            <Switch
              checked={notificationSettings.smsNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  smsNotifications: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive push notifications
              </p>
            </div>
            <Switch
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  pushNotifications: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Contribution Reminders</Label>
              <p className="text-sm text-gray-500">
                Remind me before due dates
              </p>
            </div>
            <Switch
              checked={notificationSettings.contributionReminders}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  contributionReminders: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Group Updates</Label>
              <p className="text-sm text-gray-500">
                Notify about group activities
              </p>
            </div>
            <Switch
              checked={notificationSettings.groupUpdates}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  groupUpdates: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotions & Tips</Label>
              <p className="text-sm text-gray-500">
                Receive savings tips and offers
              </p>
            </div>
            <Switch
              checked={notificationSettings.promotions}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  promotions: checked,
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

      {/* Security Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-[16px] md:text-[20px]">
              Security
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">
                Add an extra layer of security
              </p>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  twoFactorAuth: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Biometric Login</Label>
              <p className="text-sm text-gray-500">
                Use fingerprint or face ID
              </p>
            </div>
            <Switch
              checked={securitySettings.biometricLogin}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  biometricLogin: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Alerts</Label>
              <p className="text-sm text-gray-500">
                Get notified of new logins
              </p>
            </div>
            <Switch
              checked={securitySettings.loginAlerts}
              onCheckedChange={(checked) =>
                setSecuritySettings({
                  ...securitySettings,
                  loginAlerts: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Change Password</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Current password"
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
              />
              <Input
                type="password"
                placeholder="New password"
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-500"
              />
            </div>
            <Button className="bg-gray-100 border border-gray-200">
              Update Password
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

      {/* Appearance Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-[16px] md:text-[20px]">
              Appearance
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={appearanceSettings.theme}
              onValueChange={(value) =>
                setAppearanceSettings({ ...appearanceSettings, theme: value })
              }
            >
              <SelectTrigger
                id="theme"
                className="h-11 w-full rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 data-placeholder:text-gray-400"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem
                  value="dark"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  Dark
                </SelectItem>
                <SelectItem
                  value="system"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  System
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={appearanceSettings.language}
              onValueChange={(value) =>
                setAppearanceSettings({
                  ...appearanceSettings,
                  language: value,
                })
              }
            >
              <SelectTrigger
                id="language"
                className="h-11 w-full rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 data-placeholder:text-gray-400"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                <SelectItem
                  value="en"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  English
                </SelectItem>
                <SelectItem
                  value="tw"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  Twi
                </SelectItem>
                <SelectItem
                  value="ga"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  Ga
                </SelectItem>
                <SelectItem
                  value="ee"
                  className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                >
                  Ewe
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button className="bg-red-400 hover:bg-red-500 text-white">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
