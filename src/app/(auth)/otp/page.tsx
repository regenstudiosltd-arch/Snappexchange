'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OTPVerification } from '@/src/components/auth/OTPVerification';

export default function OTPPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const pendingUser = localStorage.getItem('pendingUser');
    if (!pendingUser) {
      router.push('/signup');
    } else {
      const parsed = JSON.parse(pendingUser);
      setTimeout(() => {
        setPhoneNumber(parsed.phoneNumber || parsed.phone || '');
      }, 0);
    }
  }, [router]);

  const handleVerify = async (code: string) => {
    setIsVerifying(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (code.length === 6) {
      const now = new Date();
      const pendingUser = localStorage.getItem('pendingUser');

      if (pendingUser) {
        const userData = JSON.parse(pendingUser);
        const finalUser = {
          ...userData,
          id: now.getTime().toString(),
          verified: true,
          createdAt: now.toISOString(),
        };

        // Save User & Session
        localStorage.setItem('snappx_user', JSON.stringify(finalUser));
        localStorage.setItem('snappx_session', 'valid-session-token');
        localStorage.removeItem('pendingUser');

        // Navigate
        router.push('/dashboard');
      }
    } else {
      setIsVerifying(false);
      alert('Invalid code');
    }
  };

  const handleResend = () => {
    console.log('Resending to', phoneNumber);
  };

  return (
    <OTPVerification
      phoneNumber={phoneNumber}
      isVerifying={isVerifying}
      onVerify={handleVerify}
      onResend={handleResend}
    />
  );
}
