'use client';

import {
  LayoutDashboard,
  Target,
  Users,
  TrendingUp,
  Settings,
  MessageCircle,
  Bot,
  UserPlus,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function DashboardLayout({
  children,
  currentPage,
  onNavigate,
}: DashboardLayoutProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Target, label: 'Goals', page: 'Goals' },
    { icon: Users, label: 'Groups', page: 'Groups' },
    { icon: UserPlus, label: 'Requests', page: 'Requests' },
    { icon: MessageCircle, label: 'AI Assistant', page: 'AI Assistant' },
    { icon: Bot, label: 'Bot Integration', page: 'Bot Integration' },
    { icon: TrendingUp, label: 'Analytics', page: 'Analytics' },
    { icon: Settings, label: 'Settings', page: 'Settings' },
  ];

  return (
    <div className="flex flex-1">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r">
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around p-2 z-40">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-cyan-500' : 'text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacing for mobile bottom nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
