// src/components/DashboardHeader.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import Image from 'next/image';
import logoImage from '../assets/logo.png';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/src/lib/axios';
import { cn } from './ui/utils';
import { NotificationPanel } from './notification/NotificationPanel';
import { useNotifications } from '@/src/hooks/useNotifications';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface UserProfile {
  fullName: string;
  email: string;
  profilePicture: string | null;
  isVerified?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardHeader({
  currentPage,
  onNavigate,
  onLogout,
}: DashboardHeaderProps) {
  // const { data: session } = useSession();
  const { data: session, status } = useSession();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: session?.user?.email || '',
    profilePicture: null,
    isVerified: false,
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    error,
    markAsRead,
    markAllAsRead,
    deleteOne,
    clearAll,
    loadMore,
    refresh: refreshNotifications,
  } = useNotifications(status === 'authenticated');

  // ── Fetch user profile ────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.accessToken) return;
    apiClient
      .get('/auth/me/')
      .then(({ data }) => {
        setUserProfile({
          fullName: data.profile?.full_name || '',
          email: data.user?.email || session.user?.email || '',
          profilePicture: data.profile?.profile_picture || null,
          isVerified: data.user?.is_verified ?? false,
        });
      })
      .catch(() => {
        setUserProfile((prev) => ({
          ...prev,
          email: session.user?.email || '',
        }));
      });
  }, [session]);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        showProfile &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfile]);

  // ── Derived display values ─────────────────────────────────────────────
  const displayInitial = userProfile.fullName
    ? userProfile.fullName.charAt(0).toUpperCase()
    : userProfile.email
      ? userProfile.email.charAt(0).toUpperCase()
      : 'U';

  const displayName = userProfile.fullName || userProfile.email || 'User';

  const handleNotifToggle = () => {
    setShowNotifications((prev) => !prev);
    setShowProfile(false);
  };

  const handleProfileToggle = () => {
    setShowProfile((prev) => !prev);
    setShowNotifications(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* ── Left: Navigation ─────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {currentPage !== 'Dashboard' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.history.back()}
                  className="mr-1 hover:bg-muted"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('Dashboard')}
                className={cn(
                  'transition-all duration-200',
                  currentPage === 'Dashboard'
                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                    : 'hover:bg-muted',
                )}
                aria-label="Go to Dashboard"
              >
                <Home className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* ── Center: Logo & Brand ──────────────────────────────────── */}
            <button
              onClick={() => onNavigate('Dashboard')}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Image
                src={logoImage}
                alt="SnappX"
                className="h-9 w-9 rounded-[10px] shadow-sm"
              />
              <div className="hidden sm:block text-left">
                <div className="text-[15px] font-bold text-foreground leading-tight">
                  SnappX
                </div>
                <div className="text-[10px] text-muted-foreground/70 font-medium">
                  Empowering Collective Growth
                </div>
              </div>
            </button>

            {/* ── Right: Actions ────────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              <div className="relative">
                <motion.button
                  ref={notifButtonRef}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleNotifToggle}
                  className={cn(
                    'relative flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
                    showNotifications
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                  )}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  aria-expanded={showNotifications}
                  aria-haspopup="dialog"
                >
                  <Bell className="h-4.5 w-4.5" />

                  {/* Badge */}
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        key="notif-badge"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 600,
                          damping: 22,
                        }}
                        className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm ring-2 ring-background"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Profile Dropdown */}
              <div ref={profileDropdownRef} className="relative">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleProfileToggle}
                  className={cn(
                    'flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
                    showProfile ? 'ring-2 ring-primary/40' : '',
                  )}
                  aria-label="Profile menu"
                  aria-expanded={showProfile}
                  aria-haspopup="true"
                >
                  {userProfile.profilePicture ? (
                    <Image
                      src={userProfile.profilePicture}
                      alt={`${displayName}'s profile`}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                      {displayInitial}
                    </div>
                  )}
                </motion.button>

                {/* Profile dropdown */}
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 28,
                      }}
                      className={cn(
                        'absolute right-0 mt-2 w-68 z-50',
                        'rounded-2xl overflow-hidden',
                        'border border-border/50',
                        'bg-card/95 backdrop-blur-2xl ',
                        'shadow-2xl shadow-black/25 dark:shadow-black/60',
                        'ring-1 ring-inset ring-white/10 dark:ring-white/5',
                      )}
                    >
                      {/* Profile header */}
                      <div className="p-4 bg-linear-to-br from-primary/8 via-transparent to-transparent border-b border-border/40">
                        <div className="flex items-center gap-3">
                          {userProfile.profilePicture ? (
                            <Image
                              src={userProfile.profilePicture}
                              alt="Profile"
                              width={44}
                              height={44}
                              className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/20"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
                              {displayInitial}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-foreground truncate text-sm leading-tight">
                                {userProfile.fullName || 'User'}
                              </p>
                              {userProfile.isVerified && (
                                <Shield className="h-3 w-3 text-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {userProfile.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        <ProfileMenuItem
                          icon={User}
                          label="Profile Settings"
                          description="Edit personal info"
                          onClick={() => {
                            onNavigate('Profile');
                            setShowProfile(false);
                          }}
                        />
                        <ProfileMenuItem
                          icon={Settings}
                          label="Account Settings"
                          description="Security & preferences"
                          onClick={() => {
                            onNavigate('Settings');
                            setShowProfile(false);
                          }}
                        />
                      </div>

                      <div className="p-2 border-t border-border/40">
                        <button
                          onClick={() => {
                            setShowProfile(false);
                            onLogout();
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                            'hover:bg-rose-50 dark:hover:bg-rose-900/20',
                            'text-rose-500 transition-colors duration-150',
                            'group',
                          )}
                        >
                          <div className="h-7 w-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors">
                            <LogOut className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Sign Out</p>
                            <p className="text-[11px] text-rose-400/70">
                              End your session
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Notification Panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            totalCount={totalCount}
            hasMore={hasMore}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteOne}
            onClearAll={clearAll}
            onLoadMore={loadMore}
            onRefresh={refreshNotifications}
            onNavigate={onNavigate}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function ProfileMenuItem({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
        'hover:bg-muted transition-colors duration-150',
        'group',
      )}
    >
      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground/70">{description}</p>
        )}
      </div>
    </button>
  );
}

