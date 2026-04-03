'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
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
  const {
    data: backendProfile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    staleTime: PROFILE_STALE_TIME_MS,
  });

  if (isLoading) return <SettingsSkeleton />;

  if (error || !backendProfile) {
    return (
      <div
        role="alert"
        className="flex items-center justify-center gap-2 py-20 text-destructive text-sm"
      >
        <AlertCircle className="h-5 w-5" aria-hidden />
        Failed to load profile. Please refresh the page.
      </div>
    );
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
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-xl font-bold text-white tracking-wide">
                  {initials || <User className="h-7 w-7 text-white" />}
                </span>
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
        {/*
          pb-24 on mobile clears the fixed .mobile-nav bar (from globals.css).
          lg:pb-0 removes it once the bottom bar is hidden at ≥768 px.
        */}
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

// 'use client';

// import dynamic from 'next/dynamic';
// import { useState, useCallback, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import {
//   AlertCircle,
//   User,
//   CreditCard,
//   Bell,
//   Shield,
//   Palette,
//   Trash2,
//   ChevronRight,
// } from 'lucide-react';

// import { authService } from '@/src/services/auth.service';
// import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';

// import { SettingsSkeleton } from '../settings/Settingsskeleton';
// import { ProfileSection } from '../settings/Profilesection';
// import { PayoutSection } from '../settings/Payoutsection';

// import {
//   ProfileFormState,
//   PayoutFormState,
//   NotificationSettings,
//   SecuritySettings,
//   AppearanceSettings,
//   MomoProvider,
//   FeedbackBanner,
//   extractApiError,
//   readLocalStorage,
//   validatePasswordChange,
//   defaultNotifications,
//   defaultSecurity,
//   defaultAppearance,
//   PROFILE_STALE_TIME_MS,
//   LS_KEY_NOTIFICATIONS,
//   LS_KEY_SECURITY,
//   LS_KEY_APPEARANCE,
// } from '../settings/Shared';

// import { useFeedback } from '@/src/hooks/useSettings';

// // ── Dynamic imports — below-fold sections ──────────────────────────────────────
// const SectionPlaceholder = () => (
//   <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden animate-pulse">
//     <div className="px-6 py-5 border-b border-border/60 flex items-start gap-4">
//       <div className="h-8 w-8 rounded-xl bg-muted shrink-0" />
//       <div className="space-y-2 flex-1">
//         <div className="h-4 w-40 bg-muted rounded" />
//         <div className="h-3 w-60 bg-muted rounded" />
//       </div>
//     </div>
//     <div className="px-6 py-6 space-y-4">
//       {[1, 2, 3].map((i) => (
//         <div key={i} className="h-10 w-full bg-muted rounded-lg" />
//       ))}
//     </div>
//   </div>
// );

// const NotificationsSection = dynamic(
//   () =>
//     import('../settings/Notificationssection').then((m) => ({
//       default: m.NotificationsSection,
//     })),
//   { loading: () => <SectionPlaceholder /> },
// );

// const SecuritySection = dynamic(
//   () =>
//     import('../settings/Securitysection').then((m) => ({
//       default: m.SecuritySection,
//     })),
//   { loading: () => <SectionPlaceholder /> },
// );

// const AppearanceSection = dynamic(
//   () =>
//     import('../settings/Appearancesection').then((m) => ({
//       default: m.AppearanceSection,
//     })),
//   { loading: () => <SectionPlaceholder /> },
// );

// const DangerZoneSection = dynamic(
//   () =>
//     import('../settings/Dangerzonesection').then((m) => ({
//       default: m.DangerZoneSection,
//     })),
//   { loading: () => <SectionPlaceholder /> },
// );

// const PasswordSuccessModal = dynamic(() =>
//   import('../settings/Passwordsuccessmodal').then((m) => ({
//     default: m.PasswordSuccessModal,
//   })),
// );

// // ─── Nav config ───────────────────────────────────────────────────────────────
// const NAV_ITEMS = [
//   { id: 'profile', label: 'Profile', icon: User },
//   { id: 'payout', label: 'Payout', icon: CreditCard },
//   { id: 'notifications', label: 'Notifications', icon: Bell },
//   { id: 'security', label: 'Security', icon: Shield },
//   { id: 'appearance', label: 'Appearance', icon: Palette },
//   { id: 'danger', label: 'Danger Zone', icon: Trash2 },
// ] as const;

// type SectionId = (typeof NAV_ITEMS)[number]['id'];

// // ─── Active-section tracker ───────────────────────────────────────────────────
// function useActiveSection(ids: readonly string[]) {
//   const [active, setActive] = useState<string>(ids[0]);

//   useEffect(() => {
//     const observers: IntersectionObserver[] = [];

//     ids.forEach((id) => {
//       const el = document.getElementById(id);
//       if (!el) return;

//       const obs = new IntersectionObserver(
//         ([entry]) => {
//           if (entry.isIntersecting) setActive(id);
//         },
//         { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
//       );
//       obs.observe(el);
//       observers.push(obs);
//     });

//     return () => observers.forEach((o) => o.disconnect());
//   }, [ids]);

//   return active;
// }

// // ─── 1. PARENT — data fetcher ─────────────────────────────────────────────────
// export function SettingsPage() {
//   const {
//     data: backendProfile,
//     isLoading,
//     error,
//   } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: PROFILE_STALE_TIME_MS,
//   });

//   if (isLoading) return <SettingsSkeleton />;

//   if (error || !backendProfile) {
//     return (
//       <div
//         role="alert"
//         className="flex items-center justify-center gap-2 py-20 text-destructive text-sm"
//       >
//         <AlertCircle className="h-5 w-5" aria-hidden />
//         Failed to load profile. Please refresh the page.
//       </div>
//     );
//   }

//   return <SettingsForm backendProfile={backendProfile} />;
// }

// // ─── 2. CHILD — orchestrator ──────────────────────────────────────────────────
// interface SettingsFormProps {
//   backendProfile: UserProfile;
// }

// function SettingsForm({ backendProfile }: SettingsFormProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { feedback, setFeedback } = useFeedback();

//   const activeSection = useActiveSection(NAV_ITEMS.map((n) => n.id));

//   // ── Password fields ──────────────────────────────────────────────────────────
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ── Form state ───────────────────────────────────────────────────────────────
//   const [profileSettings, setProfileSettings] = useState<ProfileFormState>(
//     () => ({
//       fullName: backendProfile.full_name ?? '',
//       email: backendProfile.email ?? '',
//       phoneNumber: backendProfile.momo_number ?? '',
//       digitalAddress: backendProfile.ghana_post_address ?? '',
//       userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
//     }),
//   );

//   const [payoutSettings, setPayoutSettings] = useState<PayoutFormState>(() => ({
//     provider: (backendProfile.momo_provider as MomoProvider) ?? 'mtn',
//     accountNumber: backendProfile.momo_number ?? '',
//     accountName: backendProfile.momo_name ?? '',
//   }));

//   const [notificationSettings, setNotificationSettings] =
//     useState<NotificationSettings>(() =>
//       readLocalStorage(LS_KEY_NOTIFICATIONS, defaultNotifications()),
//     );

//   const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
//     () => readLocalStorage(LS_KEY_SECURITY, defaultSecurity()),
//   );

//   const [appearanceSettings, setAppearanceSettings] =
//     useState<AppearanceSettings>(() =>
//       readLocalStorage(LS_KEY_APPEARANCE, defaultAppearance()),
//     );

//   // ── Mutations ────────────────────────────────────────────────────────────────
//   const profileMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Profile updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Profile update failed.'),
//       });
//     },
//   });

//   const payoutMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({ type: 'success', message: 'Payout account updated!' });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Payout update failed.'),
//       });
//     },
//   });

//   const passwordMutation = useMutation({
//     mutationFn: (payload: { current_password: string; new_password: string }) =>
//       authService.changePassword(payload),
//     onSuccess: () => {
//       setIsModalOpen(true);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Password update failed.'),
//       });
//     },
//   });

//   // ── Handlers ─────────────────────────────────────────────────────────────────
//   const handleSaveProfile = useCallback(() => {
//     profileMutation.mutate({
//       full_name: profileSettings.fullName,
//       email: profileSettings.email,
//       momo_number: profileSettings.phoneNumber,
//       ghana_post_address: profileSettings.digitalAddress,
//       user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
//     });
//   }, [profileMutation, profileSettings]);

//   const handleSavePayout = useCallback(() => {
//     payoutMutation.mutate({
//       momo_provider: payoutSettings.provider,
//       momo_number: payoutSettings.accountNumber,
//       momo_name: payoutSettings.accountName,
//     });
//   }, [payoutMutation, payoutSettings]);

//   const handleSaveNotifications = useCallback(() => {
//     localStorage.setItem(
//       LS_KEY_NOTIFICATIONS,
//       JSON.stringify(notificationSettings),
//     );
//     setFeedback({
//       type: 'success',
//       message: 'Notification preferences saved!',
//     });
//   }, [notificationSettings, setFeedback]);

//   const handleSaveSecurity = useCallback(() => {
//     localStorage.setItem(LS_KEY_SECURITY, JSON.stringify(securitySettings));
//     setFeedback({ type: 'success', message: 'Security settings saved!' });
//   }, [securitySettings, setFeedback]);

//   const handleSaveAppearance = useCallback(() => {
//     localStorage.setItem(LS_KEY_APPEARANCE, JSON.stringify(appearanceSettings));
//     setFeedback({ type: 'success', message: 'Appearance settings saved!' });
//   }, [appearanceSettings, setFeedback]);

//   const handleUpdatePassword = useCallback(() => {
//     const err = validatePasswordChange(
//       currentPassword,
//       newPassword,
//       confirmNewPassword,
//     );
//     if (err) {
//       setFeedback({ type: 'error', message: err });
//       return;
//     }
//     passwordMutation.mutate({
//       current_password: currentPassword,
//       new_password: newPassword,
//     });
//   }, [
//     currentPassword,
//     newPassword,
//     confirmNewPassword,
//     passwordMutation,
//     setFeedback,
//   ]);

//   const handleRedirectToLogin = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//     setIsModalOpen(false);
//   }, [router]);

//   const scrollTo = (id: SectionId) => {
//     document
//       .getElementById(id)
//       ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   // ── Derived ───────────────────────────────────────────────────────────────────
//   const initials = profileSettings.fullName
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);

//   // ── Render ────────────────────────────────────────────────────────────────────
//   return (
//     <>
//       {/* ── Page header ──────────────────────────────────────────────────────── */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold tracking-tight text-foreground">
//           Settings
//         </h1>
//         <p className="text-sm text-muted-foreground mt-1">
//           Manage your account, preferences and security
//         </p>
//       </div>

//       {/* ── Feedback banner ──────────────────────────────────────────────────── */}
//       {feedback && (
//         <div className="mb-6">
//           <FeedbackBanner feedback={feedback} />
//         </div>
//       )}

//       {/* ── Two-column layout ─────────────────────────────────────────────────── */}
//       <div className="flex gap-8 items-start">
//         {/* ── Sidebar ───────────────────────────────────────────────────────── */}
//         <aside className="hidden lg:flex flex-col gap-3 w-52 shrink-0 sticky top-6">
//           {/* Avatar card */}
//           <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex flex-col items-center gap-3 shadow-sm">
//             <div className="relative">
//               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
//                 <span className="text-xl font-bold text-white tracking-wide">
//                   {initials || <User className="h-7 w-7 text-white" />}
//                 </span>
//               </div>
//               {/* Online dot */}
//               <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-card ring-1 ring-emerald-400/40" />
//             </div>
//             <div className="text-center min-w-0 w-full">
//               <p className="text-sm font-semibold text-foreground truncate">
//                 {profileSettings.fullName || 'Your Name'}
//               </p>
//               <p className="text-[11px] text-muted-foreground truncate mt-0.5">
//                 {profileSettings.email || 'your@email.com'}
//               </p>
//               <span className="inline-flex mt-2 items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20">
//                 {profileSettings.userType}
//               </span>
//             </div>
//           </div>

//           {/* Nav links */}
//           <nav className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
//             <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
//               Navigation
//             </p>
//             <ul className="pb-2">
//               {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
//                 const isActive = activeSection === id;
//                 const isDanger = id === 'danger';
//                 return (
//                   <li key={id}>
//                     <button
//                       onClick={() => scrollTo(id)}
//                       className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 group relative ${
//                         isActive
//                           ? isDanger
//                             ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20'
//                             : 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/20'
//                           : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
//                       }`}
//                     >
//                       {/* Active indicator */}
//                       {isActive && (
//                         <span
//                           className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${
//                             isDanger ? 'bg-red-500' : 'bg-cyan-500'
//                           }`}
//                         />
//                       )}
//                       <Icon
//                         className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 ${
//                           isDanger && isActive ? 'text-red-500' : ''
//                         }`}
//                       />
//                       <span className="truncate">{label}</span>
//                       <ChevronRight
//                         className={`ml-auto h-3 w-3 transition-opacity ${
//                           isActive
//                             ? 'opacity-60'
//                             : 'opacity-0 group-hover:opacity-30'
//                         }`}
//                       />
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>
//           </nav>
//         </aside>

