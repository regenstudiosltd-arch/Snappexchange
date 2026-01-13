'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardHeader } from '@/src/components/DashboardHeader';
import { DashboardLayout } from '@/src/components/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('snappx_session');
    if (!session) {
      router.push('/login');
    } else {
      // Simulate checking session validity
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('snappx_session');
    localStorage.removeItem('snappx_user');
    router.push('/login');
  };

  // Shared navigation logic
  const handleNavigate = (page: string) => {
    const slug = page.toLowerCase().replace(' ', '-');
    const target = slug === 'dashboard' ? '/dashboard' : `/${slug}`;
    router.push(target);
  };

  // Helper to determine the current page title based on URL
  const getCurrentPageName = () => {
    const path = pathname?.split('/')[1] || 'dashboard';

    const pageMap: Record<string, string> = {
      dashboard: 'Dashboard',
      goals: 'Goals',
      groups: 'Groups',
      requests: 'Requests',
      'ai-assistant': 'AI Assistant',
      'bot-integration': 'Bot Integration',
      analytics: 'Analytics',
      settings: 'Settings',
    };

    return pageMap[path] || 'Dashboard';
  };

  const currentPage = getCurrentPageName();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <DashboardLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {children}
      </DashboardLayout>
    </div>
  );
}