// // src/components/DashboardHeader.tsx

// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { ArrowLeft, Home, Bell, User, Settings, LogOut } from 'lucide-react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { Button } from './ui/button';
// import Image from 'next/image';
// import logoImage from '../assets/logo.png';
// import { useSession } from 'next-auth/react';
// import { apiClient } from '@/src/lib/axios';
// import { cn } from './ui/utils';
// import { NotificationPanel } from './NotificationPanel';
// import { useNotifications } from '@/src/hooks/useNotifications';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface DashboardHeaderProps {
//   currentPage: string;
//   onNavigate: (page: string) => void;
//   onLogout: () => void;
// }

// interface UserProfile {
//   fullName: string;
//   email: string;
//   profilePicture: string | null;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export function DashboardHeader({
//   currentPage,
//   onNavigate,
//   onLogout,
// }: DashboardHeaderProps) {
//   const { data: session } = useSession();

//   const [userProfile, setUserProfile] = useState<UserProfile>({
//     fullName: '',
//     email: session?.user?.email || '',
//     profilePicture: null,
//   });

//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfile, setShowProfile] = useState(false);

//   const profileDropdownRef = useRef<HTMLDivElement>(null);

//   // ── Real notification data ────────────────────────────────────────────────
//   const {
//     notifications,
//     unreadCount,
//     totalCount,
//     hasMore,
//     loading,
//     loadingMore,
//     markAsRead,
//     markAllAsRead,
//     deleteOne,
//     clearAll,
//     loadMore,
//   } = useNotifications();

//   // ── Fetch user profile ────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!session?.user?.accessToken) return;
//     apiClient
//       .get('/auth/me/')
//       .then(({ data }) => {
//         setUserProfile({
//           fullName: data.profile?.full_name || '',
//           email: data.user?.email || session.user?.email || '',
//           profilePicture: data.profile?.profile_picture || null,
//         });
//       })
//       .catch(() => {
//         setUserProfile((prev) => ({
//           ...prev,
//           email: session.user?.email || '',
//         }));
//       });
//   }, [session]);