//         {/* ── Mobile horizontal nav ─────────────────────────────────────────── */}
//         <div className="lg:hidden -mx-4 px-4 mb-6 sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40 pb-3 pt-1 overflow-x-auto no-scrollbar flex gap-2">
//           {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
//             const isActive = activeSection === id;
//             const isDanger = id === 'danger';
//             return (
//               <button
//                 key={id}
//                 onClick={() => scrollTo(id)}
//                 className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
//                   isActive
//                     ? isDanger
//                       ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
//                       : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50'
//                     : 'bg-muted/50 text-muted-foreground border-border/40 hover:text-foreground'
//                 }`}
//               >
//                 <Icon className="h-3 w-3" />
//                 {label}
//               </button>
//             );
//           })}
//         </div>

//         {/* ── Main content ──────────────────────────────────────────────────── */}
//         <div className="flex-1 min-w-0 space-y-5 mb-20 md:mb-0">
//           <ProfileSection
//             profileSettings={profileSettings}
//             onProfileChange={setProfileSettings}
//             onSave={handleSaveProfile}
//             isPending={profileMutation.isPending}
//           />

//           <PayoutSection
//             payoutSettings={payoutSettings}
//             onPayoutChange={setPayoutSettings}
//             onSave={handleSavePayout}
//             isPending={payoutMutation.isPending}
//           />

//           <NotificationsSection
//             settings={notificationSettings}
//             onChange={setNotificationSettings}
//             onSave={handleSaveNotifications}
//           />

//           <SecuritySection
//             settings={securitySettings}
//             onChange={setSecuritySettings}
//             onSave={handleSaveSecurity}
//             currentPassword={currentPassword}
//             newPassword={newPassword}
//             confirmNewPassword={confirmNewPassword}
//             onCurrentPasswordChange={setCurrentPassword}
//             onNewPasswordChange={setNewPassword}
//             onConfirmPasswordChange={setConfirmNewPassword}
//             onUpdatePassword={handleUpdatePassword}
//             isPasswordPending={passwordMutation.isPending}
//           />

//           <AppearanceSection
//             appearanceSettings={appearanceSettings}
//             onAppearanceChange={setAppearanceSettings}
//             onSave={handleSaveAppearance}
//           />

//           <DangerZoneSection />
//         </div>
//       </div>

//       <PasswordSuccessModal
//         open={isModalOpen}
//         onOpenChange={setIsModalOpen}
//         onSkip={handleRedirectToLogin}
//         onComplete={handleRedirectToLogin}
//       />
//     </>
//   );
// }

// // src/components/pages/SettingsPage.tsx

// 'use client';

// import { useState, useCallback } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import { AlertCircle } from 'lucide-react';

// import { authService } from '@/src/services/auth.service';
// import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';

// import { SettingsSkeleton } from '../settings/Settingsskeleton';
// import { ProfileSection } from '../settings/Profilesection';
// import { PayoutSection } from '../settings/Payoutsection';
// import { NotificationsSection } from '../settings/Notificationssection';
// import { SecuritySection } from '../settings/Securitysection';
// import { AppearanceSection } from '../settings/Appearancesection';
// import { DangerZoneSection } from '../settings/Dangerzonesection';
// import { PasswordSuccessModal } from '../settings/Passwordsuccessmodal';

// import {
//   ProfileFormState,
//   PayoutFormState,
//   NotificationSettings,
//   SecuritySettings,
//   AppearanceSettings,
//   MomoProvider,
//   FeedbackBanner,
//   extractApiError,
//   readLocalStorage,
//   validatePasswordChange,
//   defaultNotifications,
//   defaultSecurity,
//   defaultAppearance,
//   PROFILE_STALE_TIME_MS,
//   LS_KEY_NOTIFICATIONS,
//   LS_KEY_SECURITY,
//   LS_KEY_APPEARANCE,
// } from '../settings/Shared';

// import { useFeedback } from '@/src/hooks/useSettings';

// // ─── 1. PARENT — data fetcher ─────────────────────────────────────────────────

// export function SettingsPage() {
//   const {
//     data: backendProfile,
//     isLoading,
//     error,
//   } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: PROFILE_STALE_TIME_MS,
//   });

//   if (isLoading) return <SettingsSkeleton />;

//   if (error || !backendProfile) {
//     return (
//       <div
//         role="alert"
//         className="flex items-center justify-center gap-2 py-20 text-destructive text-sm"
//       >
//         <AlertCircle className="h-5 w-5" aria-hidden />
//         Failed to load profile. Please refresh the page.
//       </div>
//     );
//   }

//   return <SettingsForm backendProfile={backendProfile} />;
// }

// // ─── 2. CHILD — orchestrator ──────────────────────────────────────────────────

// interface SettingsFormProps {
//   backendProfile: UserProfile;
// }

// function SettingsForm({ backendProfile }: SettingsFormProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { feedback, setFeedback } = useFeedback();

//   // ── Password fields ──────────────────────────────────────────────────────────
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ── Form state ───────────────────────────────────────────────────────────────
//   const [profileSettings, setProfileSettings] = useState<ProfileFormState>(
//     () => ({
//       fullName: backendProfile.full_name ?? '',
//       email: backendProfile.email ?? '',
//       phoneNumber: backendProfile.momo_number ?? '',
//       digitalAddress: backendProfile.ghana_post_address ?? '',
//       userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
//     }),
//   );

//   const [payoutSettings, setPayoutSettings] = useState<PayoutFormState>(() => ({
//     provider: (backendProfile.momo_provider as MomoProvider) ?? 'mtn',
//     accountNumber: backendProfile.momo_number ?? '',
//     accountName: backendProfile.momo_name ?? '',
//   }));

//   const [notificationSettings, setNotificationSettings] =
//     useState<NotificationSettings>(() =>
//       readLocalStorage(LS_KEY_NOTIFICATIONS, defaultNotifications()),
//     );

//   const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
//     () => readLocalStorage(LS_KEY_SECURITY, defaultSecurity()),
//   );

//   const [appearanceSettings, setAppearanceSettings] =
//     useState<AppearanceSettings>(() =>
//       readLocalStorage(LS_KEY_APPEARANCE, defaultAppearance()),
//     );

//   // ── Mutations ────────────────────────────────────────────────────────────────
//   const profileMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Profile updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Profile update failed.'),
//       });
//     },
//   });

//   const payoutMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({ type: 'success', message: 'Payout account updated!' });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Payout update failed.'),
//       });
//     },
//   });

//   const passwordMutation = useMutation({
//     mutationFn: (payload: { current_password: string; new_password: string }) =>
//       authService.changePassword(payload),
//     onSuccess: () => {
//       setIsModalOpen(true);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Password update failed.'),
//       });
//     },
//   });

//   // ── Handlers ─────────────────────────────────────────────────────────────────
//   const handleSaveProfile = useCallback(() => {
//     profileMutation.mutate({
//       full_name: profileSettings.fullName,
//       email: profileSettings.email,
//       momo_number: profileSettings.phoneNumber,
//       ghana_post_address: profileSettings.digitalAddress,
//       user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
//     });
//   }, [profileMutation, profileSettings]);

//   const handleSavePayout = useCallback(() => {
//     payoutMutation.mutate({
//       momo_provider: payoutSettings.provider,
//       momo_number: payoutSettings.accountNumber,
//       momo_name: payoutSettings.accountName,
//     });
//   }, [payoutMutation, payoutSettings]);

//   const handleSaveNotifications = useCallback(() => {
//     localStorage.setItem(
//       LS_KEY_NOTIFICATIONS,
//       JSON.stringify(notificationSettings),
//     );
//     setFeedback({
//       type: 'success',
//       message: 'Notification preferences saved!',
//     });
//   }, [notificationSettings, setFeedback]);

//   const handleSaveSecurity = useCallback(() => {
//     localStorage.setItem(LS_KEY_SECURITY, JSON.stringify(securitySettings));
//     setFeedback({ type: 'success', message: 'Security settings saved!' });
//   }, [securitySettings, setFeedback]);

//   const handleSaveAppearance = useCallback(() => {
//     localStorage.setItem(LS_KEY_APPEARANCE, JSON.stringify(appearanceSettings));
//     setFeedback({ type: 'success', message: 'Appearance settings saved!' });
//   }, [appearanceSettings, setFeedback]);

//   const handleUpdatePassword = useCallback(() => {
//     const err = validatePasswordChange(
//       currentPassword,
//       newPassword,
//       confirmNewPassword,
//     );
//     if (err) {
//       setFeedback({ type: 'error', message: err });
//       return;
//     }
//     passwordMutation.mutate({
//       current_password: currentPassword,
//       new_password: newPassword,
//     });
//   }, [
//     currentPassword,
//     newPassword,
//     confirmNewPassword,
//     passwordMutation,
//     setFeedback,
//   ]);

//   const handleRedirectToLogin = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//     setIsModalOpen(false);
//   }, [router]);

//   // ── Render ───────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <div className="space-y-6 max-w-4xl mb-20 md:mb-0">
//         {/* Page heading */}
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-foreground">
//             Settings
//           </h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Manage your account, preferences and security
//           </p>
//         </div>

//         {/* Inline feedback */}
//         {feedback && <FeedbackBanner feedback={feedback} />}

//         <div className="space-y-6">
//           <ProfileSection
//             profileSettings={profileSettings}
//             onProfileChange={setProfileSettings}
//             onSave={handleSaveProfile}
//             isPending={profileMutation.isPending}
//           />

//           <PayoutSection
//             payoutSettings={payoutSettings}
//             onPayoutChange={setPayoutSettings}
//             onSave={handleSavePayout}
//             isPending={payoutMutation.isPending}
//           />

//           <NotificationsSection
//             settings={notificationSettings}
//             onChange={setNotificationSettings}
//             onSave={handleSaveNotifications}
//           />

//           <SecuritySection
//             settings={securitySettings}
//             onChange={setSecuritySettings}
//             onSave={handleSaveSecurity}
//             currentPassword={currentPassword}
//             newPassword={newPassword}
//             confirmNewPassword={confirmNewPassword}
//             onCurrentPasswordChange={setCurrentPassword}
//             onNewPasswordChange={setNewPassword}
//             onConfirmPasswordChange={setConfirmNewPassword}
//             onUpdatePassword={handleUpdatePassword}
//             isPasswordPending={passwordMutation.isPending}
//           />

//           <AppearanceSection
//             appearanceSettings={appearanceSettings}
//             onAppearanceChange={setAppearanceSettings}
//             onSave={handleSaveAppearance}
//           />

//           <DangerZoneSection />
//         </div>
//       </div>

//       <PasswordSuccessModal
//         open={isModalOpen}
//         onOpenChange={setIsModalOpen}
//         onSkip={handleRedirectToLogin}
//         onComplete={handleRedirectToLogin}
//       />
//     </>
//   );
// }

// 'use client';

// import { useState, useCallback } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import {
//   AlertCircle,
//   User,
//   CreditCard,
//   Bell,
//   Shield,
//   Moon,
//   TriangleAlert,
// } from 'lucide-react';

// import { authService } from '@/src/services/auth.service';
// import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';

// // import { SettingsSkeleton } from './SettingsSkeleton';
// import { SettingsSkeleton } from '../settings/Settingsskeleton';
// import { ProfileSection } from '../settings/Profilesection';
// import { PayoutSection } from '../settings/Payoutsection';
// import { NotificationsSection } from '../settings/Notificationssection';
// import { SecuritySection } from '../settings/Securitysection';
// import { AppearanceSection } from '../settings/Appearancesection';
// import { DangerZoneSection } from '../settings/Dangerzonesection';
// import { PasswordSuccessModal } from '../settings/Passwordsuccessmodal';

// import {
//   ProfileFormState,
//   PayoutFormState,
//   NotificationSettings,
//   SecuritySettings,
//   AppearanceSettings,
//   MomoProvider,
//   FeedbackBanner,
//   extractApiError,
//   readLocalStorage,
//   validatePasswordChange,
//   defaultNotifications,
//   defaultSecurity,
//   defaultAppearance,
//   PROFILE_STALE_TIME_MS,
//   LS_KEY_NOTIFICATIONS,
//   LS_KEY_SECURITY,
//   LS_KEY_APPEARANCE,
// } from '../settings/Shared';

// import { useFeedback } from '@/src/hooks/useSettings';

// // ─── Navigation ───────────────────────────────────────────────────────────────

// const NAV_ITEMS = [
//   { id: 'profile', label: 'Profile', icon: User },
//   { id: 'payout', label: 'Payout', icon: CreditCard },
//   { id: 'notifications', label: 'Notifications', icon: Bell },
//   { id: 'security', label: 'Security', icon: Shield },
//   { id: 'appearance', label: 'Appearance', icon: Moon },
//   { id: 'danger', label: 'Danger Zone', icon: TriangleAlert, danger: true },
// ] as const;

// function SidebarNav({ active }: { active: string }) {
//   const scrollTo = (id: string) => {
//     document
//       .getElementById(id)
//       ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   return (
//     <nav
//       aria-label="Settings navigation"
//       className="hidden lg:flex flex-col gap-0.5 w-52 shrink-0 sticky top-6 self-start"
//     >
//       {NAV_ITEMS.map(({ id, label, icon: Icon, danger }) => {
//         const isActive = active === id;
//         return (
//           <button
//             key={id}
//             type="button"
//             onClick={() => scrollTo(id)}
//             className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
//               danger
//                 ? isActive
//                   ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
//                   : 'text-muted-foreground hover:bg-red-50/60 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400'
//                 : isActive
//                   ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300'
//                   : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
//             }`}
//           >
//             {/* Active indicator bar */}
//             <span
//               className={`absolute left-0 w-0.5 h-5 rounded-full transition-all ${
//                 isActive
//                   ? danger
//                     ? 'bg-red-500 opacity-100'
//                     : 'bg-cyan-500 opacity-100'
//                   : 'opacity-0'
//               }`}
//             />
//             <Icon
//               className={`h-4 w-4 shrink-0 transition-colors ${
//                 isActive
//                   ? danger
//                     ? 'text-red-500'
//                     : 'text-cyan-500'
//                   : 'text-muted-foreground/60 group-hover:text-muted-foreground'
//               }`}
//               aria-hidden
//             />
//             {label}
//           </button>
//         );
//       })}
//     </nav>
//   );
// }

