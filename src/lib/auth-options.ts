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
      accessToken: string;
      refreshToken: string;
      isVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    isVerified: boolean;
    accessTokenExpires?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    isVerified: boolean;
    accessTokenExpires: number;
    error?: string;
  }
}

function getJwtExpiration(token: string): number {
  try {
    if (!token) return 0;
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(decodedJson);
    return payload.exp * 1000;
  } catch (e) {
    return 0;
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
      }/auth/token/refresh/`,
      {
        refresh: token.refreshToken,
      }
    );

    const { access, refresh } = response.data;

    return {
      ...token,
      accessToken: access,
      refreshToken: refresh ?? token.refreshToken,
      accessTokenExpires: getJwtExpiration(access),
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

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
          const res = await apiClient.post('/auth/login/', {
            login_field: credentials?.login_field,
            password: credentials?.password,
            remember_me: credentials?.remember_me === 'true',
          });

          const { access, refresh } = res.data;

          const meRes = await apiClient.get('/auth/me/', {
            headers: { Authorization: `Bearer ${access}` },
          });

          const userProfile = meRes.data.user;

          return {
            id: userProfile.id,
            email: userProfile.email,
            isVerified: userProfile.is_verified,
            accessToken: access,
            refreshToken: refresh,
            accessTokenExpires: getJwtExpiration(access),
          };
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const data = error.response?.data as { detail?: string };
            const errorMessage =
              data?.detail || error.message || 'Login failed';
            throw new Error(errorMessage);
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
          accessTokenExpires:
            user.accessTokenExpires || getJwtExpiration(user.accessToken),
        };
      }

      if (Date.now() < token.accessTokenExpires - 10000) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.isVerified = token.isVerified;
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
