import { GroupDetailPage } from '@/src/components/pages/GroupDetailPage/GroupDetailPage';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GroupDetailPage groupId={id} />;
}
