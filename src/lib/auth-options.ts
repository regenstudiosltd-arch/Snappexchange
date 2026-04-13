// src/lib/auth-options.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiClient } from './axios';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    error?: string;
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      accessToken: string;
      refreshToken: string;
      isVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
    accessToken: string;
    refreshToken: string;
    isVerified: boolean;
    accessTokenExpires?: number;
    rememberMe?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    isVerified: boolean;
    accessTokenExpires: number;
    name: string;
    image: string | null;
    error?: string;
    rememberMe: boolean;
  }
}

//  helpers

function getJwtExpiration(token: string): number {
  try {
    if (!token) return 0;
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return payload.exp * 1000;
  } catch {
    return 0;
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
      { refresh: token.refreshToken },
    );

    const { access, refresh } = response.data;

    return {
      ...token,
      accessToken: access,
      refreshToken: refresh ?? token.refreshToken,
      accessTokenExpires: getJwtExpiration(access),
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

const SESSION_MAX_AGE_REMEMBER = 60 * 60 * 24 * 365;
const SESSION_MAX_AGE_DEFAULT = 60 * 60 * 24 * 30;

//  authOptions

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        login_field: { label: 'Email/Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
        remember_me: { label: 'Remember Me', type: 'boolean' },
      },
      async authorize(credentials) {
        try {
          const rememberMe = credentials?.remember_me === 'true';

          const res = await apiClient.post('/auth/login/', {
            login_field: credentials?.login_field,
            password: credentials?.password,
            remember_me: rememberMe,
          });

          const { access, refresh } = res.data;

          const meRes = await apiClient.get('/auth/me/', {
            headers: { Authorization: `Bearer ${access}` },
          });

          const { user: userProfile, profile } = meRes.data;

          return {
            id: String(userProfile.id),
            email: userProfile.email,
            name: profile.full_name,
            image: profile.profile_picture || null,
            isVerified: userProfile.is_verified,
            accessToken: access,
            refreshToken: refresh,
            accessTokenExpires: getJwtExpiration(access),
            rememberMe,
          };
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const data = error.response?.data as { detail?: string };
            throw new Error(data?.detail || error.message || 'Login failed');
          }
          throw new Error('An unexpected error occurred during login');
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          isVerified: user.isVerified,
          name: user.name,
          image: user.image,
          accessTokenExpires:
            user.accessTokenExpires ?? getJwtExpiration(user.accessToken),
          rememberMe: user.rememberMe ?? false,
        };
      }

      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.isVerified = token.isVerified;
        session.user.name = token.name;
        session.user.image = token.image;
        session.error = token.error;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_REMEMBER,
    updateAge: 60 * 60 * 24,
  },

  pages: {
    signIn: '/login',
  },

  jwt: {
    maxAge: SESSION_MAX_AGE_REMEMBER,
  },
};