//   // ── Close profile dropdown on outside click ───────────────────────────────
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (
//         showProfile &&
//         profileDropdownRef.current &&
//         !profileDropdownRef.current.contains(e.target as Node)
//       ) {
//         setShowProfile(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, [showProfile]);

//   const displayInitial = userProfile.fullName
//     ? userProfile.fullName.charAt(0).toUpperCase()
//     : userProfile.email
//       ? userProfile.email.charAt(0).toUpperCase()
//       : 'U';

//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
//         <div className="container mx-auto px-4">
//           <div className="flex h-16 items-center justify-between">
//             {/* ── Left: Navigation ───────────────────────────────────────── */}
//             <div className="flex items-center gap-2">
//               {currentPage !== 'Dashboard' && (
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => window.history.back()}
//                   className="mr-2"
//                 >
//                   <ArrowLeft className="h-5 w-5" />
//                 </Button>
//               )}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => onNavigate('Dashboard')}
//                 className={cn(
//                   currentPage === 'Dashboard' && 'bg-muted text-foreground',
//                 )}
//               >
//                 <Home className="h-5 w-5" />
//               </Button>
//             </div>

//             {/* ── Center: Logo & Brand ────────────────────────────────────── */}
//             <div className="flex items-center gap-2">
//               <Image
//                 src={logoImage}
//                 alt="SnappX Logo"
//                 className="h-10 w-10 rounded-[10px]"
//               />
//               <div className="hidden sm:block">
//                 <div className="text-lg font-semibold text-foreground">
//                   SnappX
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   Empowering Collective Growth
//                 </div>
//               </div>
//             </div>

//             {/* ── Right: Notification Bell + Profile ──────────────────────── */}
//             <div className="flex items-center gap-1.5">
//               {/* Notification Bell */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   setShowNotifications((prev) => !prev);
//                   setShowProfile(false);
//                 }}
//                 className="relative"
//                 aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
//               >
//                 <Bell className="h-5 w-5" />

//                 {/* Badge */}
//                 <AnimatePresence>
//                   {unreadCount > 0 && (
//                     <motion.span
//                       key="badge"
//                       initial={{ scale: 0, opacity: 0 }}
//                       animate={{ scale: 1, opacity: 1 }}
//                       exit={{ scale: 0, opacity: 0 }}
//                       transition={{
//                         type: 'spring',
//                         stiffness: 500,
//                         damping: 25,
//                       }}
//                       className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm"
//                     >
//                       {unreadCount > 99 ? '99+' : unreadCount}
//                     </motion.span>
//                   )}
//                 </AnimatePresence>
//               </Button>

//               {/* Profile Dropdown */}
//               <div ref={profileDropdownRef} className="relative">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setShowProfile((prev) => !prev);
//                     setShowNotifications(false);
//                   }}
//                   className="rounded-full p-1"
//                 >
//                   {userProfile.profilePicture ? (
//                     <Image
//                       src={userProfile.profilePicture}
//                       alt="Profile picture"
//                       width={32}
//                       height={32}
//                       className="h-8 w-8 rounded-full object-cover border-2 border-primary/30"
//                     />
//                   ) : (
//                     <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
//                       {displayInitial}
//                     </div>
//                   )}
//                 </Button>

//                 <AnimatePresence>
//                   {showProfile && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 8, scale: 0.96 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 8, scale: 0.96 }}
//                       transition={{
//                         type: 'spring',
//                         stiffness: 400,
//                         damping: 28,
//                       }}
//                       className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
//                     >
//                       {/* Profile header */}
//                       <div className="p-4 border-b border-border bg-linear-to-br from-primary/5 to-transparent">
//                         <div className="flex items-center gap-3">
//                           {userProfile.profilePicture ? (
//                             <Image
//                               src={userProfile.profilePicture}
//                               alt="Profile"
//                               width={40}
//                               height={40}
//                               className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
//                             />
//                           ) : (
//                             <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
//                               {displayInitial}
//                             </div>
//                           )}
//                           <div className="min-w-0">
//                             <p className="font-semibold text-foreground truncate text-sm">
//                               {userProfile.fullName || 'User'}
//                             </p>
//                             <p className="text-xs text-muted-foreground truncate">
//                               {userProfile.email || 'user@example.com'}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Menu items */}
//                       <div className="p-2">
//                         <ProfileMenuItem
//                           icon={User}
//                           label="Profile Settings"
//                           onClick={() => {
//                             onNavigate('Profile');
//                             setShowProfile(false);
//                           }}
//                         />
//                         <ProfileMenuItem
//                           icon={Settings}
//                           label="Account Settings"
//                           onClick={() => {
//                             onNavigate('Settings');
//                             setShowProfile(false);
//                           }}
//                         />
//                       </div>

