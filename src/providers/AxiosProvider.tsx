// src/providers/AxiosProvider.tsx;

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/src/lib/axios';

export function AxiosProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Attach the interceptor dynamically when the session changes
    const reqIntercept = apiClient.interceptors.request.use((config) => {
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
      return config;
    });

    // Cleanup the interceptor when the component unmounts or session changes
    return () => {
      apiClient.interceptors.request.eject(reqIntercept);
    };
  }, [session]);

  return <>{children}</>;
}
