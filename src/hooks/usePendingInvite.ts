import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { authService } from '@/src/services/auth.service';

interface PendingInvite {
  token: string;
  group_id: number;
  public_id: string;
  group_name: string;
}

/**
 * Runs once per authenticated session.
 *
 * If the user arrived via an invite link (the invite was stored in
 * sessionStorage by InvitePreviewPage before the login/signup redirect),
 * this hook:
 *   1. Calls POST /accounts/invite/<token>/accept/ to auto-join the group
 *      (bypassing the join-request / admin-approval cycle).
 *   2. Redirects the user to the group detail page instead of leaving
 *      them on the dashboard.
 *
 * The hook is intentionally idempotent: it clears sessionStorage before
 * making the network call so a hard refresh cannot trigger a second join.
 *
 * Mount this hook in any layout or page that is rendered immediately after
 * a successful login — the dashboard root is the natural location.
 */
export function usePendingInvite() {
  const { status } = useSession();
  const router = useRouter();

  // Guard against React Strict Mode double-invocation in development
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Only run once the session is confirmed authenticated
    if (status !== 'authenticated') return;
    if (hasProcessed.current) return;

    const raw = sessionStorage.getItem('pending_invite');
    if (!raw) return;

    // Mark processed and clear storage immediately so a re-render / refresh
    // never processes the same invite twice.
    hasProcessed.current = true;
    sessionStorage.removeItem('pending_invite');

    let invite: PendingInvite;
    try {
      invite = JSON.parse(raw);
    } catch {
      // Corrupted data — discard silently
      return;
    }

    // Fallback target in case the API call fails
    const fallbackTarget = `/groups/${invite.public_id ?? invite.group_id}`;

    authService
      .acceptInvite(invite.token)
      .then((data) => {
        // On success (201 joined) or idempotent (200 already member),
        // the backend returns the group's public_id — use it for the redirect.
        const target = `/groups/${data.group_public_id ?? invite.public_id ?? invite.group_id}`;
        router.replace(target);
      })
      .catch(() => {
        // Even on error (e.g. group full, link revoked), take the user to
        // the group detail page so they can see what happened and manually
        // send a join request if they wish.
        router.replace(fallbackTarget);
      });
  }, [status, router]);
}

// // src/hooks/usePendingInvite.ts

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';

// interface PendingInvite {
//   token: string;
//   group_id: number;
//   public_id: string;
//   group_name: string;
// }

// export function usePendingInvite() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status !== 'authenticated') return;

//     const raw = sessionStorage.getItem('pending_invite');
//     if (!raw) return;

//     try {
//       const invite: PendingInvite = JSON.parse(raw);
//       sessionStorage.removeItem('pending_invite');

//       // Redirect to the group detail page — user can then send a join request
//       const target = `/groups/${invite.public_id ?? invite.group_id}`;
//       router.push(target);
//     } catch {
//       sessionStorage.removeItem('pending_invite');
//     }
//   }, [status, router]);
// }