//                       <div className="p-2 border-t border-border">
//                         <button
//                           onClick={() => {
//                             setShowProfile(false);
//                             onLogout();
//                           }}
//                           className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left text-rose-500 transition-colors"
//                         >
//                           <LogOut className="h-4 w-4" />
//                           <span className="text-sm font-medium">Sign Out</span>
//                         </button>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* ── Notification Panel (portal-like, rendered outside header) ──────── */}
//       <AnimatePresence>
//         {showNotifications && (
//           <NotificationPanel
//             notifications={notifications}
//             unreadCount={unreadCount}
//             totalCount={totalCount}
//             hasMore={hasMore}
//             loading={loading}
//             loadingMore={loadingMore}
//             onMarkAsRead={markAsRead}
//             onMarkAllAsRead={markAllAsRead}
//             onDelete={deleteOne}
//             onClearAll={clearAll}
//             onLoadMore={loadMore}
//             onNavigate={onNavigate}
//             onClose={() => setShowNotifications(false)}
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// // ─── Sub-component ────────────────────────────────────────────────────────────

// function ProfileMenuItem({
//   icon: Icon,
//   label,
//   onClick,
// }: {
//   icon: React.ElementType;
//   label: string;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors"
//     >
//       <Icon className="h-4 w-4 text-muted-foreground" />
//       <span className="text-sm text-foreground">{label}</span>
//     </button>
//   );
// }

// // src/components/DashboardHeader.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import { ArrowLeft, Home, Bell, User, Settings, LogOut } from 'lucide-react';
// import { Button } from './ui/button';
// import Image from 'next/image';
// import logoImage from '../assets/logo.png';
// import { useSession } from 'next-auth/react';
// import { apiClient } from '@/src/lib/axios';
// import { cn } from './ui/utils';

// interface DashboardHeaderProps {
//   currentPage: string;
//   onNavigate: (page: string) => void;
//   onLogout: () => void;
// }

// interface UserProfile {
//   fullName: string;
//   email: string;
//   profilePicture: string | null;
// }

// export function DashboardHeader({
//   currentPage,
//   onNavigate,
//   onLogout,
// }: DashboardHeaderProps) {
//   const { data: session } = useSession();
//   const [userProfile, setUserProfile] = useState<UserProfile>({
//     fullName: '',
//     email: session?.user?.email || '',
//     profilePicture: null,
//   });

//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfile, setShowProfile] = useState(false);

//   const [notificationSettings, setNotificationSettings] = useState({
//     groupPaymentReminders: true,
//     payoutDateReminders: true,
//     goalProgressUpdates: true,
//   });

//   const notifications = [
//     {
//       id: 1,
//       title: 'Payment Due Tomorrow',
//       message: 'Family Savings Circle - ₵200',
//       time: '2 hours ago',
//       unread: true,
//     },
//     {
//       id: 2,
//       title: 'Payout Scheduled',
//       message: "You'll receive ₵1,500 in 3 days",
//       time: '5 hours ago',
//       unread: true,
//     },
//     {
//       id: 3,
//       title: 'Goal Progress',
//       message: 'Emergency Fund is 64% complete',
//       time: '1 day ago',
//       unread: false,
//     },
//   ];

//   useEffect(() => {
//     if (session?.user?.accessToken) {
//       apiClient
//         .get('/auth/me/')
//         .then((response) => {
//           const data = response.data;
//           setUserProfile({
//             fullName: data.profile?.full_name || '',
//             email: data.user?.email || session.user?.email || '',
//             profilePicture: data.profile?.profile_picture || null,
//           });
//         })
//         .catch((err) => {
//           console.error('Error fetching user profile:', err);
//           setUserProfile((prev) => ({
//             ...prev,
//             email: session.user?.email || '',
//           }));
//         });
//     }
//   }, [session]);

//   const displayInitial = userProfile.fullName
//     ? userProfile.fullName.charAt(0).toUpperCase()
//     : userProfile.email
//       ? userProfile.email.charAt(0).toUpperCase()
//       : 'U';

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between">
//           {/* Left: Navigation */}
//           <div className="flex items-center gap-2">
//             {currentPage !== 'Dashboard' && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => window.history.back()}
//                 className="mr-2"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>
//             )}
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => onNavigate('Dashboard')}
//               className={cn(
//                 currentPage === 'Dashboard' && 'bg-muted text-foreground',
//               )}
//             >
//               <Home className="h-5 w-5" />
//             </Button>
//           </div>

