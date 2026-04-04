'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  RotateCcw,
  AlertCircle,
  User,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Trash2,
  ChevronRight,
} from 'lucide-react';

import { authService } from '@/src/services/auth.service';
import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';

import { SettingsSkeleton } from '../settings/Settingsskeleton';
import { ProfileSection } from '../settings/Profilesection';
import { PayoutSection } from '../settings/Payoutsection';

import {
  ProfileFormState,
  PayoutFormState,
  NotificationSettings,
  SecuritySettings,
  AppearanceSettings,
  MomoProvider,
  FeedbackBanner,
  extractApiError,
  readLocalStorage,
  validatePasswordChange,
  defaultNotifications,
  defaultSecurity,
  defaultAppearance,
  PROFILE_STALE_TIME_MS,
  LS_KEY_NOTIFICATIONS,
  LS_KEY_SECURITY,
  LS_KEY_APPEARANCE,
} from '../settings/Shared';

import { useFeedback } from '@/src/hooks/useSettings';

// ── Dynamic imports — below-fold sections ──────────────────────────────────────
const SectionPlaceholder = () => (
  <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden animate-pulse">
    <div className="px-6 py-5 border-b border-border/60 flex items-start gap-4">
      <div className="h-8 w-8 rounded-xl bg-muted shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-3 w-60 bg-muted rounded" />
      </div>
    </div>
    <div className="px-6 py-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 w-full bg-muted rounded-lg" />
      ))}
    </div>
  </div>
);

const NotificationsSection = dynamic(
  () =>
    import('../settings/Notificationssection').then((m) => ({
      default: m.NotificationsSection,
    })),
  { loading: () => <SectionPlaceholder /> },
);

const SecuritySection = dynamic(
  () =>
    import('../settings/Securitysection').then((m) => ({
      default: m.SecuritySection,
    })),
  { loading: () => <SectionPlaceholder /> },
);

const AppearanceSection = dynamic(
  () =>
    import('../settings/Appearancesection').then((m) => ({
      default: m.AppearanceSection,
    })),
  { loading: () => <SectionPlaceholder /> },
);

const DangerZoneSection = dynamic(
  () =>
    import('../settings/Dangerzonesection').then((m) => ({
      default: m.DangerZoneSection,
    })),
  { loading: () => <SectionPlaceholder /> },
);

const PasswordSuccessModal = dynamic(() =>
  import('../settings/Passwordsuccessmodal').then((m) => ({
    default: m.PasswordSuccessModal,
  })),
);

function SettingsErrorState({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Small delay so the spinner is visible before the page reloads
    setTimeout(() => onRetry(), 600);
  };

  return (
    <div
      role="alert"
      className="flex items-center justify-center min-h-min-h-105 px-4"
    >
      <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Icon with pulsing ring */}
        <div className="relative w-16 h-16 flex items-center justify-center mb-6">
          <span className="absolute inset-0 rounded-full bg-destructive/10 animate-ping opacity-20" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
          </div>
        </div>

        {/* Copy */}
        <h2 className="text-base font-semibold text-foreground mb-2 tracking-tight">
          Couldn&apos;t load your profile
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-65">
          There was a problem fetching your settings. This is usually temporary
          — try again or go back.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl
                       bg-destructive/10 hover:bg-destructive/15 border border-destructive/20
                       text-destructive text-sm font-medium
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Retrying…
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Try again
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-0.5">
            <span className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
              or
            </span>
            <span className="flex-1 h-px bg-border/50" />
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl
                       bg-transparent hover:bg-muted/60 border border-border/60
                       text-muted-foreground text-sm
                       transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Go back
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/40 mt-6 leading-relaxed">
          Still stuck? Try clearing your browser cache.
        </p>
      </div>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'payout', label: 'Payout', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]['id'];

// ─── Active-section tracker ───────────────────────────────────────────────────
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

