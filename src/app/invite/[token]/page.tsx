// src/app/invite/[token]/page.tsx

import { InvitePreviewPage } from '@/src/components/pages/InvitePreviewPage';

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InvitePreviewPage token={token} />;
}

export const metadata = {
  title: 'Join a Savings Group — SnappX',
  description: "You've been invited to join a savings circle on SnappX.",
};