//           {/* Center: Logo & Brand */}
//           <div className="flex items-center gap-2">
//             <Image
//               src={logoImage}
//               alt="SnappX Logo"
//               className="h-10 w-10 rounded-[10px]"
//             />
//             <div className="hidden sm:block">
//               <div className="text-lg font-semibold text-foreground">
//                 SnappX
//               </div>
//               <div className="text-xs text-muted-foreground">
//                 Empowering Collective Growth
//               </div>
//             </div>
//           </div>

//           {/* Right: Notifications & Profile */}
//           <div className="flex items-center gap-2">
//             {/* Notifications Dropdown */}
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   setShowNotifications(!showNotifications);
//                   setShowProfile(false);
//                 }}
//                 className="relative"
//               >
//                 <Bell className="h-5 w-5" />
//                 {notifications.some((n) => n.unread) && (
//                   <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
//                 )}
//               </Button>

//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
//                   <div className="p-4 border-b border-border">
//                     <h3 className="font-semibold text-foreground mb-3">
//                       Notifications
//                     </h3>

//                     <div className="space-y-3 text-sm">
//                       <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.groupPaymentReminders}
//                           onChange={(e) =>
//                             setNotificationSettings({
//                               ...notificationSettings,
//                               groupPaymentReminders: e.target.checked,
//                             })
//                           }
//                           className="rounded border-border text-primary focus:ring-primary"
//                         />
//                         <span className="text-muted-foreground">
//                           Group payment reminders
//                         </span>
//                       </label>
//                       <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.payoutDateReminders}
//                           onChange={(e) =>
//                             setNotificationSettings({
//                               ...notificationSettings,
//                               payoutDateReminders: e.target.checked,
//                             })
//                           }
//                           className="rounded border-border text-primary focus:ring-primary"
//                         />
//                         <span className="text-muted-foreground">
//                           Payout date reminders
//                         </span>
//                       </label>
//                       <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.goalProgressUpdates}
//                           onChange={(e) =>
//                             setNotificationSettings({
//                               ...notificationSettings,
//                               goalProgressUpdates: e.target.checked,
//                             })
//                           }
//                           className="rounded border-border text-primary focus:ring-primary"
//                         />
//                         <span className="text-muted-foreground">
//                           Goal progress updates
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <div className="max-h-96 overflow-y-auto">
//                     {notifications.map((notification) => (
//                       <div
//                         key={notification.id}
//                         className={cn(
//                           'p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors',
//                           notification.unread && 'bg-primary/5',
//                         )}
//                       >
//                         <div className="flex items-start gap-3">
//                           <div
//                             className={cn(
//                               'w-2 h-2 rounded-full mt-2',
//                               notification.unread
//                                 ? 'bg-primary'
//                                 : 'bg-transparent',
//                             )}
//                           />
//                           <div className="flex-1">
//                             <p className="font-medium text-sm text-foreground">
//                               {notification.title}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {notification.message}
//                             </p>
//                             <p className="text-xs text-muted-foreground mt-1">
//                               {notification.time}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="p-3 text-center border-t border-border">
//                     <button className="text-sm text-primary hover:underline">
//                       View All Notifications
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Profile Dropdown */}
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   setShowProfile(!showProfile);
//                   setShowNotifications(false);
//                 }}
//                 className="rounded-full"
//               >
//                 {userProfile.profilePicture ? (
//                   <Image
//                     src={userProfile.profilePicture}
//                     alt="Profile picture"
//                     width={32}
//                     height={32}
//                     className="h-8 w-8 rounded-full object-cover border-2 border-primary/30"
//                   />
//                 ) : (
//                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
//                     {displayInitial}
//                   </div>
//                 )}
//               </Button>

//               {showProfile && (
//                 <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
//                   <div className="p-4 border-b border-border">
//                     <p className="font-semibold text-foreground truncate">
//                       {userProfile.fullName || 'User'}
//                     </p>
//                     <p className="text-sm text-muted-foreground truncate">
//                       {userProfile.email || 'user@example.com'}
//                     </p>
//                   </div>

