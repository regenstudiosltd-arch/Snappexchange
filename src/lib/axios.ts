import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Queue for requests that arrive while a refresh is in flight
let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  queue = [];
}

// Request interceptor: attach token on every request
apiClient.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react');
  const session = await getSession();
  if (session?.user?.accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: InternalAxiosRequestConfig & { _retry?: boolean } =
      error.config;

    const status = error.response?.status;
    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // 401 handling: try to get a fresh token once
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { getSession } = await import('next-auth/react');
      const freshSession = await getSession();

      if (!freshSession?.user?.accessToken || freshSession.error) {
        throw new Error(freshSession?.error ?? 'Session expired');
      }

      const newToken = freshSession.user.accessToken;
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      flushQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: true, callbackUrl: '/login' });
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
