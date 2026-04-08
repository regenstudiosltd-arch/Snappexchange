'use client';

import { useRef, useState, useEffect } from 'react';
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
import { cn } from './ui/utils';
import { NotificationPanel } from './notification/NotificationPanel';
import { useNotifications } from '@/src/hooks/useNotifications';

//  Types

interface DashboardHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

// Component

export function DashboardHeader({
  currentPage,
  onNavigate,
  onLogout,
}: DashboardHeaderProps) {
  const { data: session, status } = useSession();

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

  //  Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showProfile &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfile]);

  const fullName = session?.user?.name || '';
  const email = session?.user?.email || '';
  const picture = session?.user?.image ?? null;
  const isVerified = session?.user?.isVerified ?? false;

  const displayName = fullName || email || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const handleNotifToggle = () => {
    setShowNotifications((prev) => !prev);
    setShowProfile(false);
  };

  const handleProfileToggle = () => {
    setShowProfile((prev) => !prev);
    setShowNotifications(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Navigation */}
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

            {/* ── Center: Logo & Brand  */}
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

            {/*  Right: Actions  */}
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
                  {picture ? (
                    <Image
                      src={picture}
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
                        'bg-card/95 backdrop-blur-2xl',
                        'shadow-2xl shadow-black/25 dark:shadow-black/60',
                        'ring-1 ring-inset ring-white/10 dark:ring-white/5',
                      )}
                    >
                      {/* Profile header */}
                      <div className="p-4 bg-linear-to-br from-primary/8 via-transparent to-transparent border-b border-border/40">
                        <div className="flex items-center gap-3">
                          {picture ? (
                            <Image
                              src={picture}
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
                                {fullName || 'User'}
                              </p>
                              {isVerified && (
                                <Shield className="h-3 w-3 text-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        <ProfileMenuItem
                          icon={User}
                          label="Profile Settings"
                          description="View personal info"
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

      {/*  Notification Panel  */}
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

//  Sub-component

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
