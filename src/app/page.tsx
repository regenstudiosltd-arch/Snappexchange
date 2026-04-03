// src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/src/components/landingPage/Header';
import { Hero } from '@/src/components/landingPage/Hero';
import { Services } from '@/src/components/landingPage/Services';
import { HowItWorks } from '@/src/components/landingPage/HowItWorks';
import { About } from '@/src/components/landingPage/About';
import { Testimonials } from '@/src/components/landingPage/Testimonials';
import { CTA } from '@/src/components/landingPage/CTA';
import { Footer } from '@/src/components/landingPage/Footer';
import { BackToTop } from '@/src/components/landingPage/BackToTop';

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
      <BackToTop />
    </main>
  );
}
