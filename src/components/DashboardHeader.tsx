'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import logoImage from '../assets/logo.png';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/src/lib/axios';
import { cn } from './ui/utils';

interface DashboardHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface UserProfile {
  fullName: string;
  email: string;
  profilePicture: string | null;
}

export function DashboardHeader({
  currentPage,
  onNavigate,
  onLogout,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: session?.user?.email || '',
    profilePicture: null,
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    groupPaymentReminders: true,
    payoutDateReminders: true,
    goalProgressUpdates: true,
  });

  const notifications = [
    {
      id: 1,
      title: 'Payment Due Tomorrow',
      message: 'Family Savings Circle - ₵200',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Payout Scheduled',
      message: "You'll receive ₵1,500 in 3 days",
      time: '5 hours ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Goal Progress',
      message: 'Emergency Fund is 64% complete',
      time: '1 day ago',
      unread: false,
    },
  ];

  useEffect(() => {
    if (session?.user?.accessToken) {
      apiClient
        .get('/auth/me/')
        .then((response) => {
          const data = response.data;
          setUserProfile({
            fullName: data.profile?.full_name || '',
            email: data.user?.email || session.user?.email || '',
            profilePicture: data.profile?.profile_picture || null,
          });
        })
        .catch((err) => {
          console.error('Error fetching user profile:', err);
          setUserProfile((prev) => ({
            ...prev,
            email: session.user?.email || '',
          }));
        });
    }
  }, [session]);

  const displayInitial = userProfile.fullName
    ? userProfile.fullName.charAt(0).toUpperCase()
    : userProfile.email
      ? userProfile.email.charAt(0).toUpperCase()
      : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            {currentPage !== 'Dashboard' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('Dashboard')}
              className={cn(
                currentPage === 'Dashboard' && 'bg-muted text-foreground',
              )}
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: Logo & Brand */}
          <div className="flex items-center gap-2">
            <Image
              src={logoImage}
              alt="SnappX Logo"
              className="h-10 w-10 rounded-[10px]"
            />
            <div className="hidden sm:block">
              <div className="text-lg font-semibold text-foreground">
                SnappX
              </div>
              <div className="text-xs text-muted-foreground">
                Empowering Collective Growth
              </div>
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground mb-3">
                      Notifications
                    </h3>

                    <div className="space-y-3 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.groupPaymentReminders}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              groupPaymentReminders: e.target.checked,
                            })
                          }
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-muted-foreground">
                          Group payment reminders
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.payoutDateReminders}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              payoutDateReminders: e.target.checked,
                            })
                          }
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-muted-foreground">
                          Payout date reminders
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.goalProgressUpdates}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              goalProgressUpdates: e.target.checked,
                            })
                          }
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-muted-foreground">
                          Goal progress updates
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors',
                          notification.unread && 'bg-primary/5',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-2',
                              notification.unread
                                ? 'bg-primary'
                                : 'bg-transparent',
                            )}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 text-center border-t border-border">
                    <button className="text-sm text-primary hover:underline">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="rounded-full"
              >
                {userProfile.profilePicture ? (
                  <Image
                    src={userProfile.profilePicture}
                    alt="Profile picture"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
                    {displayInitial}
                  </div>
                )}
              </Button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-foreground truncate">
                      {userProfile.fullName || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {userProfile.email || 'user@example.com'}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        onNavigate('Profile');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm">Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('Settings');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Account Settings</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-border">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4 dark:text-red-600" />
                      <span className="text-sm dark:text-red-600">
                        Sign Out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
