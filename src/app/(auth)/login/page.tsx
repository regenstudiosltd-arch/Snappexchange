'use client';

import { LoginEnhanced } from '@/src/components/auth/LoginEnhanced';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginEnhanced
          onSuccess={() => router.push('/dashboard')}
          onNavigate={(view) =>
            router.push(view === 'landing' ? '/' : `/${view}`)
          }
        />
      </div>
    </div>
  );
}