// // ─── Mobile pill nav ──────────────────────────────────────────────────────────

// function MobileNav() {
//   const scrollTo = (id: string) => {
//     document
//       .getElementById(id)
//       ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   return (
//     <nav
//       aria-label="Settings navigation"
//       className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4"
//     >
//       {NAV_ITEMS.map(({ id, label, icon: Icon, danger }) => (
//         <button
//           key={id}
//           type="button"
//           onClick={() => scrollTo(id)}
//           className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 ${
//             danger
//               ? 'border-red-200 text-red-600 bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:bg-red-950/20'
//               : 'border-border/60 text-muted-foreground bg-muted/40 hover:bg-muted/70'
//           }`}
//         >
//           <Icon className="h-3 w-3" aria-hidden />
//           {label}
//         </button>
//       ))}
//     </nav>
//   );
// }

// // ─── 1. PARENT — data fetcher ─────────────────────────────────────────────────

// export function SettingsPage() {
//   const {
//     data: backendProfile,
//     isLoading,
//     error,
//   } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: PROFILE_STALE_TIME_MS,
//   });

//   if (isLoading) return <SettingsSkeleton />;

//   if (error || !backendProfile) {
//     return (
//       <div
//         role="alert"
//         className="flex items-center justify-center gap-2 py-20 text-destructive text-sm"
//       >
//         <AlertCircle className="h-5 w-5" aria-hidden />
//         Failed to load profile. Please refresh the page.
//       </div>
//     );
//   }

//   return <SettingsForm backendProfile={backendProfile} />;
// }

// // ─── 2. CHILD — orchestrator ──────────────────────────────────────────────────

// interface SettingsFormProps {
//   backendProfile: UserProfile;
// }

// function SettingsForm({ backendProfile }: SettingsFormProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { feedback, setFeedback } = useFeedback();

//   // ── Password fields ──────────────────────────────────────────────────────────
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ── Form state ───────────────────────────────────────────────────────────────
//   const [profileSettings, setProfileSettings] = useState<ProfileFormState>(
//     () => ({
//       fullName: backendProfile.full_name ?? '',
//       email: backendProfile.email ?? '',
//       phoneNumber: backendProfile.momo_number ?? '',
//       digitalAddress: backendProfile.ghana_post_address ?? '',
//       userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
//     }),
//   );

//   const [payoutSettings, setPayoutSettings] = useState<PayoutFormState>(() => ({
//     provider: (backendProfile.momo_provider as MomoProvider) ?? 'mtn',
//     accountNumber: backendProfile.momo_number ?? '',
//     accountName: backendProfile.momo_name ?? '',
//   }));

//   const [notificationSettings, setNotificationSettings] =
//     useState<NotificationSettings>(() =>
//       readLocalStorage(LS_KEY_NOTIFICATIONS, defaultNotifications()),
//     );

//   const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
//     () => readLocalStorage(LS_KEY_SECURITY, defaultSecurity()),
//   );

//   const [appearanceSettings, setAppearanceSettings] =
//     useState<AppearanceSettings>(() =>
//       readLocalStorage(LS_KEY_APPEARANCE, defaultAppearance()),
//     );

//   // ── Mutations ────────────────────────────────────────────────────────────────
//   const profileMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Profile updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Profile update failed.'),
//       });
//     },
//   });

//   const payoutMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({ type: 'success', message: 'Payout account updated!' });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Payout update failed.'),
//       });
//     },
//   });

//   const passwordMutation = useMutation({
//     mutationFn: (payload: { current_password: string; new_password: string }) =>
//       authService.changePassword(payload),
//     onSuccess: () => {
//       setIsModalOpen(true);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Password update failed.'),
//       });
//     },
//   });

//   // ── Handlers ─────────────────────────────────────────────────────────────────
//   const handleSaveProfile = useCallback(() => {
//     profileMutation.mutate({
//       full_name: profileSettings.fullName,
//       email: profileSettings.email,
//       momo_number: profileSettings.phoneNumber,
//       ghana_post_address: profileSettings.digitalAddress,
//       user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
//     });
//   }, [profileMutation, profileSettings]);

//   const handleSavePayout = useCallback(() => {
//     payoutMutation.mutate({
//       momo_provider: payoutSettings.provider,
//       momo_number: payoutSettings.accountNumber,
//       momo_name: payoutSettings.accountName,
//     });
//   }, [payoutMutation, payoutSettings]);

//   const handleSaveNotifications = useCallback(() => {
//     localStorage.setItem(
//       LS_KEY_NOTIFICATIONS,
//       JSON.stringify(notificationSettings),
//     );
//     setFeedback({
//       type: 'success',
//       message: 'Notification preferences saved!',
//     });
//   }, [notificationSettings, setFeedback]);

//   const handleSaveSecurity = useCallback(() => {
//     localStorage.setItem(LS_KEY_SECURITY, JSON.stringify(securitySettings));
//     setFeedback({ type: 'success', message: 'Security settings saved!' });
//   }, [securitySettings, setFeedback]);

//   const handleSaveAppearance = useCallback(() => {
//     localStorage.setItem(LS_KEY_APPEARANCE, JSON.stringify(appearanceSettings));
//     setFeedback({ type: 'success', message: 'Appearance settings saved!' });
//   }, [appearanceSettings, setFeedback]);

//   const handleUpdatePassword = useCallback(() => {
//     const err = validatePasswordChange(
//       currentPassword,
//       newPassword,
//       confirmNewPassword,
//     );
//     if (err) {
//       setFeedback({ type: 'error', message: err });
//       return;
//     }
//     passwordMutation.mutate({
//       current_password: currentPassword,
//       new_password: newPassword,
//     });
//   }, [
//     currentPassword,
//     newPassword,
//     confirmNewPassword,
//     passwordMutation,
//     setFeedback,
//   ]);

//   const handleRedirectToLogin = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//     setIsModalOpen(false);
//   }, [router]);

//   // ── Render ───────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <div className="space-y-6 max-w-5xl mb-20 md:mb-0">
//         {/* Page heading */}
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-foreground">
//             Settings
//           </h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Manage your account, preferences and security
//           </p>
//         </div>

//         {/* Inline feedback */}
//         {feedback && <FeedbackBanner feedback={feedback} />}

//         {/* Mobile pill navigation */}
//         <MobileNav />

//         {/* Two-column layout: sidebar + content */}
//         <div className="flex gap-8 items-start relative">
//           <SidebarNav active="profile" />

//           <div className="flex-1 min-w-0 space-y-6">
//             <ProfileSection
//               profileSettings={profileSettings}
//               onProfileChange={setProfileSettings}
//               onSave={handleSaveProfile}
//               isPending={profileMutation.isPending}
//             />

//             <PayoutSection
//               payoutSettings={payoutSettings}
//               onPayoutChange={setPayoutSettings}
//               onSave={handleSavePayout}
//               isPending={payoutMutation.isPending}
//             />

//             <NotificationsSection
//               settings={notificationSettings}
//               onChange={setNotificationSettings}
//               onSave={handleSaveNotifications}
//             />

//             <SecuritySection
//               settings={securitySettings}
//               onChange={setSecuritySettings}
//               onSave={handleSaveSecurity}
//               currentPassword={currentPassword}
//               newPassword={newPassword}
//               confirmNewPassword={confirmNewPassword}
//               onCurrentPasswordChange={setCurrentPassword}
//               onNewPasswordChange={setNewPassword}
//               onConfirmPasswordChange={setConfirmNewPassword}
//               onUpdatePassword={handleUpdatePassword}
//               isPasswordPending={passwordMutation.isPending}
//             />

//             <AppearanceSection
//               appearanceSettings={appearanceSettings}
//               onAppearanceChange={setAppearanceSettings}
//               onSave={handleSaveAppearance}
//             />

//             <DangerZoneSection />
//           </div>
//         </div>
//       </div>

//       <PasswordSuccessModal
//         open={isModalOpen}
//         onOpenChange={setIsModalOpen}
//         onSkip={handleRedirectToLogin}
//         onComplete={handleRedirectToLogin}
//       />
//     </>
//   );
// }

// // src/components/pages/SettingsPage.tsx

// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import {
//   User,
//   Bell,
//   CreditCard,
//   Shield,
//   Moon,
//   Mail,
//   Phone,
//   MapPin,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Switch } from '../ui/switch';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';
// import { Separator } from '../ui/separator';
// import { Skeleton } from '../ui/skeleton';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../ui/dialog';
// import { authService } from '@/src/services/auth.service';
// import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';
// import { useTheme } from '@/src/context/ThemeContext';

// // ─── Constants

// const PROFILE_STALE_TIME_MS = 5 * 60 * 1000;
// const FEEDBACK_CLEAR_DELAY_MS = 3500;
// const PASSWORD_CHANGE_COUNTDOWN_SEC = 5;
// const MIN_PASSWORD_LENGTH = 8;

// const MOMO_PROVIDERS = [
//   { value: 'mtn', label: 'MTN MoMo' },
//   { value: 'telecel', label: 'Telecel Cash' },
//   { value: 'airteltigo', label: 'AirtelTigo Cash' },
// ] as const;

// const USER_TYPES = [
//   { value: 'Student', label: 'Student' },
//   { value: 'Worker', label: 'Worker' },
// ] as const;

// const THEME_OPTIONS = [
//   { value: 'light', label: 'Light' },
//   { value: 'dark', label: 'Dark' },
//   { value: 'system', label: 'System' },
// ] as const;

// const LANGUAGE_OPTIONS = [
//   { value: 'en', label: 'English' },
//   { value: 'tw', label: 'Twi' },
//   { value: 'ga', label: 'Ga' },
//   { value: 'ee', label: 'Ewe' },
// ] as const;

// const LS_KEY_NOTIFICATIONS = 'snappx_notifications';
// const LS_KEY_SECURITY = 'snappx_security';
// const LS_KEY_APPEARANCE = 'snappx_appearance';

// // ─── Types

// type MomoProvider = 'mtn' | 'telecel' | 'airteltigo';
// type UserType = 'Student' | 'Worker';
// type ThemeValue = 'light' | 'dark' | 'system';
// type FeedbackType = 'success' | 'error';

// interface Feedback {
//   type: FeedbackType;
//   message: string;
// }

// interface ProfileFormState {
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   digitalAddress: string;
//   userType: UserType;
// }

// interface PayoutFormState {
//   provider: MomoProvider;
//   accountNumber: string;
//   accountName: string;
// }

// interface NotificationSettings {
//   emailNotifications: boolean;
//   smsNotifications: boolean;
//   pushNotifications: boolean;
//   contributionReminders: boolean;
//   groupUpdates: boolean;
//   promotions: boolean;
// }

// interface SecuritySettings {
//   twoFactorAuth: boolean;
//   biometricLogin: boolean;
//   loginAlerts: boolean;
// }

// interface AppearanceSettings {
//   language: string;
// }

// // ─── Utilities

// /** Safely extracts a server-side error message from an unknown thrown value. */
// function extractApiError(err: unknown, fallback: string): string {
//   const typed = err as { response?: { data?: { error?: string } } } | undefined;
//   return typed?.response?.data?.error ?? fallback;
// }

// /** Safely reads and parses a JSON value from localStorage. */
// function readLocalStorage<T>(key: string, fallback: T): T {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? (JSON.parse(raw) as T) : fallback;
//   } catch {
//     return fallback;
//   }
// }

// /** Validates password change fields; returns an error string or null. */
// function validatePasswordChange(
//   currentPassword: string,
//   newPassword: string,
//   confirmNewPassword: string,
// ): string | null {
//   if (!currentPassword || !newPassword || !confirmNewPassword) {
//     return 'All password fields are required.';
//   }
//   if (newPassword !== confirmNewPassword) {
//     return 'New passwords do not match.';
//   }
//   if (newPassword.length < MIN_PASSWORD_LENGTH) {
//     return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
//   }
//   return null;
// }

// // ─── Default state factories

// function defaultNotifications(): NotificationSettings {
//   return {
//     emailNotifications: true,
//     smsNotifications: true,
//     pushNotifications: true,
//     contributionReminders: true,
//     groupUpdates: true,
//     promotions: false,
//   };
// }

// function defaultSecurity(): SecuritySettings {
//   return {
//     twoFactorAuth: false,
//     biometricLogin: true,
//     loginAlerts: true,
//   };
// }

// function defaultAppearance(): AppearanceSettings {
//   return { language: 'en' };
// }

// // ─── Skeleton

// function SkeletonCardShell({
//   children,
//   titleWidth = 'w-36',
// }: {
//   children: React.ReactNode;
//   titleWidth?: string;
// }) {
//   return (
//     <Card className="bg-card border-border">
//       <CardHeader>
//         <div className="flex items-center gap-2">
//           <Skeleton className="h-5 w-5 rounded-full shrink-0" />
//           <Skeleton className={`h-5 ${titleWidth} rounded`} />
//         </div>
//         <Skeleton className="h-4 w-52 rounded mt-1" />
//       </CardHeader>
//       <CardContent className="space-y-4">{children}</CardContent>
//     </Card>
//   );
// }