//                   <div className="p-2">
//                     <button
//                       onClick={() => {
//                         onNavigate('Profile');
//                         setShowProfile(false);
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
//                     >
//                       <User className="h-4 w-4" />
//                       <span className="text-sm">Profile Settings</span>
//                     </button>
//                     <button
//                       onClick={() => {
//                         onNavigate('Settings');
//                         setShowProfile(false);
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
//                     >
//                       <Settings className="h-4 w-4" />
//                       <span className="text-sm">Account Settings</span>
//                     </button>
//                   </div>

//                   <div className="p-2 border-t border-border">
//                     <button
//                       onClick={() => {
//                         setShowProfile(false);
//                         onLogout();
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left text-destructive transition-colors"
//                     >
//                       <LogOut className="h-4 w-4 dark:text-red-600" />
//                       <span className="text-sm dark:text-red-600">
//                         Sign Out
//                       </span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// // src/components/DashboardHeader.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import { ArrowLeft, Home, Bell, User, Settings, LogOut } from 'lucide-react';
// import { Button } from './ui/button';
// import Image from 'next/image';
// import logoImage from '../assets/logo.png';
// import { useSession } from 'next-auth/react';
// import { apiClient } from '@/src/lib/axios';
// import { cn } from './ui/utils';

// interface DashboardHeaderProps {
//   currentPage: string;
//   onNavigate: (page: string) => void;
//   onLogout: () => void;
// }

// interface UserProfile {
//   fullName: string;
//   email: string;
//   profilePicture: string | null;
// }

// export function DashboardHeader({
//   currentPage,
//   onNavigate,
//   onLogout,
// }: DashboardHeaderProps) {
//   const { data: session } = useSession();
//   const [userProfile, setUserProfile] = useState<UserProfile>({
//     fullName: '',
//     email: session?.user?.email || '',
//     profilePicture: null,
//   });

//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfile, setShowProfile] = useState(false);

//   const [notificationSettings, setNotificationSettings] = useState({
//     groupPaymentReminders: true,
//     payoutDateReminders: true,
//     goalProgressUpdates: true,
//   });

//   const notifications = [
//     {
//       id: 1,
//       title: 'Payment Due Tomorrow',
//       message: 'Family Savings Circle - ₵200',
//       time: '2 hours ago',
//       unread: true,
//     },
//     {
//       id: 2,
//       title: 'Payout Scheduled',
//       message: "You'll receive ₵1,500 in 3 days",
//       time: '5 hours ago',
//       unread: true,
//     },
//     {
//       id: 3,
//       title: 'Goal Progress',
//       message: 'Emergency Fund is 64% complete',
//       time: '1 day ago',
//       unread: false,
//     },
//   ];

//   useEffect(() => {
//     if (session?.user?.accessToken) {
//       apiClient
//         .get('/auth/me/')
//         .then((response) => {
//           const data = response.data;
//           setUserProfile({
//             fullName: data.profile?.full_name || '',
//             email: data.user?.email || session.user?.email || '',
//             profilePicture: data.profile?.profile_picture || null,
//           });
//         })
//         .catch((err) => {
//           console.error('Error fetching user profile:', err);
//           setUserProfile((prev) => ({
//             ...prev,
//             email: session.user?.email || '',
//           }));
//         });
//     }
//   }, [session]);

//   const displayInitial = userProfile.fullName
//     ? userProfile.fullName.charAt(0).toUpperCase()
//     : userProfile.email
//       ? userProfile.email.charAt(0).toUpperCase()
//       : 'U';

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between">
//           {/* Left: Navigation */}
//           <div className="flex items-center gap-2">
//             {currentPage !== 'Dashboard' && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => window.history.back()}
//                 className="mr-2"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>
//             )}
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => onNavigate('Dashboard')}
//               className={cn(
//                 currentPage === 'Dashboard' && 'bg-muted text-foreground',
//               )}
//             >
//               <Home className="h-5 w-5" />
//             </Button>
//           </div>

//           {/* Center: Logo & Brand */}
//           <div className="flex items-center gap-2">
//             <Image
//               src={logoImage}
//               alt="SnappX Logo"
//               className="h-10 w-10 rounded-[10px]"
//             />
//             <div className="hidden sm:block">
//               <div className="text-lg font-semibold text-foreground">
//                 SnappX
//               </div>
//               <div className="text-xs text-muted-foreground">
//                 Empowering Collective Growth
//               </div>
//             </div>
//           </div>

