// src/components/settings/Securitysection.tsx

'use client';

import { Shield, KeyRound } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  SecuritySettings,
  SaveButton,
  SwitchRow,
  SectionShell,
  SectionHeader,
  SectionBody,
  SectionFooter,
} from './Shared';

interface SecuritySectionProps {
  settings: SecuritySettings;
  onChange: (updated: SecuritySettings) => void;
  onSave: () => void;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onUpdatePassword: () => void;
  isPasswordPending: boolean;
}

export function SecuritySection({
  settings,
  onChange,
  onSave,
  currentPassword,
  newPassword,
  confirmNewPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onUpdatePassword,
  isPasswordPending,
}: SecuritySectionProps) {
  const set = (patch: Partial<SecuritySettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <SectionShell id="security">
      <SectionHeader
        icon={<Shield className="h-4 w-4" />}
        title="Security"
        description="Manage your account access and authentication"
        accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />

      <SectionBody>
        {/* Toggles group */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
            Protection
          </p>
          <div className="space-y-3">
            <SwitchRow
              label="Two-Factor Authentication"
              description="Require a second factor when signing in"
              checked={settings.twoFactorAuth}
              onCheckedChange={(v) => set({ twoFactorAuth: v })}
            />
            <SwitchRow
              label="Login Alerts"
              description="Get notified when a new device signs in"
              checked={settings.loginAlerts}
              onCheckedChange={(v) => set({ loginAlerts: v })}
              withSeparator={false}
            />
          </div>
        </div>

        {/* Change password group */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground/60" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Change Password
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="space-y-1.5">
              <Label
                htmlFor="currentPassword"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="newPassword"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={(e) => onConfirmPasswordChange(e.target.value)}
                  className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-1">
              <SaveButton
                onClick={onUpdatePassword}
                isPending={isPasswordPending}
                idleLabel="Update Password"
                pendingLabel="Updating…"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </SectionBody>

      <SectionFooter>
        <SaveButton
          onClick={onSave}
          isPending={false}
          idleLabel="Save Security Settings"
          pendingLabel="Saving…"
        />
      </SectionFooter>
    </SectionShell>
  );
}
