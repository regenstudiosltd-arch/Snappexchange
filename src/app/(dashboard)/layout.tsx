'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/src/components/DashboardHeader';
import { DashboardLayout } from '@/src/components/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('snappx_session');
    if (!session) {
      router.push('/login');
    } else {
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
        currentPage="Dashboard"
        onNavigate={(page) => {
          const slug = page.toLowerCase().replace(' ', '-');
          const target = slug === 'dashboard' ? '/dashboard' : `/${slug}`;
          router.push(target);
        }}
        onLogout={handleLogout}
      />
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
}