// function SkeletonField({
//   labelWidth = 'w-24',
//   icon = false,
// }: {
//   labelWidth?: string;
//   icon?: boolean;
// }) {
//   return (
//     <div className="space-y-2">
//       <Skeleton className={`h-4 ${labelWidth} rounded`} />
//       <div className="relative">
//         {icon && <Skeleton className="absolute left-3 top-3 h-4 w-4 rounded" />}
//         <Skeleton className="h-10 w-full rounded-md" />
//       </div>
//     </div>
//   );
// }

// function SkeletonSwitchRow({
//   withSeparator = true,
// }: {
//   withSeparator?: boolean;
// }) {
//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div className="space-y-1.5">
//           <Skeleton className="h-4 w-32 rounded" />
//           <Skeleton className="h-3 w-48 rounded" />
//         </div>
//         {/* Switch pill */}
//         <Skeleton className="h-6 w-11 rounded-full shrink-0" />
//       </div>
//       {withSeparator && <Skeleton className="h-px w-full" />}
//     </>
//   );
// }

// function ProfileCardSkeleton() {
//   return (
//     <SkeletonCardShell titleWidth="w-40">
//       {/* Full Name + User Type — 2-col grid on md */}
//       <div className="grid gap-4 md:grid-cols-2">
//         <SkeletonField labelWidth="w-20" />
//         <SkeletonField labelWidth="w-20" />
//       </div>
//       <SkeletonField labelWidth="w-28" icon />
//       <SkeletonField labelWidth="w-28" icon />
//       <SkeletonField labelWidth="w-40" icon />
//       <Skeleton className="h-10 w-28 rounded-md" />
//     </SkeletonCardShell>
//   );
// }

// function PayoutCardSkeleton() {
//   return (
//     <SkeletonCardShell titleWidth="w-32">
//       <SkeletonField labelWidth="w-16" />
//       <SkeletonField labelWidth="w-32" />
//       <SkeletonField labelWidth="w-28" />
//       <Skeleton className="h-10 w-44 rounded-md" />
//     </SkeletonCardShell>
//   );
// }

// function NotificationsCardSkeleton() {
//   return (
//     <SkeletonCardShell titleWidth="w-28">
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow withSeparator={false} />
//       <Skeleton className="h-10 w-52 rounded-md" />
//     </SkeletonCardShell>
//   );
// }

// function SecurityCardSkeleton() {
//   return (
//     <SkeletonCardShell titleWidth="w-20">
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow />
//       <SkeletonSwitchRow />
//       {/* Change password sub-section */}
//       <div className="space-y-2">
//         <Skeleton className="h-4 w-32 rounded" />
//         {/* Two inputs side by side */}
//         <div className="flex gap-2">
//           <Skeleton className="h-10 flex-1 rounded-md" />
//           <Skeleton className="h-10 flex-1 rounded-md" />
//         </div>
//         {/* Confirm input */}
//         <Skeleton className="h-10 w-full rounded-md" />
//         <Skeleton className="h-10 w-36 rounded-md" />
//       </div>
//       <Skeleton className="h-10 w-44 rounded-md" />
//     </SkeletonCardShell>
//   );
// }

// function AppearanceCardSkeleton() {
//   return (
//     <SkeletonCardShell titleWidth="w-24">
//       <SkeletonField labelWidth="w-12" />
//       <SkeletonField labelWidth="w-20" />
//       <Skeleton className="h-10 w-36 rounded-md" />
//     </SkeletonCardShell>
//   );
// }

// function DangerZoneSkeleton() {
//   return (
//     <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
//       <CardHeader>
//         <Skeleton className="h-5 w-28 rounded" />
//         <Skeleton className="h-4 w-36 rounded mt-1" />
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center justify-between">
//           <div className="space-y-1.5">
//             <Skeleton className="h-4 w-28 rounded" />
//             <Skeleton className="h-3 w-64 rounded" />
//           </div>
//           <Skeleton className="h-10 w-32 rounded-md shrink-0" />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function SettingsSkeleton() {
//   return (
//     <div className="space-y-6 max-w-4xl mb-20 md:mb-0 animate-pulse">
//       {/* Page heading */}
//       <div className="space-y-2">
//         <Skeleton className="h-9 w-36 rounded" />
//         <Skeleton className="h-4 w-72 rounded" />
//       </div>
//       <ProfileCardSkeleton />
//       <PayoutCardSkeleton />
//       <NotificationsCardSkeleton />
//       <SecurityCardSkeleton />
//       <AppearanceCardSkeleton />
//       <DangerZoneSkeleton />
//     </div>
//   );
// }

// // ─── Shared sub-components ────────────────────────────────────────────────────

// interface SwitchRowProps {
//   label: string;
//   description: string;
//   checked: boolean;
//   onCheckedChange: (checked: boolean) => void;
//   withSeparator?: boolean;
// }

// function SwitchRow({
//   label,
//   description,
//   checked,
//   onCheckedChange,
//   withSeparator = true,
// }: SwitchRowProps) {
//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div className="space-y-0.5">
//           <Label>{label}</Label>
//           <p className="text-sm text-muted-foreground">{description}</p>
//         </div>
//         <Switch checked={checked} onCheckedChange={onCheckedChange} />
//       </div>
//       {withSeparator && <Separator />}
//     </>
//   );
// }

// interface SaveButtonProps {
//   onClick: () => void;
//   isPending: boolean;
//   pendingLabel: string;
//   idleLabel: string;
//   variant?: 'primary' | 'outline';
// }

// function SaveButton({
//   onClick,
//   isPending,
//   pendingLabel,
//   idleLabel,
//   variant = 'primary',
// }: SaveButtonProps) {
//   const primaryCls = 'bg-cyan-500 hover:bg-cyan-600 text-white';

//   return (
//     <Button
//       onClick={onClick}
//       disabled={isPending}
//       variant={variant === 'outline' ? 'outline' : 'default'}
//       className={variant === 'primary' ? primaryCls : undefined}
//     >
//       {isPending ? (
//         <>
//           <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
//           {pendingLabel}
//         </>
//       ) : (
//         idleLabel
//       )}
//     </Button>
//   );
// }

// interface FeedbackBannerProps {
//   feedback: Feedback | null;
// }

// function FeedbackBanner({ feedback }: FeedbackBannerProps) {
//   if (!feedback) return null;

//   const isSuccess = feedback.type === 'success';

//   return (
//     <div
//       role="status"
//       aria-live="polite"
//       className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-1 ${
//         isSuccess
//           ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
//           : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800'
//       }`}
//     >
//       {isSuccess ? (
//         <CheckCircle className="h-5 w-5 shrink-0" aria-hidden />
//       ) : (
//         <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
//       )}
//       {feedback.message}
//     </div>
//   );
// }

// // ─── Custom hooks ─────────────────────────────────────────────────────────────

// /**
//  * Manages a single feedback message that auto-clears after a delay.
//  * Returns the current feedback and a setter that schedules clearing it.
//  */
// function useFeedback() {
//   const [feedback, setFeedbackState] = useState<Feedback | null>(null);
//   const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const setFeedback = useCallback((next: Feedback | null) => {
//     if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
//     setFeedbackState(next);
//     if (next) {
//       clearTimerRef.current = setTimeout(
//         () => setFeedbackState(null),
//         FEEDBACK_CLEAR_DELAY_MS,
//       );
//     }
//   }, []);

//   // Clean up on unmount
//   useEffect(() => {
//     return () => {
//       if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
//     };
//   }, []);

//   return { feedback, setFeedback };
// }

// /**
//  * Runs a countdown from `total` seconds to 0 when `active` is true,
//  * calling `onComplete` when it reaches 0.
//  */
// function useCountdown(active: boolean, total: number, onComplete: () => void) {
//   const [count, setCount] = useState(total);
//   const onCompleteRef = useRef(onComplete);

//   useEffect(() => {
//     onCompleteRef.current = onComplete;
//   });

//   useEffect(() => {
//     if (!active) return; // ← just bail; cleanup handles the reset

//     const interval = setInterval(() => {
//       setCount((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           onCompleteRef.current();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//       setCount(total); // ← runs after render, never during it
//     };
//   }, [active, total]);

//   return count;
// }

// // ─── 1. PARENT — data fetcher ─────────────────────────────────────────────────

// export function SettingsPage() {
//   const {
//     data: backendProfile,
//     isLoading,
//     error,
//   } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: PROFILE_STALE_TIME_MS,
//   });

//   if (isLoading) return <SettingsSkeleton />;

//   if (error || !backendProfile) {
//     return (
//       <div
//         role="alert"
//         className="flex items-center justify-center gap-2 py-20 text-destructive text-sm"
//       >
//         <AlertCircle className="h-5 w-5" aria-hidden />
//         Failed to load profile. Please refresh the page.
//       </div>
//     );
//   }

//   return <SettingsForm backendProfile={backendProfile} />;
// }

// // ─── 2. CHILD — full form ─────────────────────────────────────────────────────

// interface SettingsFormProps {
//   backendProfile: UserProfile;
// }

// function SettingsForm({ backendProfile }: SettingsFormProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();

//   const { feedback, setFeedback } = useFeedback();

//   // ── Password fields ──────────────────────────────────────────────────────────
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');

//   // ── Modal ────────────────────────────────────────────────────────────────────
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ── Form state — initialised from backend profile ────────────────────────────
//   const [profileSettings, setProfileSettings] = useState<ProfileFormState>(
//     () => ({
//       fullName: backendProfile.full_name ?? '',
//       email: backendProfile.email ?? '',
//       phoneNumber: backendProfile.momo_number ?? '',
//       digitalAddress: backendProfile.ghana_post_address ?? '',
//       userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
//     }),
//   );

//   const [payoutSettings, setPayoutSettings] = useState<PayoutFormState>(() => ({
//     provider: (backendProfile.momo_provider as MomoProvider) ?? 'mtn',
//     accountNumber: backendProfile.momo_number ?? '',
//     accountName: backendProfile.momo_name ?? '',
//   }));

//   // ── Local-persisted settings — hydrated from localStorage on first render ────
//   const [notificationSettings, setNotificationSettings] =
//     useState<NotificationSettings>(() =>
//       readLocalStorage(LS_KEY_NOTIFICATIONS, defaultNotifications()),
//     );

//   const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
//     () => readLocalStorage(LS_KEY_SECURITY, defaultSecurity()),
//   );

//   const [appearanceSettings, setAppearanceSettings] =
//     useState<AppearanceSettings>(() =>
//       readLocalStorage(LS_KEY_APPEARANCE, defaultAppearance()),
//     );

//   // ── Countdown / auto-redirect after password change ──────────────────────────
//   const handleCountdownComplete = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//     setIsModalOpen(false);
//   }, [router]);

//   const countdown = useCountdown(
//     isModalOpen,
//     PASSWORD_CHANGE_COUNTDOWN_SEC,
//     handleCountdownComplete,
//   );

//   // ─── Mutations ───────────────────────────────────────────────────────────────

//   const profileMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Profile updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Profile update failed.'),
//       });
//     },
//   });

//   const payoutMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Payout account updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Payout update failed.'),
//       });
//     },
//   });

//   const passwordMutation = useMutation({
//     mutationFn: (payload: { current_password: string; new_password: string }) =>
//       authService.changePassword(payload),
//     onSuccess: () => {
//       setIsModalOpen(true);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Password update failed.'),
//       });
//     },
//   });

//   // ─── Handlers ────────────────────────────────────────────────────────────────

//   const handleSaveProfile = useCallback(() => {
//     profileMutation.mutate({
//       full_name: profileSettings.fullName,
//       email: profileSettings.email,
//       momo_number: profileSettings.phoneNumber,
//       ghana_post_address: profileSettings.digitalAddress,
//       user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
//     });
//   }, [profileMutation, profileSettings]);

//   const handleSavePayout = useCallback(() => {
//     payoutMutation.mutate({
//       momo_provider: payoutSettings.provider,
//       momo_number: payoutSettings.accountNumber,
//       momo_name: payoutSettings.accountName,
//     });
//   }, [payoutMutation, payoutSettings]);

//   const handleSaveNotifications = useCallback(() => {
//     localStorage.setItem(
//       LS_KEY_NOTIFICATIONS,
//       JSON.stringify(notificationSettings),
//     );
//     setFeedback({
//       type: 'success',
//       message: 'Notification preferences saved!',
//     });
//   }, [notificationSettings, setFeedback]);

//   const handleSaveSecurity = useCallback(() => {
//     localStorage.setItem(LS_KEY_SECURITY, JSON.stringify(securitySettings));
//     setFeedback({ type: 'success', message: 'Security settings saved!' });
//   }, [securitySettings, setFeedback]);

//   const handleSaveAppearance = useCallback(() => {
//     localStorage.setItem(LS_KEY_APPEARANCE, JSON.stringify(appearanceSettings));
//     setFeedback({ type: 'success', message: 'Appearance settings saved!' });
//   }, [appearanceSettings, setFeedback]);

//   const handleUpdatePassword = useCallback(() => {
//     const validationError = validatePasswordChange(
//       currentPassword,
//       newPassword,
//       confirmNewPassword,
//     );
//     if (validationError) {
//       setFeedback({ type: 'error', message: validationError });
//       return;
//     }
//     passwordMutation.mutate({
//       current_password: currentPassword,
//       new_password: newPassword,
//     });
//   }, [
//     currentPassword,
//     newPassword,
//     confirmNewPassword,
//     passwordMutation,
//     setFeedback,
//   ]);

