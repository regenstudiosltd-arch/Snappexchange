'use client';

import { DashboardHomeEnhanced } from '@/src/components/pages/DashboardHomeEnhanced';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  return (
    <DashboardHomeEnhanced
      onNavigate={(page) => {
        const routeMap: Record<string, string> = {
          Dashboard: '/dashboard',
          Goals: '/goals',
          Groups: '/groups',
          Requests: '/requests',
          'AI Assistant': '/ai-assistant',
          'Bot Integration': '/bot-integration',
          Analytics: '/analytics',
          Settings: '/settings',
        };
        const target = routeMap[page] || '/dashboard';
        router.push(target);
      }}
    />
  );
}