// ─── 1. PARENT — data fetcher ─────────────────────────────────────────────────
export function SettingsPage() {
  const { status } = useSession();

  const {
    data: backendProfile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    staleTime: PROFILE_STALE_TIME_MS,
    enabled: status === 'authenticated',
  });

  if (isLoading || status === 'loading') return <SettingsSkeleton />;

  if (error || !backendProfile) {
    return <SettingsErrorState onRetry={() => window.location.reload()} />;
  }

  return <SettingsForm backendProfile={backendProfile} />;
}

// ─── 2. CHILD — orchestrator ──────────────────────────────────────────────────
interface SettingsFormProps {
  backendProfile: UserProfile;
}

function SettingsForm({ backendProfile }: SettingsFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { feedback, setFeedback } = useFeedback();

  const activeSection = useActiveSection(NAV_ITEMS.map((n) => n.id));

  // ── Password fields ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [profileSettings, setProfileSettings] = useState<ProfileFormState>(
    () => ({
      fullName: backendProfile.full_name ?? '',
      email: backendProfile.email ?? '',
      phoneNumber: backendProfile.momo_number ?? '',
      digitalAddress: backendProfile.ghana_post_address ?? '',
      userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
    }),
  );

  const [payoutSettings, setPayoutSettings] = useState<PayoutFormState>(() => ({
    provider: (backendProfile.momo_provider as MomoProvider) ?? 'mtn',
    accountNumber: backendProfile.momo_number ?? '',
    accountName: backendProfile.momo_name ?? '',
  }));

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(() =>
      readLocalStorage(LS_KEY_NOTIFICATIONS, defaultNotifications()),
    );

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    () => readLocalStorage(LS_KEY_SECURITY, defaultSecurity()),
  );

  const [appearanceSettings, setAppearanceSettings] =
    useState<AppearanceSettings>(() =>
      readLocalStorage(LS_KEY_APPEARANCE, defaultAppearance()),
    );

  // ── Mutations ────────────────────────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      authService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    },
    onError: (err: unknown) => {
      setFeedback({
        type: 'error',
        message: extractApiError(err, 'Profile update failed.'),
      });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      authService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setFeedback({ type: 'success', message: 'Payout account updated!' });
    },
    onError: (err: unknown) => {
      setFeedback({
        type: 'error',
        message: extractApiError(err, 'Payout update failed.'),
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      authService.changePassword(payload),
    onSuccess: () => {
      setIsModalOpen(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (err: unknown) => {
      setFeedback({
        type: 'error',
        message: extractApiError(err, 'Password update failed.'),
      });
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSaveProfile = useCallback(() => {
    profileMutation.mutate({
      full_name: profileSettings.fullName,
      email: profileSettings.email,
      momo_number: profileSettings.phoneNumber,
      ghana_post_address: profileSettings.digitalAddress,
      user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
    });
  }, [profileMutation, profileSettings]);

  const handleSavePayout = useCallback(() => {
    payoutMutation.mutate({
      momo_provider: payoutSettings.provider,
      momo_number: payoutSettings.accountNumber,
      momo_name: payoutSettings.accountName,
    });
  }, [payoutMutation, payoutSettings]);

  const handleSaveNotifications = useCallback(() => {
    localStorage.setItem(
      LS_KEY_NOTIFICATIONS,
      JSON.stringify(notificationSettings),
    );
    setFeedback({
      type: 'success',
      message: 'Notification preferences saved!',
    });
  }, [notificationSettings, setFeedback]);

  const handleSaveSecurity = useCallback(() => {
    localStorage.setItem(LS_KEY_SECURITY, JSON.stringify(securitySettings));
    setFeedback({ type: 'success', message: 'Security settings saved!' });
  }, [securitySettings, setFeedback]);

  const handleSaveAppearance = useCallback(() => {
    localStorage.setItem(LS_KEY_APPEARANCE, JSON.stringify(appearanceSettings));
    setFeedback({ type: 'success', message: 'Appearance settings saved!' });
  }, [appearanceSettings, setFeedback]);

  const handleUpdatePassword = useCallback(() => {
    const err = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmNewPassword,
    );
    if (err) {
      setFeedback({ type: 'error', message: err });
      return;
    }
    passwordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  }, [
    currentPassword,
    newPassword,
    confirmNewPassword,
    passwordMutation,
    setFeedback,
  ]);

  const handleRedirectToLogin = useCallback(() => {
    signOut({ redirect: false }).then(() => router.push('/login'));
    setIsModalOpen(false);
  }, [router]);

  const scrollTo = (id: SectionId) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const initials = profileSettings.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, preferences and security
        </p>
      </div>

      {/* ── Feedback banner ──────────────────────────────────────────────────── */}
      {feedback && (
        <div className="mb-6">
          <FeedbackBanner feedback={feedback} />
        </div>
      )}

      {/* ── Mobile pill nav ───────────────────────────────────────────────────────
           Must live OUTSIDE the flex row so it spans full width and sticky
           positioning works correctly. The -mx-4 bleed + px-4 trick only works
           when this element is a direct child of the padded content wrapper.    */}
      <div className="lg:hidden sticky top-0 z-20 -mx-4 px-0 mb-5 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            const isDanger = id === 'danger';
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? isDanger
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
                      : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50'
                    : 'bg-muted/50 text-muted-foreground border-border/40 hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div className="flex gap-6 xl:gap-8 items-start">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-3 w-52 shrink-0 sticky top-6">
          {/* Avatar card */}
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex flex-col items-center gap-3 shadow-sm">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20">
                {backendProfile.profile_picture ? (
                  <Image
                    src={backendProfile.profile_picture}
                    alt={profileSettings.fullName || 'Profile picture'}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-white tracking-wide">
                      {initials || <User className="h-7 w-7 text-white" />}
                    </span>
                  </div>
                )}
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-card ring-1 ring-emerald-400/40" />
            </div>
            <div className="text-center min-w-0 w-full">
              <p className="text-sm font-semibold text-foreground truncate">
                {profileSettings.fullName || 'Your Name'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {profileSettings.email || 'your@email.com'}
              </p>
              <span className="inline-flex mt-2 items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20">
                {profileSettings.userType}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Navigation
            </p>
            <ul className="pb-2">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                const isDanger = id === 'danger';
                return (
                  <li key={id}>
                    <button
                      onClick={() => scrollTo(id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 group relative ${
                        isActive
                          ? isDanger
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20'
                            : 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {isActive && (
                        <span
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${
                            isDanger ? 'bg-red-500' : 'bg-cyan-500'
                          }`}
                        />
                      )}
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                          isDanger && isActive ? 'text-red-500' : ''
                        }`}
                      />
                      <span className="truncate">{label}</span>
                      <ChevronRight
                        className={`ml-auto h-3 w-3 transition-opacity ${
                          isActive
                            ? 'opacity-60'
                            : 'opacity-0 group-hover:opacity-30'
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5 pb-24 lg:pb-0">
          <ProfileSection
            profileSettings={profileSettings}
            onProfileChange={setProfileSettings}
            onSave={handleSaveProfile}
            isPending={profileMutation.isPending}
          />

          <PayoutSection
            payoutSettings={payoutSettings}
            onPayoutChange={setPayoutSettings}
            onSave={handleSavePayout}
            isPending={payoutMutation.isPending}
          />

          <NotificationsSection
            settings={notificationSettings}
            onChange={setNotificationSettings}
            onSave={handleSaveNotifications}
          />

          <SecuritySection
            settings={securitySettings}
            onChange={setSecuritySettings}
            onSave={handleSaveSecurity}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmNewPassword={confirmNewPassword}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmNewPassword}
            onUpdatePassword={handleUpdatePassword}
            isPasswordPending={passwordMutation.isPending}
          />

          <AppearanceSection
            appearanceSettings={appearanceSettings}
            onAppearanceChange={setAppearanceSettings}
            onSave={handleSaveAppearance}
          />

          <DangerZoneSection />
        </div>
      </div>

      <PasswordSuccessModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSkip={handleRedirectToLogin}
        onComplete={handleRedirectToLogin}
      />
    </>
  );
}
