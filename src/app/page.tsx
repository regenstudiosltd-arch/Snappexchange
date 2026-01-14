'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/src/components/Header';
import { Hero } from '@/src/components/Hero';
import { Services } from '@/src/components/Services';
import { HowItWorks } from '@/src/components/HowItWorks';
import { About } from '@/src/components/About';
import { Testimonials } from '@/src/components/Testimonials';
import { CTA } from '@/src/components/CTA';
import { Footer } from '@/src/components/Footer';

export default function LandingPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleNavigate = (view: string) => {
    if (view === 'login') router.push('/login');
    if (view === 'signup') router.push('/signup');
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header onNavigate={handleNavigate} />
      <Hero onNavigate={handleNavigate} />
      <Services />
      <HowItWorks />
      <About />
      <Testimonials />
      <CTA onNavigate={handleNavigate} />
      <Footer />
    </main>
  );
}
