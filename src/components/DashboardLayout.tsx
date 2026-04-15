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

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    page: 'Dashboard',
    color: '#0A9B8E',
  },
  { icon: Target, label: 'Goals', page: 'Goals', color: '#C8A96E' },
  { icon: Users, label: 'Groups', page: 'Groups', color: '#0A9B8E' },
  { icon: UserPlus, label: 'Requests', page: 'Requests', color: '#C8A96E' },
  {
    icon: MessageCircle,
    label: 'AI Chat',
    page: 'AI Assistant',
    color: '#0A9B8E',
  },
  // { icon: Bot, label: 'Bot', page: 'Bot Integration', color: '#C8A96E' },
  { icon: TrendingUp, label: 'Analytics', page: 'Analytics', color: '#0A9B8E' },
  { icon: Settings, label: 'Settings', page: 'Settings', color: '#C8A96E' },
];

export function DashboardLayout({
  children,
  currentPage,
  onNavigate,
}: DashboardLayoutProps) {
  return (
    <>
      <div className="dash-layout">
        {/* Desktop Sidebar */}
        <aside className="dash-sidebar">
          <nav
            style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    ['--item-color' as string]: item.color,
                    ['--item-bg' as string]: `${item.color}15`,
                  }}
                >
                  <span className="sidebar-icon-wrap">
                    <Icon
                      size={16}
                      color={isActive ? item.color : 'currentColor'}
                    />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dash-content-area">
          <div className="dash-content-inner">{children}</div>
        </main>

        <nav
          className="mobile-nav backdrop-blur-xl supports-backdrop-filter:bg-background/60"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="mobile-nav-scroll">
            {' '}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  style={{ ['--item-color' as string]: item.color }}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="mobile-icon-bubble">
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span className="mobile-nav-label">{item.label}</span>
                </button>
              );
            })}
          </div>{' '}
        </nav>
      </div>
    </>
  );
}
