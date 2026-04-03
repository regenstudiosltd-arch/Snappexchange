// src/components/settings/Shared.tsx

'use client';

// ─── Constants ────────────────────────────────────────────────────────────────

export const PROFILE_STALE_TIME_MS = 5 * 60 * 1000;
export const FEEDBACK_CLEAR_DELAY_MS = 3500;
export const PASSWORD_CHANGE_COUNTDOWN_SEC = 5;
export const MIN_PASSWORD_LENGTH = 8;

export const MOMO_PROVIDERS = [
  { value: 'mtn', label: 'MTN MoMo' },
  { value: 'telecel', label: 'Telecel Cash' },
  { value: 'airteltigo', label: 'AirtelTigo Cash' },
] as const;

export const USER_TYPES = [
  { value: 'Student', label: 'Student' },
  { value: 'Worker', label: 'Worker' },
] as const;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'tw', label: 'Twi' },
  { value: 'ga', label: 'Ga' },
  { value: 'ee', label: 'Ewe' },
] as const;

export const LS_KEY_NOTIFICATIONS = 'snappx_notifications';
export const LS_KEY_SECURITY = 'snappx_security';
export const LS_KEY_APPEARANCE = 'snappx_appearance';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MomoProvider = 'mtn' | 'telecel' | 'airteltigo';
export type UserType = 'Student' | 'Worker';
export type ThemeValue = 'light' | 'dark' | 'system';
export type FeedbackType = 'success' | 'error';

export interface Feedback {
  type: FeedbackType;
  message: string;
}

export interface ProfileFormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  digitalAddress: string;
  userType: UserType;
}

export interface PayoutFormState {
  provider: MomoProvider;
  accountNumber: string;
  accountName: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  contributionReminders: boolean;
  groupUpdates: boolean;
  promotions: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricLogin: boolean;
  loginAlerts: boolean;
}

export interface AppearanceSettings {
  language: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function extractApiError(err: unknown, fallback: string): string {
  const typed = err as { response?: { data?: { error?: string } } } | undefined;
  return typed?.response?.data?.error ?? fallback;
}

export function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): string | null {
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return 'All password fields are required.';
  }
  if (newPassword !== confirmNewPassword) {
    return 'New passwords do not match.';
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

// ─── Default state factories ──────────────────────────────────────────────────

export function defaultNotifications(): NotificationSettings {
  return {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    contributionReminders: true,
    groupUpdates: true,
    promotions: false,
  };
}

export function defaultSecurity(): SecuritySettings {
  return {
    twoFactorAuth: false,
    biometricLogin: true,
    loginAlerts: true,
  };
}

export function defaultAppearance(): AppearanceSettings {
  return { language: 'en' };
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

interface SwitchRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  withSeparator?: boolean;
}

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  withSeparator = true,
}: SwitchRowProps) {
  return (
    <>
      <div className="group flex items-center justify-between py-1 transition-all">
        <div className="space-y-0.5 pr-8">
          <Label className="text-sm font-medium text-foreground cursor-pointer leading-snug">
            {label}
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="shrink-0 data-[state=checked]:bg-cyan-500"
        />
      </div>
      {withSeparator && <Separator className="opacity-50" />}
    </>
  );
}

interface SaveButtonProps {
  onClick: () => void;
  isPending: boolean;
  pendingLabel: string;
  idleLabel: string;
  variant?: 'primary' | 'outline' | 'destructive';
}

export function SaveButton({
  onClick,
  isPending,
  pendingLabel,
  idleLabel,
  variant = 'primary',
}: SaveButtonProps) {
  if (variant === 'destructive') {
    return (
      <Button
        onClick={onClick}
        disabled={isPending}
        variant="destructive"
        size="sm"
        className="h-9 px-4 text-sm font-medium rounded-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" aria-hidden />
            {pendingLabel}
          </>
        ) : (
          idleLabel
        )}
      </Button>
    );
  }

  if (variant === 'outline') {
    return (
      <Button
        onClick={onClick}
        disabled={isPending}
        variant="outline"
        size="sm"
        className="h-9 px-4 text-sm font-medium rounded-lg border-border hover:bg-muted/60 transition-all"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" aria-hidden />
            {pendingLabel}
          </>
        ) : (
          idleLabel
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      size="sm"
      className="h-9 px-5 text-sm font-medium rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-500/20 transition-all disabled:opacity-60"
    >
      {isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  );
}

interface FeedbackBannerProps {
  feedback: Feedback | null;
}

export function FeedbackBanner({ feedback }: FeedbackBannerProps) {
  if (!feedback) return null;
  const isSuccess = feedback.type === 'success';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${
        isSuccess
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60 dark:text-emerald-400'
          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800/60 dark:text-red-400'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {feedback.message}
    </div>
  );
}

// ─── Section Shell ────────────────────────────────────────────────────────────

interface SectionShellProps {
  id: string;
  children: React.ReactNode;
}

export function SectionShell({ id, children }: SectionShellProps) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden transition-all"
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: string;
}

export function SectionHeader({
  icon,
  title,
  description,
  accent = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
}: SectionHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-border/60 flex items-start gap-4">
      <div className={`mt-0.5 p-2 rounded-xl ${accent}`}>{icon}</div>
      <div>
        <h2 className="text-base font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SectionBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-6 space-y-5">{children}</div>;
}

export function SectionFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center gap-3">
      {children}
    </div>
  );
}
