'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OTPVerification } from '@/src/components/auth/OTPVerification';

function OTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  return (
    <OTPVerification
      phoneNumber={phone}
      onVerifySuccess={() => {
        router.push('/login');
      }}
    />
  );
}

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OTPContent />
    </Suspense>
  );
}
