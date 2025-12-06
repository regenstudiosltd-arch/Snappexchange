"use client";

import { useState } from "react";
import { User, Lock, Bell, CreditCard, Shield, Globe, Moon, Smartphone, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";

export function SettingsPage() {
  const [profileData, setProfileData] = useState({
    fullName: "Kwame Mensah",
    email: "kwame.mensah@example.com",
    phoneNumber: "+233541413623",
    digitalAddress: "GA-123-4567",
    userType: "Worker",
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
    theme: "light",
    language: "en",
  });

  const handleSaveProfile = () => {
    // Save profile data
    localStorage.setItem("snappx_profile", JSON.stringify(profileData));
    alert("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    localStorage.setItem("snappx_notifications", JSON.stringify(notificationSettings));
    alert("Notification settings updated!");
  };

  const handleSaveSecurity = () => {
    // Save security settings
    localStorage.setItem("snappx_security", JSON.stringify(securitySettings));
    alert("Security settings updated!");
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-600" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={profileData.userType}
                onValueChange={(value) => setProfileData({ ...profileData, userType: value })}
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
                type="email"
                className="pl-10"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                className="pl-10"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
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
                value={profileData.digitalAddress}
                onChange={(e) => setProfileData({ ...profileData, digitalAddress: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="bg-cyan-500 hover:bg-cyan-600">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-cyan-600" />
            <CardTitle>Payout Account</CardTitle>
          </div>
          <CardDescription>Manage your default payout method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutProvider">Provider</Label>
            <Select defaultValue="mtn">
              <SelectTrigger id="payoutProvider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN Momo</SelectItem>
                <SelectItem value="telecel">Telecel Cash</SelectItem>
                <SelectItem value="airtel">Airtel Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="024XXXXXXX"
              defaultValue="0541413623"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="Your registered name"
              defaultValue="Kwame Mensah"
            />
          </div>

          <Button variant="outline">Update Payout Account</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-600" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
            </div>
            <Switch
              checked={notificationSettings.smsNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications</p>
            </div>
            <Switch
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Contribution Reminders</Label>
              <p className="text-sm text-muted-foreground">Remind me before due dates</p>
            </div>
            <Switch
              checked={notificationSettings.contributionReminders}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, contributionReminders: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Group Updates</Label>
              <p className="text-sm text-muted-foreground">Notify about group activities</p>
            </div>
            <Switch
              checked={notificationSettings.groupUpdates}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, groupUpdates: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotions & Tips</Label>
              <p className="text-sm text-muted-foreground">Receive savings tips and offers</p>
            </div>
            <Switch
              checked={notificationSettings.promotions}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, promotions: checked })
              }
            />
          </div>

          <Button onClick={handleSaveNotifications} className="bg-cyan-500 hover:bg-cyan-600">
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-600" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) =>
                setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Biometric Login</Label>
              <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
            </div>
            <Switch
              checked={securitySettings.biometricLogin}
              onCheckedChange={(checked) =>
                setSecuritySettings({ ...securitySettings, biometricLogin: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified of new logins</p>
            </div>
            <Switch
              checked={securitySettings.loginAlerts}
              onCheckedChange={(checked) =>
                setSecuritySettings({ ...securitySettings, loginAlerts: checked })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Change Password</Label>
            <div className="flex gap-2">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
            </div>
            <Button variant="outline">Update Password</Button>
          </div>

          <Button onClick={handleSaveSecurity} className="bg-cyan-500 hover:bg-cyan-600">
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-cyan-600" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={appearanceSettings.theme}
              onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value })}
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
              onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, language: value })}
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
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
