'use client';
import { useRouter } from 'next/navigation';
import { SignupEnhanced } from '@/src/components/auth/SignupEnhanced';

export default function SignupPage() {
  const router = useRouter();

  return (
    <SignupEnhanced
      onComplete={(phoneNumber) => {
        router.push(`/otp?phone=${encodeURIComponent(phoneNumber)}`);
      }}
    />
  );
}
