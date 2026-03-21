'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Toaster } from '../ui/sonner';
import { toast } from 'sonner';
import { authService } from '@/src/services/auth.service';
import { decodeHtmlEntities } from '@/src/lib/html';
import Image from 'next/image';

interface GroupDetail {
  id: number;
  group_name: string;
  description: string;
  contribution_amount: string;
  frequency: string;
  current_members: number;
  expected_members: number;
  total_group_savings: string;
  total_savings: string;
  next_due: string | null;
  status: string;
  admin_name: string;
  admin_photo?: string;
}

export function GroupDetailPage({ groupId }: { groupId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showContributeConfirm, setShowContributeConfirm] = useState(false);

  const {
    data: group,
    isLoading,
    error,
  } = useQuery<GroupDetail>({
    queryKey: ['groupDetail', groupId],
    queryFn: () => authService.getGroupDetail(groupId),
  });

  const contributeMutation = useMutation({
    mutationFn: () => authService.contributeToGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
      setShowContributeConfirm(false);
      toast.success('Contribution Recorded', {
        description:
          'Your contribution has been successfully added to the group.',
      });
    },
    onError: () => {
      toast.error('Contribution Failed', {
        description: 'Please check your wallet balance and try again.',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading group...
      </div>
    );
  }
  if (error || !group) {
    return (
      <div className="text-destructive">
        Group not found or you are not a member.
      </div>
    );
  }

  const progress =
    group.expected_members > 0
      ? Math.round(
          (parseFloat(group.total_group_savings) /
            (parseFloat(group.contribution_amount) * group.expected_members)) *
            100,
        )
      : 0;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Groups
          </Button>
          <div className="flex-1" />
          <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
            {group.status.toUpperCase()}
          </Badge>
        </div>

        {/* HERO */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight">
              {group.group_name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                {group.admin_photo && (
                  <Image
                    src={group.admin_photo}
                    width={500}
                    height={500}
                    className="h-6 w-6 rounded-full"
                    alt=""
                  />
                )}
                <span>Admin: {group.admin_name}</span>
              </div>
              <span>•</span>
              <span>
                {group.current_members} / {group.expected_members} members
              </span>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Pot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                GH₵ {parseFloat(group.total_group_savings).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This cycle total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                GH₵ {parseFloat(group.total_savings).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time in this group
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Next Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                {group.next_due
                  ? new Date(group.next_due).toLocaleDateString()
                  : '—'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cycle Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{progress}%</div>
              <div className="h-2 bg-muted rounded-full mt-4 overflow-hidden">
                <div
                  className="h-2 bg-cyan-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DESCRIPTION */}
        <Card>
          <CardHeader>
            <CardTitle>About this group</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            {group.description
              ? decodeHtmlEntities(group.description)
              : 'No description provided by the admin.'}
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4">
          {group.status === 'active' && (
            <Button
              onClick={() => setShowContributeConfirm(true)}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-lg py-6"
            >
              Make Contribution (GH₵{' '}
              {parseFloat(group.contribution_amount).toLocaleString()})
            </Button>
          )}
        </div>

        {/* CONTRIBUTE CONFIRMATION MODAL */}
        <Dialog
          open={showContributeConfirm}
          onOpenChange={setShowContributeConfirm}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Contribution</DialogTitle>
              <DialogDescription>
                You are about to contribute GH₵{' '}
                {parseFloat(group.contribution_amount).toLocaleString()} to the
                group. This action cannot be undone in the current cycle.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowContributeConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => contributeMutation.mutate()}
                disabled={contributeMutation.isPending}
                className="flex-1"
              >
                {contributeMutation.isPending
                  ? 'Processing...'
                  : 'Confirm & Contribute'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Toaster />
    </>
  );
}
