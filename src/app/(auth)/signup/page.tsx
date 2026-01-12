'use client';

import { SignupEnhanced } from '@/src/components/auth/SignupEnhanced';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <SignupEnhanced onComplete={() => router.push('/otp')} />
      </div>
    </div>
  );
}
