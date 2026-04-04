import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    // Exclude: api, static files, auth pages, AND the public invite preview route
    '/((?!api|_next/static|_next/image|favicon.ico|signup|otp|forgot-password|invite|$).*)',
  ],
};
