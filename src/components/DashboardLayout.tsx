// src/components/DashboardLayout.tsx

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
  { icon: Bot, label: 'Bot', page: 'Bot Integration', color: '#C8A96E' },
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

        {/* Mobile Bottom Nav */}
        {/* <nav
          className="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
        >
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
                <span
                  className="mobile-icon-bubble"
                  style={
                    isActive
                      ? {
                          background: `${item.color}15`,
                        }
                      : {}
                  }
                >
                  <Icon
                    size={18}
                    color={isActive ? item.color : 'currentColor'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav> */}

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

// // src/components/DashboardLayout.tsx

// 'use client';

// import {
//   LayoutDashboard,
//   Target,
//   Users,
//   TrendingUp,
//   Settings,
//   MessageCircle,
//   Bot,
//   UserPlus,
// } from 'lucide-react';

// interface DashboardLayoutProps {
//   children: React.ReactNode;
//   currentPage: string;
//   onNavigate: (page: string) => void;
// }

// export function DashboardLayout({
//   children,
//   currentPage,
//   onNavigate,
// }: DashboardLayoutProps) {
//   const menuItems = [
//     { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
//     { icon: Target, label: 'Goals', page: 'Goals' },
//     { icon: Users, label: 'Groups', page: 'Groups' },
//     { icon: UserPlus, label: 'Requests', page: 'Requests' },
//     { icon: MessageCircle, label: 'AI Assistant', page: 'AI Assistant' },
//     { icon: Bot, label: 'Bot Integration', page: 'Bot Integration' },
//     { icon: TrendingUp, label: 'Analytics', page: 'Analytics' },
//     { icon: Settings, label: 'Settings', page: 'Settings' },
//   ];

//   return (
//     <div className="flex flex-1">
//       {/* Desktop Sidebar */}
//       <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
//         <nav className="flex-1 p-4 space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = currentPage === item.page;
//             return (
//               <button
//                 key={item.page}
//                 onClick={() => onNavigate(item.page)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                   isActive
//                     ? 'bg-primary text-primary-foreground'
//                     : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 overflow-auto bg-background">
//         <div className="container mx-auto px-4 py-6">{children}</div>
//       </main>

//       {/* Mobile Bottom Navigation */}
//       <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 overflow-x-auto no-scrollbar snap-x snap-mandatory">
//         <div className="flex items-center px-4 py-3 gap-3 min-w-max">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = currentPage === item.page;
//             return (
//               <button
//                 key={item.page}
//                 onClick={() => onNavigate(item.page)}
//                 className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all shrink-0 snap-center min-w-19.5 ${
//                   isActive
//                     ? 'text-primary bg-primary/10'
//                     : 'text-foreground/70 hover:text-foreground active:bg-muted'
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span className="text-xs font-medium whitespace-nowrap">
//                   {item.label}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </nav>

//       <div className="md:hidden h-20" />
//     </div>
//   );
// }