//   const handleSkipAndLogin = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//   }, [router]);

//   // SVG countdown: circumference = 2π × r = 2π × 45 ≈ 282.74
//   const CIRCUMFERENCE = 282.74;
//   const strokeDashoffset =
//     CIRCUMFERENCE * (1 - countdown / PASSWORD_CHANGE_COUNTDOWN_SEC);

//   // ─── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <div className="space-y-6 max-w-4xl mb-20 md:mb-0">
//         {/* Page heading */}
//         <div>
//           <h1 className="text-3xl font-bold mb-1 text-foreground">Settings</h1>
//           <p className="text-muted-foreground">
//             Manage your account settings and preferences
//           </p>
//         </div>

//         <FeedbackBanner feedback={feedback} />

//         {/* ── Profile ─────────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <User className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">
//                 Profile Information
//               </CardTitle>
//             </div>
//             <CardDescription>Update your personal information</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="fullName">Full Name</Label>
//                 <Input
//                   id="fullName"
//                   value={profileSettings.fullName}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       fullName: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="userType">User Type</Label>
//                 <Select
//                   value={profileSettings.userType}
//                   onValueChange={(v) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       userType: v as UserType,
//                     }))
//                   }
//                 >
//                   <SelectTrigger id="userType">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {USER_TYPES.map(({ value, label }) => (
//                       <SelectItem key={value} value={value}>
//                         {label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address</Label>
//               <div className="relative">
//                 <Mail
//                   className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
//                   aria-hidden
//                 />
//                 <Input
//                   id="email"
//                   type="email"
//                   className="pl-10"
//                   value={profileSettings.email}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       email: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <div className="relative">
//                 <Phone
//                   className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
//                   aria-hidden
//                 />
//                 <Input
//                   id="phone"
//                   type="tel"
//                   className="pl-10"
//                   value={profileSettings.phoneNumber}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       phoneNumber: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="digitalAddress">Ghana Post GPS Address</Label>
//               <div className="relative">
//                 <MapPin
//                   className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
//                   aria-hidden
//                 />
//                 <Input
//                   id="digitalAddress"
//                   className="pl-10"
//                   value={profileSettings.digitalAddress}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       digitalAddress: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </div>

//             <SaveButton
//               onClick={handleSaveProfile}
//               isPending={profileMutation.isPending}
//               idleLabel="Save Profile"
//               pendingLabel="Saving Profile…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Payout ──────────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <CreditCard className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">
//                 Payout Account
//               </CardTitle>
//             </div>
//             <CardDescription>Manage your default payout method</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="payoutProvider">Provider</Label>
//               <Select
//                 value={payoutSettings.provider}
//                 onValueChange={(v) =>
//                   setPayoutSettings((s) => ({
//                     ...s,
//                     provider: v as MomoProvider,
//                   }))
//                 }
//               >
//                 <SelectTrigger id="payoutProvider">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {MOMO_PROVIDERS.map(({ value, label }) => (
//                     <SelectItem key={value} value={value}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="accountNumber">Account Number</Label>
//               <Input
//                 id="accountNumber"
//                 type="tel"
//                 value={payoutSettings.accountNumber}
//                 onChange={(e) =>
//                   setPayoutSettings((s) => ({
//                     ...s,
//                     accountNumber: e.target.value,
//                   }))
//                 }
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="accountName">Account Name</Label>
//               <Input
//                 id="accountName"
//                 value={payoutSettings.accountName}
//                 onChange={(e) =>
//                   setPayoutSettings((s) => ({
//                     ...s,
//                     accountName: e.target.value,
//                   }))
//                 }
//               />
//             </div>

//             <SaveButton
//               onClick={handleSavePayout}
//               isPending={payoutMutation.isPending}
//               idleLabel="Update Payout Account"
//               pendingLabel="Saving Payout…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Notifications ───────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Bell className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">
//                 Notifications
//               </CardTitle>
//             </div>
//             <CardDescription>
//               Configure how you receive notifications
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <SwitchRow
//               label="Email Notifications"
//               description="Receive updates via email"
//               checked={notificationSettings.emailNotifications}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   emailNotifications: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="SMS Notifications"
//               description="Receive updates via SMS"
//               checked={notificationSettings.smsNotifications}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   smsNotifications: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="Push Notifications"
//               description="Receive push notifications"
//               checked={notificationSettings.pushNotifications}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   pushNotifications: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="Contribution Reminders"
//               description="Remind me before due dates"
//               checked={notificationSettings.contributionReminders}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   contributionReminders: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="Group Updates"
//               description="Notify about group activities"
//               checked={notificationSettings.groupUpdates}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({ ...s, groupUpdates: v }))
//               }
//             />
//             <SwitchRow
//               label="Promotions & Tips"
//               description="Receive savings tips and offers"
//               checked={notificationSettings.promotions}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({ ...s, promotions: v }))
//               }
//               withSeparator={false}
//             />

//             <SaveButton
//               onClick={handleSaveNotifications}
//               isPending={false}
//               idleLabel="Save Notification Preferences"
//               pendingLabel="Saving…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Security ────────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Shield className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">Security</CardTitle>
//             </div>
//             <CardDescription>Manage your account security</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <SwitchRow
//               label="Two-Factor Authentication"
//               description="Add an extra layer of security"
//               checked={securitySettings.twoFactorAuth}
//               onCheckedChange={(v) =>
//                 setSecuritySettings((s) => ({ ...s, twoFactorAuth: v }))
//               }
//             />
//             <SwitchRow
//               label="Login Alerts"
//               description="Get notified of new logins"
//               checked={securitySettings.loginAlerts}
//               onCheckedChange={(v) =>
//                 setSecuritySettings((s) => ({ ...s, loginAlerts: v }))
//               }
//             />

//             {/* Change password */}
//             <div className="space-y-2">
//               <Label>Change Password</Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="password"
//                   placeholder="Current password"
//                   autoComplete="current-password"
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                 />
//                 <Input
//                   type="password"
//                   placeholder="New password"
//                   autoComplete="new-password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                 />
//               </div>
//               <Input
//                 type="password"
//                 placeholder="Confirm new password"
//                 autoComplete="new-password"
//                 value={confirmNewPassword}
//                 onChange={(e) => setConfirmNewPassword(e.target.value)}
//               />
//               <SaveButton
//                 onClick={handleUpdatePassword}
//                 isPending={passwordMutation.isPending}
//                 idleLabel="Update Password"
//                 pendingLabel="Updating Password…"
//                 variant="outline"
//               />
//             </div>

//             <SaveButton
//               onClick={handleSaveSecurity}
//               isPending={false}
//               idleLabel="Save Security Settings"
//               pendingLabel="Saving…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Appearance ──────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Moon className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">Appearance</CardTitle>
//             </div>
//             <CardDescription>Customize your app experience</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="theme">Theme</Label>
//               <Select
//                 value={theme}
//                 onValueChange={(v) => setTheme(v as ThemeValue)}
//               >
//                 <SelectTrigger id="theme">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {THEME_OPTIONS.map(({ value, label }) => (
//                     <SelectItem key={value} value={value}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="language">Language</Label>
//               <Select
//                 value={appearanceSettings.language}
//                 onValueChange={(v) =>
//                   setAppearanceSettings((s) => ({ ...s, language: v }))
//                 }
//               >
//                 <SelectTrigger id="language">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {LANGUAGE_OPTIONS.map(({ value, label }) => (
//                     <SelectItem key={value} value={value}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <SaveButton
//               onClick={handleSaveAppearance}
//               isPending={false}
//               idleLabel="Save Appearance"
//               pendingLabel="Saving…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Danger Zone ─────────────────────────────────────────────────────── */}
//         <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30">
//           <CardHeader>
//             <CardTitle className="text-red-600">Danger Zone</CardTitle>
//             <CardDescription>Irreversible actions</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-semibold">Delete Account</p>
//                 <p className="text-sm text-muted-foreground">
//                   Permanently delete your account and all data
//                 </p>
//               </div>
//               <Button variant="destructive">Delete Account</Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Password-change success modal ─────────────────────────────────────── */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 overflow-hidden">
//           <div className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
//             {/* Animated success icon */}
//             <div className="relative flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
//               <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 dark:bg-emerald-900/30 opacity-75" />
//               <CheckCircle
//                 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 relative z-10"
//                 aria-hidden
//               />
//             </div>

//             <DialogHeader className="flex flex-col items-center text-center space-y-2 mb-8">
//               <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
//                 Password Updated!
//               </DialogTitle>
//               <DialogDescription className="text-base text-muted-foreground max-w-xs">
//                 Your security details have been saved. We are securely routing
//                 you to the login screen.
//               </DialogDescription>
//             </DialogHeader>

//             {/* Circular countdown */}
//             <div className="relative flex items-center justify-center mb-8">
//               <svg
//                 className="w-20 h-20 -rotate-90"
//                 viewBox="0 0 100 100"
//                 aria-label={`Redirecting in ${countdown} seconds`}
//                 role="timer"
//               >
//                 <circle
//                   cx="50"
//                   cy="50"
//                   r="45"
//                   className="fill-none stroke-muted"
//                   strokeWidth="6"
//                 />
//                 <circle
//                   cx="50"
//                   cy="50"
//                   r="45"
//                   className="fill-none stroke-emerald-500 transition-all duration-1000 ease-linear"
//                   strokeWidth="6"
//                   strokeDasharray={CIRCUMFERENCE}
//                   strokeDashoffset={strokeDashoffset}
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <span
//                 className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground tabular-nums"
//                 aria-hidden
//               >
//                 {countdown}
//               </span>
//             </div>

