// src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Sora, Roboto } from 'next/font/google';
import { Providers } from '@/src/providers/Providers';
import { Toaster } from '../components/ui/sonner';
import '../../styles/globals.css';

const fontHeading = Sora({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const fontBody = Roboto({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// const = DM_SANS({
//   variable: '--font-body',
//   subsets: ['latin'],
//   display: 'swap',
//   weight: ['400', '500', '600', '700'],
// });

export const metadata: Metadata = {
  title: 'SnappX Web App',
  description: 'Empowering Collective Growth',
  robots: 'index, follow',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const themeStrategyScript = `
  (function() {
    try {
      const storageKey = 'app-theme';
      const theme = localStorage.getItem(storageKey) || 'system';
      const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && supportDarkMode);

      document.documentElement.classList.toggle('dark', isDark);
    } catch (e) {
      console.error('Theme initialization failed', e);
    }
  })();
`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeStrategyScript }} />
      </head>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
