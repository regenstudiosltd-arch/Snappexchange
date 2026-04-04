// src/hooks/usePendingInvite.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface PendingInvite {
  token: string;
  group_id: number;
  public_id: string;
  group_name: string;
}

export function usePendingInvite() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;

    const raw = sessionStorage.getItem('pending_invite');
    if (!raw) return;

    try {
      const invite: PendingInvite = JSON.parse(raw);
      sessionStorage.removeItem('pending_invite');

      // Redirect to the group detail page — user can then send a join request
      const target = `/groups/${invite.public_id ?? invite.group_id}`;
      router.push(target);
    } catch {
      sessionStorage.removeItem('pending_invite');
    }
  }, [status, router]);
}