//             <Button
//               onClick={handleSkipAndLogin}
//               variant="outline"
//               className="w-full h-12 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
//             >
//               Skip &amp; Login Now
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import {
//   User,
//   Bell,
//   CreditCard,
//   Shield,
//   Moon,
//   Mail,
//   Phone,
//   MapPin,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Switch } from '../ui/switch';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';
// import { Separator } from '../ui/separator';
// import { Skeleton } from '../ui/skeleton';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../ui/dialog';
// import { authService } from '@/src/services/auth.service';
// import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';
// import { useTheme } from '@/src/context/ThemeContext';

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PROFILE_STALE_TIME_MS = 5 * 60 * 1000;
// const FEEDBACK_CLEAR_DELAY_MS = 3500;
// const PASSWORD_CHANGE_COUNTDOWN_SEC = 5;
// const MIN_PASSWORD_LENGTH = 8;

// const MOMO_PROVIDERS = [
//   { value: 'mtn', label: 'MTN MoMo' },
//   { value: 'telecel', label: 'Telecel Cash' },
//   { value: 'airteltigo', label: 'AirtelTigo Cash' },
// ] as const;

// const USER_TYPES = [
//   { value: 'Student', label: 'Student' },
//   { value: 'Worker', label: 'Worker' },
// ] as const;

// const THEME_OPTIONS = [
//   { value: 'light', label: 'Light' },
//   { value: 'dark', label: 'Dark' },
//   { value: 'system', label: 'System' },
// ] as const;

// const LANGUAGE_OPTIONS = [
//   { value: 'en', label: 'English' },
//   { value: 'tw', label: 'Twi' },
//   { value: 'ga', label: 'Ga' },
//   { value: 'ee', label: 'Ewe' },
// ] as const;

// const LS_KEY_NOTIFICATIONS = 'snappx_notifications';
// const LS_KEY_SECURITY = 'snappx_security';
// const LS_KEY_APPEARANCE = 'snappx_appearance';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type MomoProvider = 'mtn' | 'telecel' | 'airteltigo';
// type UserType = 'Student' | 'Worker';
// type ThemeValue = 'light' | 'dark' | 'system';
// type FeedbackType = 'success' | 'error';

// interface Feedback {
//   type: FeedbackType;
//   message: string;
// }

// interface ProfileFormState {
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   digitalAddress: string;
//   userType: UserType;
// }

// interface PayoutFormState {
//   provider: MomoProvider;
//   accountNumber: string;
//   accountName: string;
// }

// interface NotificationSettings {
//   emailNotifications: boolean;
//   smsNotifications: boolean;
//   pushNotifications: boolean;
//   contributionReminders: boolean;
//   groupUpdates: boolean;
//   promotions: boolean;
// }

// interface SecuritySettings {
//   twoFactorAuth: boolean;
//   biometricLogin: boolean;
//   loginAlerts: boolean;
// }

// interface AppearanceSettings {
//   language: string;
// }

// // ─── Utilities ────────────────────────────────────────────────────────────────

// /** Safely extracts a server-side error message from an unknown thrown value. */
// function extractApiError(err: unknown, fallback: string): string {
//   const typed = err as { response?: { data?: { error?: string } } } | undefined;
//   return typed?.response?.data?.error ?? fallback;
// }

// /** Safely reads and parses a JSON value from localStorage. */
// function readLocalStorage<T>(key: string, fallback: T): T {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? (JSON.parse(raw) as T) : fallback;
//   } catch {
//     return fallback;
//   }
// }

// /** Validates password change fields; returns an error string or null. */
// function validatePasswordChange(
//   currentPassword: string,
//   newPassword: string,
//   confirmNewPassword: string,
// ): string | null {
//   if (!currentPassword || !newPassword || !confirmNewPassword) {
//     return 'All password fields are required.';
//   }
//   if (newPassword !== confirmNewPassword) {
//     return 'New passwords do not match.';
//   }
//   if (newPassword.length < MIN_PASSWORD_LENGTH) {
//     return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
//   }
//   return null;
// }

// // ─── Default state factories ──────────────────────────────────────────────────

// function defaultNotifications(): NotificationSettings {
//   return {
//     emailNotifications: true,
//     smsNotifications: true,
//     pushNotifications: true,
//     contributionReminders: true,
//     groupUpdates: true,
//     promotions: false,
//   };
// }

// function defaultSecurity(): SecuritySettings {
//   return {
//     twoFactorAuth: false,
//     biometricLogin: true,
//     loginAlerts: true,
//   };
// }

// function defaultAppearance(): AppearanceSettings {
//   return { language: 'en' };
// }

// // ─── Skeleton ─────────────────────────────────────────────────────────────────

// function SkeletonCard({
//   rows = 3,
//   icon = true,
// }: {
//   rows?: number;
//   icon?: boolean;
// }) {
//   return (
//     <Card className="bg-card border-border">
//       <CardHeader>
//         <div className="flex items-center gap-2">
//           {icon && <Skeleton className="h-5 w-5 rounded-full" />}
//           <Skeleton className="h-5 w-36 rounded" />
//         </div>
//         <Skeleton className="h-4 w-52 rounded mt-1" />
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {Array.from({ length: rows }).map((_, i) => (
//           <div key={i} className="space-y-2">
//             <Skeleton className="h-4 w-24 rounded" />
//             <Skeleton className="h-10 w-full rounded-md" />
//           </div>
//         ))}
//         <Skeleton className="h-10 w-32 rounded-md" />
//       </CardContent>
//     </Card>
//   );
// }

// function SettingsSkeleton() {
//   return (
//     <div className="space-y-6 max-w-4xl mb-20 md:mb-0 animate-pulse">
//       <div className="space-y-2">
//         <Skeleton className="h-8 w-40 rounded" />
//         <Skeleton className="h-4 w-72 rounded" />
//       </div>
//       <SkeletonCard rows={4} />
//       <SkeletonCard rows={3} />
//       <SkeletonCard rows={6} icon={true} />
//       <SkeletonCard rows={4} />
//       <SkeletonCard rows={2} />
//     </div>
//   );
// }

// // ─── Shared sub-components ────────────────────────────────────────────────────

// interface SwitchRowProps {
//   label: string;
//   description: string;
//   checked: boolean;
//   onCheckedChange: (checked: boolean) => void;
//   withSeparator?: boolean;
// }

// function SwitchRow({
//   label,
//   description,
//   checked,
//   onCheckedChange,
//   withSeparator = true,
// }: SwitchRowProps) {
//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div className="space-y-0.5">
//           <Label>{label}</Label>
//           <p className="text-sm text-muted-foreground">{description}</p>
//         </div>
//         <Switch checked={checked} onCheckedChange={onCheckedChange} />
//       </div>
//       {withSeparator && <Separator />}
//     </>
//   );
// }

// interface SaveButtonProps {
//   onClick: () => void;
//   isPending: boolean;
//   pendingLabel: string;
//   idleLabel: string;
//   variant?: 'primary' | 'outline';
// }

// function SaveButton({
//   onClick,
//   isPending,
//   pendingLabel,
//   idleLabel,
//   variant = 'primary',
// }: SaveButtonProps) {
//   const primaryCls = 'bg-cyan-500 hover:bg-cyan-600 text-white';

//   return (
//     <Button
//       onClick={onClick}
//       disabled={isPending}
//       variant={variant === 'outline' ? 'outline' : 'default'}
//       className={variant === 'primary' ? primaryCls : undefined}
//     >
//       {isPending ? (
//         <>
//           <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
//           {pendingLabel}
//         </>
//       ) : (
//         idleLabel
//       )}
//     </Button>
//   );
// }

// interface FeedbackBannerProps {
//   feedback: Feedback | null;
// }

// function FeedbackBanner({ feedback }: FeedbackBannerProps) {
//   if (!feedback) return null;

//   const isSuccess = feedback.type === 'success';

//   return (
//     <div
//       role="status"
//       aria-live="polite"
//       className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-1 ${
//         isSuccess
//           ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
//           : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800'
//       }`}
//     >
//       {isSuccess ? (
//         <CheckCircle className="h-5 w-5 shrink-0" aria-hidden />
//       ) : (
//         <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
//       )}
//       {feedback.message}
//     </div>
//   );
// }

// // ─── Custom hooks ─────────────────────────────────────────────────────────────

// /**
//  * Manages a single feedback message that auto-clears after a delay.
//  * Returns the current feedback and a setter that schedules clearing it.
//  */
// function useFeedback() {
//   const [feedback, setFeedbackState] = useState<Feedback | null>(null);
//   const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const setFeedback = useCallback((next: Feedback | null) => {
//     if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
//     setFeedbackState(next);
//     if (next) {
//       clearTimerRef.current = setTimeout(
//         () => setFeedbackState(null),
//         FEEDBACK_CLEAR_DELAY_MS,
//       );
//     }
//   }, []);

//   // Clean up on unmount
//   useEffect(() => {
//     return () => {
//       if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
//     };
//   }, []);

//   return { feedback, setFeedback };
// }

// /**
//  * Runs a countdown from `total` seconds to 0 when `active` is true,
//  * calling `onComplete` when it reaches 0.
//  */
// function useCountdown(active: boolean, total: number, onComplete: () => void) {
//   const [count, setCount] = useState(total);
//   const onCompleteRef = useRef(onComplete);

//   useEffect(() => {
//     onCompleteRef.current = onComplete;
//   });

//   useEffect(() => {
//     if (!active) return; // ← just bail; cleanup handles the reset

//     const interval = setInterval(() => {
//       setCount((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           onCompleteRef.current();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//       setCount(total); // ← runs after render, never during it
//     };
//   }, [active, total]);

//   return count;
// }

// // ─── 1. PARENT — data fetcher ─────────────────────────────────────────────────

// export function SettingsPage() {
//   const {
//     data: backendProfile,
//     isLoading,
//     error,
//   } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: PROFILE_STALE_TIME_MS,
//   });

//   if (isLoading) return <SettingsSkeleton />;

//   if (error || !backendProfile) {
//     return (
//       <div
//         role="alert"
//         className="flex items-center justify-center gap-2 py-20 text-destructive text-sm"
//       >
//         <AlertCircle className="h-5 w-5" aria-hidden />
//         Failed to load profile. Please refresh the page.
//       </div>
//     );
//   }

//   return <SettingsForm backendProfile={backendProfile} />;
// }

// // ─── 2. CHILD — full form ─────────────────────────────────────────────────────

// interface SettingsFormProps {
//   backendProfile: UserProfile;
// }

// function SettingsForm({ backendProfile }: SettingsFormProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();

//   const { feedback, setFeedback } = useFeedback();

//   // ── Password fields ──────────────────────────────────────────────────────────
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');

//   // ── Modal ────────────────────────────────────────────────────────────────────
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ── Form state — initialised from backend profile ────────────────────────────
//   const [profileSettings, setProfileSettings] = useState<ProfileFormState>(
//     () => ({
//       fullName: backendProfile.full_name ?? '',
//       email: backendProfile.email ?? '',
//       phoneNumber: backendProfile.momo_number ?? '',
//       digitalAddress: backendProfile.ghana_post_address ?? '',
//       userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
//     }),
//   );

//   const [payoutSettings, setPayoutSettings] = useState<PayoutFormState>(() => ({
//     provider: (backendProfile.momo_provider as MomoProvider) ?? 'mtn',
//     accountNumber: backendProfile.momo_number ?? '',
//     accountName: backendProfile.momo_name ?? '',
//   }));

//   // ── Local-persisted settings — hydrated from localStorage on first render ────
//   const [notificationSettings, setNotificationSettings] =
//     useState<NotificationSettings>(() =>
//       readLocalStorage(LS_KEY_NOTIFICATIONS, defaultNotifications()),
//     );

//   const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
//     () => readLocalStorage(LS_KEY_SECURITY, defaultSecurity()),
//   );

//   const [appearanceSettings, setAppearanceSettings] =
//     useState<AppearanceSettings>(() =>
//       readLocalStorage(LS_KEY_APPEARANCE, defaultAppearance()),
//     );

//   // ── Countdown / auto-redirect after password change ──────────────────────────
//   const handleCountdownComplete = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//     setIsModalOpen(false);
//   }, [router]);

//   const countdown = useCountdown(
//     isModalOpen,
//     PASSWORD_CHANGE_COUNTDOWN_SEC,
//     handleCountdownComplete,
//   );

//   // ─── Mutations ───────────────────────────────────────────────────────────────

//   const profileMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Profile updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Profile update failed.'),
//       });
//     },
//   });

//   const payoutMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setFeedback({
//         type: 'success',
//         message: 'Payout account updated successfully!',
//       });
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Payout update failed.'),
//       });
//     },
//   });

//   const passwordMutation = useMutation({
//     mutationFn: (payload: { current_password: string; new_password: string }) =>
//       authService.changePassword(payload),
//     onSuccess: () => {
//       setIsModalOpen(true);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//     },
//     onError: (err: unknown) => {
//       setFeedback({
//         type: 'error',
//         message: extractApiError(err, 'Password update failed.'),
//       });
//     },
//   });

//   // ─── Handlers ────────────────────────────────────────────────────────────────

//   const handleSaveProfile = useCallback(() => {
//     profileMutation.mutate({
//       full_name: profileSettings.fullName,
//       email: profileSettings.email,
//       momo_number: profileSettings.phoneNumber,
//       ghana_post_address: profileSettings.digitalAddress,
//       user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
//     });
//   }, [profileMutation, profileSettings]);

//   const handleSavePayout = useCallback(() => {
//     payoutMutation.mutate({
//       momo_provider: payoutSettings.provider,
//       momo_number: payoutSettings.accountNumber,
//       momo_name: payoutSettings.accountName,
//     });
//   }, [payoutMutation, payoutSettings]);

//   const handleSaveNotifications = useCallback(() => {
//     localStorage.setItem(
//       LS_KEY_NOTIFICATIONS,
//       JSON.stringify(notificationSettings),
//     );
//     setFeedback({
//       type: 'success',
//       message: 'Notification preferences saved!',
//     });
//   }, [notificationSettings, setFeedback]);

//   const handleSaveSecurity = useCallback(() => {
//     localStorage.setItem(LS_KEY_SECURITY, JSON.stringify(securitySettings));
//     setFeedback({ type: 'success', message: 'Security settings saved!' });
//   }, [securitySettings, setFeedback]);

//   const handleSaveAppearance = useCallback(() => {
//     localStorage.setItem(LS_KEY_APPEARANCE, JSON.stringify(appearanceSettings));
//     setFeedback({ type: 'success', message: 'Appearance settings saved!' });
//   }, [appearanceSettings, setFeedback]);

//   const handleUpdatePassword = useCallback(() => {
//     const validationError = validatePasswordChange(
//       currentPassword,
//       newPassword,
//       confirmNewPassword,
//     );
//     if (validationError) {
//       setFeedback({ type: 'error', message: validationError });
//       return;
//     }
//     passwordMutation.mutate({
//       current_password: currentPassword,
//       new_password: newPassword,
//     });
//   }, [
//     currentPassword,
//     newPassword,
//     confirmNewPassword,
//     passwordMutation,
//     setFeedback,
//   ]);

//   const handleSkipAndLogin = useCallback(() => {
//     signOut({ redirect: false }).then(() => router.push('/login'));
//   }, [router]);

//   // SVG countdown: circumference = 2π × r = 2π × 45 ≈ 282.74
//   const CIRCUMFERENCE = 282.74;
//   const strokeDashoffset =
//     CIRCUMFERENCE * (1 - countdown / PASSWORD_CHANGE_COUNTDOWN_SEC);

//   // ─── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <div className="space-y-6 max-w-4xl mb-20 md:mb-0">
//         {/* Page heading */}
//         <div>
//           <h1 className="text-3xl font-bold mb-1 text-foreground">Settings</h1>
//           <p className="text-muted-foreground">
//             Manage your account settings and preferences
//           </p>
//         </div>

//         <FeedbackBanner feedback={feedback} />

//         {/* ── Profile ─────────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <User className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">
//                 Profile Information
//               </CardTitle>
//             </div>
//             <CardDescription>Update your personal information</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="fullName">Full Name</Label>
//                 <Input
//                   id="fullName"
//                   value={profileSettings.fullName}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       fullName: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="userType">User Type</Label>
//                 <Select
//                   value={profileSettings.userType}
//                   onValueChange={(v) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       userType: v as UserType,
//                     }))
//                   }
//                 >
//                   <SelectTrigger id="userType">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {USER_TYPES.map(({ value, label }) => (
//                       <SelectItem key={value} value={value}>
//                         {label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address</Label>
//               <div className="relative">
//                 <Mail
//                   className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
//                   aria-hidden
//                 />
//                 <Input
//                   id="email"
//                   type="email"
//                   className="pl-10"
//                   value={profileSettings.email}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       email: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <div className="relative">
//                 <Phone
//                   className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
//                   aria-hidden
//                 />
//                 <Input
//                   id="phone"
//                   type="tel"
//                   className="pl-10"
//                   value={profileSettings.phoneNumber}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       phoneNumber: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="digitalAddress">Ghana Post GPS Address</Label>
//               <div className="relative">
//                 <MapPin
//                   className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
//                   aria-hidden
//                 />
//                 <Input
//                   id="digitalAddress"
//                   className="pl-10"
//                   value={profileSettings.digitalAddress}
//                   onChange={(e) =>
//                     setProfileSettings((s) => ({
//                       ...s,
//                       digitalAddress: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </div>

//             <SaveButton
//               onClick={handleSaveProfile}
//               isPending={profileMutation.isPending}
//               idleLabel="Save Profile"
//               pendingLabel="Saving Profile…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Payout ──────────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <CreditCard className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">
//                 Payout Account
//               </CardTitle>
//             </div>
//             <CardDescription>Manage your default payout method</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="payoutProvider">Provider</Label>
//               <Select
//                 value={payoutSettings.provider}
//                 onValueChange={(v) =>
//                   setPayoutSettings((s) => ({
//                     ...s,
//                     provider: v as MomoProvider,
//                   }))
//                 }
//               >
//                 <SelectTrigger id="payoutProvider">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {MOMO_PROVIDERS.map(({ value, label }) => (
//                     <SelectItem key={value} value={value}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="accountNumber">Account Number</Label>
//               <Input
//                 id="accountNumber"
//                 type="tel"
//                 value={payoutSettings.accountNumber}
//                 onChange={(e) =>
//                   setPayoutSettings((s) => ({
//                     ...s,
//                     accountNumber: e.target.value,
//                   }))
//                 }
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="accountName">Account Name</Label>
//               <Input
//                 id="accountName"
//                 value={payoutSettings.accountName}
//                 onChange={(e) =>
//                   setPayoutSettings((s) => ({
//                     ...s,
//                     accountName: e.target.value,
//                   }))
//                 }
//               />
//             </div>

//             <SaveButton
//               onClick={handleSavePayout}
//               isPending={payoutMutation.isPending}
//               idleLabel="Update Payout Account"
//               pendingLabel="Saving Payout…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Notifications ───────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Bell className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">
//                 Notifications
//               </CardTitle>
//             </div>
//             <CardDescription>
//               Configure how you receive notifications
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <SwitchRow
//               label="Email Notifications"
//               description="Receive updates via email"
//               checked={notificationSettings.emailNotifications}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   emailNotifications: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="SMS Notifications"
//               description="Receive updates via SMS"
//               checked={notificationSettings.smsNotifications}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   smsNotifications: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="Push Notifications"
//               description="Receive push notifications"
//               checked={notificationSettings.pushNotifications}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   pushNotifications: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="Contribution Reminders"
//               description="Remind me before due dates"
//               checked={notificationSettings.contributionReminders}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({
//                   ...s,
//                   contributionReminders: v,
//                 }))
//               }
//             />
//             <SwitchRow
//               label="Group Updates"
//               description="Notify about group activities"
//               checked={notificationSettings.groupUpdates}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({ ...s, groupUpdates: v }))
//               }
//             />
//             <SwitchRow
//               label="Promotions & Tips"
//               description="Receive savings tips and offers"
//               checked={notificationSettings.promotions}
//               onCheckedChange={(v) =>
//                 setNotificationSettings((s) => ({ ...s, promotions: v }))
//               }
//               withSeparator={false}
//             />

//             <SaveButton
//               onClick={handleSaveNotifications}
//               isPending={false}
//               idleLabel="Save Notification Preferences"
//               pendingLabel="Saving…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Security ────────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Shield className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">Security</CardTitle>
//             </div>
//             <CardDescription>Manage your account security</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <SwitchRow
//               label="Two-Factor Authentication"
//               description="Add an extra layer of security"
//               checked={securitySettings.twoFactorAuth}
//               onCheckedChange={(v) =>
//                 setSecuritySettings((s) => ({ ...s, twoFactorAuth: v }))
//               }
//             />
//             <SwitchRow
//               label="Biometric Login"
//               description="Use fingerprint or face ID"
//               checked={securitySettings.biometricLogin}
//               onCheckedChange={(v) =>
//                 setSecuritySettings((s) => ({ ...s, biometricLogin: v }))
//               }
//             />
//             <SwitchRow
//               label="Login Alerts"
//               description="Get notified of new logins"
//               checked={securitySettings.loginAlerts}
//               onCheckedChange={(v) =>
//                 setSecuritySettings((s) => ({ ...s, loginAlerts: v }))
//               }
//             />

//             {/* Change password */}
//             <div className="space-y-2">
//               <Label>Change Password</Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="password"
//                   placeholder="Current password"
//                   autoComplete="current-password"
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                 />
//                 <Input
//                   type="password"
//                   placeholder="New password"
//                   autoComplete="new-password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                 />
//               </div>
//               <Input
//                 type="password"
//                 placeholder="Confirm new password"
//                 autoComplete="new-password"
//                 value={confirmNewPassword}
//                 onChange={(e) => setConfirmNewPassword(e.target.value)}
//               />
//               <SaveButton
//                 onClick={handleUpdatePassword}
//                 isPending={passwordMutation.isPending}
//                 idleLabel="Update Password"
//                 pendingLabel="Updating Password…"
//                 variant="outline"
//               />
//             </div>

//             <SaveButton
//               onClick={handleSaveSecurity}
//               isPending={false}
//               idleLabel="Save Security Settings"
//               pendingLabel="Saving…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Appearance ──────────────────────────────────────────────────────── */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Moon className="h-5 w-5 text-cyan-600" aria-hidden />
//               <CardTitle className="text-base md:text-xl">Appearance</CardTitle>
//             </div>
//             <CardDescription>Customize your app experience</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="theme">Theme</Label>
//               <Select
//                 value={theme}
//                 onValueChange={(v) => setTheme(v as ThemeValue)}
//               >
//                 <SelectTrigger id="theme">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {THEME_OPTIONS.map(({ value, label }) => (
//                     <SelectItem key={value} value={value}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="language">Language</Label>
//               <Select
//                 value={appearanceSettings.language}
//                 onValueChange={(v) =>
//                   setAppearanceSettings((s) => ({ ...s, language: v }))
//                 }
//               >
//                 <SelectTrigger id="language">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {LANGUAGE_OPTIONS.map(({ value, label }) => (
//                     <SelectItem key={value} value={value}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <SaveButton
//               onClick={handleSaveAppearance}
//               isPending={false}
//               idleLabel="Save Appearance"
//               pendingLabel="Saving…"
//             />
//           </CardContent>
//         </Card>

//         {/* ── Danger Zone ─────────────────────────────────────────────────────── */}
//         <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30">
//           <CardHeader>
//             <CardTitle className="text-red-600">Danger Zone</CardTitle>
//             <CardDescription>Irreversible actions</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-semibold">Delete Account</p>
//                 <p className="text-sm text-muted-foreground">
//                   Permanently delete your account and all data
//                 </p>
//               </div>
//               <Button variant="destructive">Delete Account</Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Password-change success modal ─────────────────────────────────────── */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 overflow-hidden">
//           <div className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
//             {/* Animated success icon */}
//             <div className="relative flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
//               <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 dark:bg-emerald-900/30 opacity-75" />
//               <CheckCircle
//                 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 relative z-10"
//                 aria-hidden
//               />
//             </div>

//             <DialogHeader className="flex flex-col items-center text-center space-y-2 mb-8">
//               <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
//                 Password Updated!
//               </DialogTitle>
//               <DialogDescription className="text-base text-muted-foreground max-w-xs">
//                 Your security details have been saved. We are securely routing
//                 you to the login screen.
//               </DialogDescription>
//             </DialogHeader>

//             {/* Circular countdown */}
//             <div className="relative flex items-center justify-center mb-8">
//               <svg
//                 className="w-20 h-20 -rotate-90"
//                 viewBox="0 0 100 100"
//                 aria-label={`Redirecting in ${countdown} seconds`}
//                 role="timer"
//               >
//                 <circle
//                   cx="50"
//                   cy="50"
//                   r="45"
//                   className="fill-none stroke-muted"
//                   strokeWidth="6"
//                 />
//                 <circle
//                   cx="50"
//                   cy="50"
//                   r="45"
//                   className="fill-none stroke-emerald-500 transition-all duration-1000 ease-linear"
//                   strokeWidth="6"
//                   strokeDasharray={CIRCUMFERENCE}
//                   strokeDashoffset={strokeDashoffset}
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <span
//                 className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground tabular-nums"
//                 aria-hidden
//               >
//                 {countdown}
//               </span>
//             </div>

//             <Button
//               onClick={handleSkipAndLogin}
//               variant="outline"
//               className="w-full h-12 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
//             >
//               Skip &amp; Login Now
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import {
//   User,
//   Bell,
//   CreditCard,
//   Shield,
//   Moon,
//   Mail,
//   Phone,
//   MapPin,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Switch } from '../ui/switch';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';
// import { Separator } from '../ui/separator';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../ui/dialog';
// import { authService } from '@/src/services/auth.service';
// import { UserProfile, ProfileUpdatePayload } from '@/src/lib/schemas';
// import { useTheme } from '@/src/context/ThemeContext';

// // 1. PARENT - Data Fetcher
// export function SettingsPage() {
//   const {
//     data: backendProfile,
//     isLoading,
//     error,
//   } = useQuery<UserProfile>({
//     queryKey: ['userProfile'],
//     queryFn: authService.getProfile,
//     staleTime: 5 * 60 * 1000,
//   });

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
//         <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
//         <p className="text-sm md:text-lg animate-pulse">Loading settings...</p>
//       </div>
//     );
//   }

//   if (error || !backendProfile) {
//     return (
//       <div className="text-center py-12 text-destructive">
//         Failed to load profile.
//       </div>
//     );
//   }

//   return <SettingsForm backendProfile={backendProfile} />;
// }

// // 2. CHILD - Full Form with all sections
// function SettingsForm({ backendProfile }: { backendProfile: UserProfile }) {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();

//   const [successMsg, setSuccessMsg] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');

//   // === PASSWORD CHANGE STATES ===
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');

//   // === MODAL + COUNTDOWN ===
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [countdown, setCountdown] = useState(5);

//   // === LIVE BACKEND STATES ===
//   const [profileSettings, setProfileSettings] = useState({
//     fullName: backendProfile.full_name || '',
//     email: backendProfile.email || '',
//     phoneNumber: backendProfile.momo_number || '',
//     digitalAddress: backendProfile.ghana_post_address || '',
//     userType: backendProfile.user_type === 'student' ? 'Student' : 'Worker',
//   });

//   const [payoutSettings, setPayoutSettings] = useState({
//     provider: backendProfile.momo_provider || 'mtn',
//     accountNumber: backendProfile.momo_number || '',
//     accountName: backendProfile.momo_name || '',
//   });

//   // === STATIC STATES ===
//   const [notificationSettings, setNotificationSettings] = useState({
//     emailNotifications: true,
//     smsNotifications: true,
//     pushNotifications: true,
//     contributionReminders: true,
//     groupUpdates: true,
//     promotions: false,
//   });

//   const [securitySettings, setSecuritySettings] = useState({
//     twoFactorAuth: false,
//     biometricLogin: true,
//     loginAlerts: true,
//   });

//   const [appearanceSettings, setAppearanceSettings] = useState({
//     language: 'en',
//   });

//   // === MUTATIONS ===
//   const profileMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setSuccessMsg('Profile updated successfully!');
//       setTimeout(() => setSuccessMsg(''), 3000);
//     },
//     onError: (err: unknown) => {
//       const apiError = err as { response?: { data?: { error?: string } } };
//       setErrorMsg(apiError.response?.data?.error || 'Profile update failed');
//       setTimeout(() => setErrorMsg(''), 4000);
//     },
//   });

//   const payoutMutation = useMutation({
//     mutationFn: (payload: ProfileUpdatePayload) =>
//       authService.updateProfile(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] });
//       setSuccessMsg('Payout account updated successfully!');
//       setTimeout(() => setSuccessMsg(''), 3000);
//     },
//     onError: (err: unknown) => {
//       const apiError = err as { response?: { data?: { error?: string } } };
//       setErrorMsg(apiError.response?.data?.error || 'Payout update failed');
//       setTimeout(() => setErrorMsg(''), 4000);
//     },
//   });

//   const passwordMutation = useMutation({
//     mutationFn: (payload: { current_password: string; new_password: string }) =>
//       authService.changePassword(payload),
//     onSuccess: () => {
//       setIsModalOpen(true);
//       setCountdown(5);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//     },
//     onError: (err: unknown) => {
//       const apiError = err as { response?: { data?: { error?: string } } };
//       setErrorMsg(apiError.response?.data?.error || 'Password update failed');
//       setTimeout(() => setErrorMsg(''), 4000);
//     },
//   });

//   // === COUNTDOWN AUTO-REDIRECT ===
//   useEffect(() => {
//     if (!isModalOpen) return;
//     const interval = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           signOut({ redirect: false }).then(() => router.push('/login'));
//           setIsModalOpen(false);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [isModalOpen, router]);

//   // === HANDLERS ===
//   const handleSaveProfile = () => {
//     profileMutation.mutate({
//       full_name: profileSettings.fullName,
//       email: profileSettings.email,
//       momo_number: profileSettings.phoneNumber,
//       ghana_post_address: profileSettings.digitalAddress,
//       user_type: profileSettings.userType.toLowerCase() as 'student' | 'worker',
//     });
//   };

//   const handleSavePayout = () => {
//     const payload: ProfileUpdatePayload = {
//       momo_provider: payoutSettings.provider as
//         | 'mtn'
//         | 'telecel'
//         | 'airteltigo',
//       momo_number: payoutSettings.accountNumber,
//       momo_name: payoutSettings.accountName,
//     };
//     payoutMutation.mutate(payload);
//   };

//   const handleSaveNotifications = () => {
//     localStorage.setItem(
//       'snappx_notifications',
//       JSON.stringify(notificationSettings),
//     );
//     setSuccessMsg('Notification settings updated!');
//     setTimeout(() => setSuccessMsg(''), 3000);
//   };

//   const handleSaveSecurity = () => {
//     localStorage.setItem('snappx_security', JSON.stringify(securitySettings));
//     setSuccessMsg('Security settings updated!');
//     setTimeout(() => setSuccessMsg(''), 3000);
//   };

//   const handleUpdatePassword = () => {
//     if (!currentPassword || !newPassword || !confirmNewPassword) {
//       setErrorMsg('All password fields are required');
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       setErrorMsg('New passwords do not match');
//       return;
//     }
//     if (newPassword.length < 8) {
//       setErrorMsg('New password must be at least 8 characters');
//       return;
//     }

//     passwordMutation.mutate({
//       current_password: currentPassword,
//       new_password: newPassword,
//     });
//   };

//   return (
//     <>
//       <div className="space-y-6 max-w-4xl mb-20 md:mb-0">
//         <div>
//           <h1 className="text-3xl font-bold mb-1 text-foreground">Settings</h1>
//           <p className="text-muted-foreground">
//             Manage your account settings and preferences
//           </p>
//         </div>

//         {/* Feedback Banner */}
//         {(successMsg || errorMsg) && (
//           <div
//             className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-1 ${
//               successMsg
//                 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
//                 : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:border-red-800'
//             }`}
//           >
//             {successMsg ? (
//               <CheckCircle className="h-5 w-5" />
//             ) : (
//               <AlertCircle className="h-5 w-5" />
//             )}
//             {successMsg || errorMsg}
//           </div>
//         )}

//         {/* PROFILE SETTINGS */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <User className="h-5 w-5 text-cyan-600" />
//               <CardTitle className="text-[16px] md:text-[20px]">
//                 Profile Information
//               </CardTitle>
//             </div>
//             <CardDescription>Update your personal information</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="fullName">Full Name</Label>
//                 <Input
//                   id="fullName"
//                   value={profileSettings.fullName}
//                   onChange={(e) =>
//                     setProfileSettings({
//                       ...profileSettings,
//                       fullName: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="userType">User Type</Label>
//                 <Select
//                   value={profileSettings.userType}
//                   onValueChange={(v) =>
//                     setProfileSettings({ ...profileSettings, userType: v })
//                   }
//                 >
//                   <SelectTrigger id="userType">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Student">Student</SelectItem>
//                     <SelectItem value="Worker">Worker</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   className="pl-10"
//                   value={profileSettings.email}
//                   onChange={(e) =>
//                     setProfileSettings({
//                       ...profileSettings,
//                       email: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="phone"
//                   className="pl-10"
//                   value={profileSettings.phoneNumber}
//                   onChange={(e) =>
//                     setProfileSettings({
//                       ...profileSettings,
//                       phoneNumber: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="digitalAddress">Ghana Post GPS Address</Label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="digitalAddress"
//                   className="pl-10"
//                   value={profileSettings.digitalAddress}
//                   onChange={(e) =>
//                     setProfileSettings({
//                       ...profileSettings,
//                       digitalAddress: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>
//             <Button
//               onClick={handleSaveProfile}
//               disabled={profileMutation.isPending}
//               className="bg-cyan-500 hover:bg-cyan-600 text-white"
//             >
//               {profileMutation.isPending ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                   Saving Profile...
//                 </>
//               ) : (
//                 'Save Profile'
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         {/* PAYOUT SETTINGS */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <CreditCard className="h-5 w-5 text-cyan-600" />
//               <CardTitle className="text-[16px] md:text-[20px]">
//                 Payout Account
//               </CardTitle>
//             </div>
//             <CardDescription>Manage your default payout method</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="payoutProvider">Provider</Label>
//               <Select
//                 value={payoutSettings.provider}
//                 onValueChange={(v) =>
//                   setPayoutSettings({
//                     ...payoutSettings,
//                     provider: v as 'mtn' | 'telecel' | 'airteltigo',
//                   })
//                 }
//               >
//                 <SelectTrigger id="payoutProvider">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="mtn">MTN MoMo</SelectItem>
//                   <SelectItem value="telecel">Telecel Cash</SelectItem>
//                   <SelectItem value="airteltigo">AirtelTigo Cash</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="accountNumber">Account Number</Label>
//               <Input
//                 id="accountNumber"
//                 value={payoutSettings.accountNumber}
//                 onChange={(e) =>
//                   setPayoutSettings({
//                     ...payoutSettings,
//                     accountNumber: e.target.value,
//                   })
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="accountName">Account Name</Label>
//               <Input
//                 id="accountName"
//                 value={payoutSettings.accountName}
//                 onChange={(e) =>
//                   setPayoutSettings({
//                     ...payoutSettings,
//                     accountName: e.target.value,
//                   })
//                 }
//               />
//             </div>
//             <Button
//               onClick={handleSavePayout}
//               disabled={payoutMutation.isPending}
//               className="bg-cyan-500 hover:bg-cyan-600 text-white"
//             >
//               {payoutMutation.isPending ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                   Saving Payout...
//                 </>
//               ) : (
//                 'Update Payout Account'
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         {/* NOTIFICATION SETTINGS */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Bell className="h-5 w-5 text-cyan-600" />
//               <CardTitle className="text-[16px] md:text-[20px]">
//                 Notifications
//               </CardTitle>
//             </div>
//             <CardDescription>
//               Configure how you receive notifications
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Email Notifications</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Receive updates via email
//                 </p>
//               </div>
//               <Switch
//                 checked={notificationSettings.emailNotifications}
//                 onCheckedChange={(v) =>
//                   setNotificationSettings({
//                     ...notificationSettings,
//                     emailNotifications: v,
//                   })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>SMS Notifications</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Receive updates via SMS
//                 </p>
//               </div>
//               <Switch
//                 checked={notificationSettings.smsNotifications}
//                 onCheckedChange={(v) =>
//                   setNotificationSettings({
//                     ...notificationSettings,
//                     smsNotifications: v,
//                   })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Push Notifications</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Receive push notifications
//                 </p>
//               </div>
//               <Switch
//                 checked={notificationSettings.pushNotifications}
//                 onCheckedChange={(v) =>
//                   setNotificationSettings({
//                     ...notificationSettings,
//                     pushNotifications: v,
//                   })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Contribution Reminders</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Remind me before due dates
//                 </p>
//               </div>
//               <Switch
//                 checked={notificationSettings.contributionReminders}
//                 onCheckedChange={(v) =>
//                   setNotificationSettings({
//                     ...notificationSettings,
//                     contributionReminders: v,
//                   })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Group Updates</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Notify about group activities
//                 </p>
//               </div>
//               <Switch
//                 checked={notificationSettings.groupUpdates}
//                 onCheckedChange={(v) =>
//                   setNotificationSettings({
//                     ...notificationSettings,
//                     groupUpdates: v,
//                   })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Promotions & Tips</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Receive savings tips and offers
//                 </p>
//               </div>
//               <Switch
//                 checked={notificationSettings.promotions}
//                 onCheckedChange={(v) =>
//                   setNotificationSettings({
//                     ...notificationSettings,
//                     promotions: v,
//                   })
//                 }
//               />
//             </div>
//             <Button
//               onClick={handleSaveNotifications}
//               className="bg-cyan-500 hover:bg-cyan-600 text-white"
//             >
//               Save Notification Preferences
//             </Button>
//           </CardContent>
//         </Card>

//         {/* SECURITY SETTINGS  */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Shield className="h-5 w-5 text-cyan-600" />
//               <CardTitle className="text-[16px] md:text-[20px]">
//                 Security
//               </CardTitle>
//             </div>
//             <CardDescription>Manage your account security</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Two-Factor Authentication</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Add an extra layer of security
//                 </p>
//               </div>
//               <Switch
//                 checked={securitySettings.twoFactorAuth}
//                 onCheckedChange={(v) =>
//                   setSecuritySettings({ ...securitySettings, twoFactorAuth: v })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Biometric Login</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Use fingerprint or face ID
//                 </p>
//               </div>
//               <Switch
//                 checked={securitySettings.biometricLogin}
//                 onCheckedChange={(v) =>
//                   setSecuritySettings({
//                     ...securitySettings,
//                     biometricLogin: v,
//                   })
//                 }
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <Label>Login Alerts</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Get notified of new logins
//                 </p>
//               </div>
//               <Switch
//                 checked={securitySettings.loginAlerts}
//                 onCheckedChange={(v) =>
//                   setSecuritySettings({ ...securitySettings, loginAlerts: v })
//                 }
//               />
//             </div>
//             <Separator />

//             {/* CHANGE PASSWORD SECTION */}
//             <div className="space-y-2">
//               <Label>Change Password</Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="password"
//                   placeholder="Current password"
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                 />
//                 <Input
//                   type="password"
//                   placeholder="New password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                 />
//               </div>
//               <Input
//                 type="password"
//                 placeholder="Confirm new password"
//                 value={confirmNewPassword}
//                 onChange={(e) => setConfirmNewPassword(e.target.value)}
//               />
//               <Button
//                 onClick={handleUpdatePassword}
//                 disabled={passwordMutation.isPending}
//                 variant="outline"
//               >
//                 {passwordMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Updating Password...
//                   </>
//                 ) : (
//                   'Update Password'
//                 )}
//               </Button>
//             </div>

//             <Button
//               onClick={handleSaveSecurity}
//               className="bg-cyan-500 hover:bg-cyan-600 text-white"
//             >
//               Save Security Settings
//             </Button>
//           </CardContent>
//         </Card>

//         {/* APPEARANCE SETTINGS */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Moon className="h-5 w-5 text-cyan-600" />
//               <CardTitle className="text-[16px] md:text-[20px]">
//                 Appearance
//               </CardTitle>
//             </div>
//             <CardDescription>Customize your app experience</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="theme">Theme</Label>
//               <Select
//                 value={theme}
//                 onValueChange={(v) =>
//                   setTheme(v as 'light' | 'dark' | 'system')
//                 }
//               >
//                 <SelectTrigger id="theme">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="light">Light</SelectItem>
//                   <SelectItem value="dark">Dark</SelectItem>
//                   <SelectItem value="system">System</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="language">Language</Label>
//               <Select
//                 value={appearanceSettings.language}
//                 onValueChange={(v) =>
//                   setAppearanceSettings({ ...appearanceSettings, language: v })
//                 }
//               >
//                 <SelectTrigger id="language">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="en">English</SelectItem>
//                   <SelectItem value="tw">Twi</SelectItem>
//                   <SelectItem value="ga">Ga</SelectItem>
//                   <SelectItem value="ee">Ewe</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* DANGER ZONE */}
//         <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30">
//           <CardHeader>
//             <CardTitle className="text-red-600">Danger Zone</CardTitle>
//             <CardDescription>Irreversible actions</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-semibold">Delete Account</p>
//                 <p className="text-sm text-muted-foreground">
//                   Permanently delete your account and all data
//                 </p>
//               </div>
//               <Button variant="destructive">Delete Account</Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* SUCCESS MODAL WITH 5-SECOND CIRCULAR COUNTDOWN */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 overflow-hidden">
//           <div className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
//             {/* Animated Success Icon */}
//             <div className="relative flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
//               <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 dark:bg-emerald-900/30 opacity-75 duration-1000" />
//               <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 relative z-10" />
//             </div>

//             {/* Clean Header & Description */}
//             <DialogHeader className="flex flex-col items-center text-center space-y-2 mb-8">
//               <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
//                 Password Updated!
//               </DialogTitle>
//               <DialogDescription className="text-base text-muted-foreground max-w-65">
//                 Your security details have been saved. We are securely routing
//                 you to the login screen.
//               </DialogDescription>
//             </DialogHeader>

//             <div className="relative flex items-center justify-center mb-8">
//               <svg
//                 className="w-20 h-20 -rotate-90 transform drop-shadow-sm"
//                 viewBox="0 0 100 100"
//               >
//                 {/* Background track */}
//                 <circle
//                   cx="50"
//                   cy="50"
//                   r="45"
//                   className="fill-none stroke-muted"
//                   strokeWidth="6"
//                 />
//                 {/* Smooth animated progress track */}
//                 <circle
//                   cx="50"
//                   cy="50"
//                   r="45"
//                   className="fill-none stroke-emerald-500 transition-all duration-1000 ease-linear"
//                   strokeWidth="6"
//                   strokeDasharray="282.74"
//                   strokeDashoffset={282.74 * (1 - countdown / 5)}
//                   strokeLinecap="round"
//                 />
//               </svg>
//               {/* Pulsing countdown number */}
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <span className="text-2xl font-bold text-foreground tabular-nums">
//                   {countdown}
//                 </span>
//               </div>
//             </div>

//             {/* Action Button */}
//             <Button
//               onClick={() => {
//                 signOut({ redirect: false }).then(() => router.push('/login'));
//               }}
//               variant="outline"
//               className="w-full h-12 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
//             >
//               Skip & Login Now
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
