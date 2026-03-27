'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  Calendar,
  Loader2,
  Wallet,
  TrendingUp,
} from 'lucide-react';

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-muted-foreground text-sm md:text-base">
          Loading group details...
        </p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive text-sm">
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10 pb-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex-1" />

          <Badge
            className="uppercase tracking-wide"
            variant={group.status === 'active' ? 'default' : 'secondary'}
          >
            {group.status}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon */}

          <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Users className="h-10 w-10 text-white" />
          </div>

          {/* Group Info */}

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {group.group_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {group.admin_photo && (
                  <Image
                    src={group.admin_photo}
                    alt="Admin"
                    width={500}
                    height={500}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                )}
                <span>Admin: {group.admin_name}</span>
              </div>

              <span className="hidden md:inline">•</span>

              <span>
                {group.current_members} / {group.expected_members} members
              </span>
            </div>
          </div>
        </div>

        {/*  STATS GRID  */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* GROUP POT */}

          <Card className="border-muted shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Current Pot
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                GH₵ {parseFloat(group.total_group_savings).toLocaleString()}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Total contributions this cycle
              </p>
            </CardContent>
          </Card>

          {/* YOUR CONTRIBUTION */}

          <Card className="border-muted shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Your Contribution
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                GH₵ {parseFloat(group.total_savings).toLocaleString()}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Your savings in this group
              </p>
            </CardContent>
          </Card>

          {/* NEXT PAYOUT */}

          <Card className="border-muted shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Next Payout
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-semibold">
                {group.next_due
                  ? new Date(group.next_due).toLocaleDateString()
                  : '—'}
              </div>
            </CardContent>
          </Card>

          {/* PROGRESS */}

          <Card className="border-muted shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground">
                Cycle Progress
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">{progress}%</div>

              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-2 bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold">About this group</CardTitle>
          </CardHeader>

          <CardContent className="text-muted-foreground leading-relaxed">
            {group.description
              ? decodeHtmlEntities(group.description)
              : 'No description provided by the admin.'}
          </CardContent>
        </Card>

        {group.status === 'active' && (
          <div className="pt-4">
            <Button
              onClick={() => setShowContributeConfirm(true)}
              className="w-full md:w-auto text-lg px-8 py-6 bg-cyan-500 hover:bg-cyan-600 shadow-lg dark:text-white"
            >
              Contribute GH₵{' '}
              {parseFloat(group.contribution_amount).toLocaleString()}
            </Button>
          </div>
        )}

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
                group. This action cannot be undone in this cycle.
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
    </>
  );
}
