'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { DashboardHeader } from '@/src/components/DashboardHeader';
import { DashboardLayout } from '@/src/components/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleNavigate = (page: string) => {
    const slug = page.toLowerCase().replace(' ', '-');
    const target = slug === 'dashboard' ? '/dashboard' : `/${slug}`;
    router.push(target);
  };

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
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
