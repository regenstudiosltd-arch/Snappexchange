// src/components/settings/Profilesection.tsx

'use client';

import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  ProfileFormState,
  UserType,
  USER_TYPES,
  SaveButton,
  SectionShell,
  SectionHeader,
  SectionBody,
  SectionFooter,
} from './Shared';

interface ProfileSectionProps {
  profileSettings: ProfileFormState;
  onProfileChange: (updated: ProfileFormState) => void;
  onSave: () => void;
  isPending: boolean;
}

export function ProfileSection({
  profileSettings,
  onProfileChange,
  onSave,
  isPending,
}: ProfileSectionProps) {
  const set = (patch: Partial<ProfileFormState>) =>
    onProfileChange({ ...profileSettings, ...patch });

  return (
    <SectionShell id="profile">
      <SectionHeader
        icon={<User className="h-4 w-4" />}
        title="Profile Information"
        description="Your personal details and account identity"
      />

      <SectionBody>
        {/* Name + Type row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="fullName"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Full Name
            </Label>
            <Input
              id="fullName"
              value={profileSettings.fullName}
              onChange={(e) => set({ fullName: e.target.value })}
              className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="userType"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Account Type
            </Label>
            <Select
              value={profileSettings.userType}
              onValueChange={(v) => set({ userType: v as UserType })}
            >
              <SelectTrigger
                id="userType"
                className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60 shadow-lg">
                {USER_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="text-sm">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              className="h-10 pl-9 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              value={profileSettings.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label
            htmlFor="phone"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Phone Number
          </Label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60"
              aria-hidden
            />
            <Input
              id="phone"
              type="tel"
              className="h-10 pl-9 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              value={profileSettings.phoneNumber}
              onChange={(e) => set({ phoneNumber: e.target.value })}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
        </div>

        {/* GPS Address */}
        <div className="space-y-1.5">
          <Label
            htmlFor="digitalAddress"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Ghana Post GPS Address
          </Label>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60"
              aria-hidden
            />
            <Input
              id="digitalAddress"
              className="h-10 pl-9 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              value={profileSettings.digitalAddress}
              onChange={(e) => set({ digitalAddress: e.target.value })}
              placeholder="e.g. AK-123-4567"
            />
          </div>
        </div>
      </SectionBody>

      <SectionFooter>
        <SaveButton
          onClick={onSave}
          isPending={isPending}
          idleLabel="Save Profile"
          pendingLabel="Saving…"
        />
      </SectionFooter>
    </SectionShell>
  );
}