//           {/* Right: Notifications & Profile */}
//           <div className="flex items-center gap-2">
//             {/* Notifications Dropdown */}
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   setShowNotifications(!showNotifications);
//                   setShowProfile(false);
//                 }}
//                 className="relative"
//               >
//                 <Bell className="h-5 w-5" />
//                 {notifications.some((n) => n.unread) && (
//                   <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
//                 )}
//               </Button>

//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
//                   <div className="p-4 border-b border-border">
//                     <h3 className="font-semibold text-foreground mb-3">
//                       Notifications
//                     </h3>

//                     <div className="space-y-3 text-sm">
//                       <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.groupPaymentReminders}
//                           onChange={(e) =>
//                             setNotificationSettings({
//                               ...notificationSettings,
//                               groupPaymentReminders: e.target.checked,
//                             })
//                           }
//                           className="rounded border-border text-primary focus:ring-primary"
//                         />
//                         <span className="text-muted-foreground">
//                           Group payment reminders
//                         </span>
//                       </label>
//                       <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.payoutDateReminders}
//                           onChange={(e) =>
//                             setNotificationSettings({
//                               ...notificationSettings,
//                               payoutDateReminders: e.target.checked,
//                             })
//                           }
//                           className="rounded border-border text-primary focus:ring-primary"
//                         />
//                         <span className="text-muted-foreground">
//                           Payout date reminders
//                         </span>
//                       </label>
//                       <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={notificationSettings.goalProgressUpdates}
//                           onChange={(e) =>
//                             setNotificationSettings({
//                               ...notificationSettings,
//                               goalProgressUpdates: e.target.checked,
//                             })
//                           }
//                           className="rounded border-border text-primary focus:ring-primary"
//                         />
//                         <span className="text-muted-foreground">
//                           Goal progress updates
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <div className="max-h-96 overflow-y-auto">
//                     {notifications.map((notification) => (
//                       <div
//                         key={notification.id}
//                         className={cn(
//                           'p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors',
//                           notification.unread && 'bg-primary/5',
//                         )}
//                       >
//                         <div className="flex items-start gap-3">
//                           <div
//                             className={cn(
//                               'w-2 h-2 rounded-full mt-2',
//                               notification.unread
//                                 ? 'bg-primary'
//                                 : 'bg-transparent',
//                             )}
//                           />
//                           <div className="flex-1">
//                             <p className="font-medium text-sm text-foreground">
//                               {notification.title}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {notification.message}
//                             </p>
//                             <p className="text-xs text-muted-foreground mt-1">
//                               {notification.time}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="p-3 text-center border-t border-border">
//                     <button className="text-sm text-primary hover:underline">
//                       View All Notifications
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Profile Dropdown */}
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   setShowProfile(!showProfile);
//                   setShowNotifications(false);
//                 }}
//                 className="rounded-full"
//               >
//                 {userProfile.profilePicture ? (
//                   <Image
//                     src={userProfile.profilePicture}
//                     alt="Profile picture"
//                     width={32}
//                     height={32}
//                     className="h-8 w-8 rounded-full object-cover border-2 border-primary/30"
//                   />
//                 ) : (
//                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
//                     {displayInitial}
//                   </div>
//                 )}
//               </Button>

//               {showProfile && (
//                 <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
//                   <div className="p-4 border-b border-border">
//                     <p className="font-semibold text-foreground truncate">
//                       {userProfile.fullName || 'User'}
//                     </p>
//                     <p className="text-sm text-muted-foreground truncate">
//                       {userProfile.email || 'user@example.com'}
//                     </p>
//                   </div>

//                   <div className="p-2">
//                     <button
//                       onClick={() => {
//                         onNavigate('Profile');
//                         setShowProfile(false);
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
//                     >
//                       <User className="h-4 w-4" />
//                       <span className="text-sm">Profile Settings</span>
//                     </button>
//                     <button
//                       onClick={() => {
//                         onNavigate('Settings');
//                         setShowProfile(false);
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
//                     >
//                       <Settings className="h-4 w-4" />
//                       <span className="text-sm">Account Settings</span>
//                     </button>
//                   </div>

//                   <div className="p-2 border-t border-border">
//                     <button
//                       onClick={() => {
//                         setShowProfile(false);
//                         onLogout();
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left text-destructive transition-colors"
//                     >
//                       <LogOut className="h-4 w-4 dark:text-red-600" />
//                       <span className="text-sm dark:text-red-600">
//                         Sign Out
//                       </span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
