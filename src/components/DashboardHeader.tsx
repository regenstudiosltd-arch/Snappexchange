"use client";

import { useState } from "react";
import { ArrowLeft, Home, Bell, User, Settings, LogOut, Check } from "lucide-react";
import { Button } from "./ui/button";
import logoImage from "figma:asset/0ed25e47149e7d72733dec05c2993c034a158749.png";

interface DashboardHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DashboardHeader({ currentPage, onNavigate, onLogout }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    groupPaymentReminders: true,
    payoutDateReminders: true,
    goalProgressUpdates: true,
  });

  const notifications = [
    { id: 1, title: "Payment Due Tomorrow", message: "Family Savings Circle - ₵200", time: "2 hours ago", unread: true },
    { id: 2, title: "Payout Scheduled", message: "You'll receive ₵1,500 in 3 days", time: "5 hours ago", unread: true },
    { id: 3, title: "Goal Progress", message: "Emergency Fund is 64% complete", time: "1 day ago", unread: false },
  ];

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            {currentPage !== "Dashboard" && (
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
              onClick={() => onNavigate("Dashboard")}
              className={currentPage === "Dashboard" ? "bg-muted" : ""}
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: Logo & Brand */}
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="SnappX Logo" className="h-10 w-10 rounded-lg" />
            <div className="hidden sm:block">
              <div className="text-lg font-semibold">SnappX</div>
              <div className="text-xs text-muted-foreground">Empowering Collective Growth</div>
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
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-500" />
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-popover shadow-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold mb-3">Notifications</h3>
                    
                    {/* Notification Settings */}
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.groupPaymentReminders}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            groupPaymentReminders: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-muted-foreground">Group payment reminders</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.payoutDateReminders}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            payoutDateReminders: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-muted-foreground">Payout date reminders</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.goalProgressUpdates}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            goalProgressUpdates: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-muted-foreground">Goal progress updates</span>
                      </label>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${
                          notification.unread ? "bg-cyan-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? "bg-cyan-500" : "bg-transparent"
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 text-center border-t">
                    <button className="text-sm text-cyan-600 hover:underline">
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
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm">
                    {currentUser.fullName?.charAt(0) || "U"}
                  </div>
                )}
              </Button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-popover shadow-lg">
                  <div className="p-4 border-b">
                    <p className="font-semibold">{currentUser.fullName || "User"}</p>
                    <p className="text-sm text-muted-foreground">{currentUser.email || "user@example.com"}</p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        onNavigate("Profile");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm">Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("Settings");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Account Settings</span>
                    </button>
                  </div>

                  <div className="p-2 border-t">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Sign Out</span>
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
