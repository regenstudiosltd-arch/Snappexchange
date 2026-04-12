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
