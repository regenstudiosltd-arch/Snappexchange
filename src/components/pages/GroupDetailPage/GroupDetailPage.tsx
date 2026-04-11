'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { authService } from '@/src/services/auth.service';
import { GroupDetailSkeleton } from './GroupDetailSkeleton';
import { GroupDetailError } from '@/src/components/ErrorStates';
import { HeroSection } from './sections/HeroSection';
import { StatsGrid } from './sections/StatsGrid';
import { CycleTransparencySection } from './sections/CycleTransparencySection';
import { ContributionTrackerSection } from './sections/ContributionTrackerSection';
import { MemberRosterSection } from './sections/MemberRosterSection';
import { InviteLinkModal } from '@/src/components/modals/InviteLinkModal/InviteLinkModal';
import { GroupDetail } from './types';
import { decodeHtmlEntities } from '@/src/lib/html';

// Helpers

function getContributeBlockReason(group: GroupDetail): string | null {
  if (group.status !== 'active') {
    return 'This group is not yet active.';
  }
  if (group.current_members < group.expected_members) {
    return `Waiting for ${group.expected_members - group.current_members} more member${
      group.expected_members - group.current_members !== 1 ? 's' : ''
    } before contributions open.`;
  }
  if (group.has_current_user_contributed) {
    return `You've already contributed for Cycle #${group.current_cycle_number}. Come back next cycle!`;
  }
  return null;
}

// Contribute confirmation dialog

interface ContributeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  amount: string;
  cycleNumber: number;
}

function ContributeDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  amount,
  cycleNumber,
}: ContributeDialogProps) {
  const formatted = parseFloat(amount).toLocaleString();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Contribution — Cycle #{cycleNumber}</DialogTitle>
          <DialogDescription>
            You are about to contribute{' '}
            <strong className="text-foreground">GH₵ {formatted}</strong> to the
            group for Cycle #{cycleNumber}. This action cannot be undone for
            this cycle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 bg-linear-to-r from-cyan-500 to-teal-600 text-white hover:opacity-90"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Contribute GH₵ ${formatted}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// CTA button

interface ContributeButtonProps {
  group: GroupDetail;
  blockReason: string | null;
  onClick: () => void;
}

function ContributeButton({
  group,
  blockReason,
  onClick,
}: ContributeButtonProps) {
  const formatted = parseFloat(group.contribution_amount).toLocaleString();

  if (group.has_current_user_contributed) {
    return (
      <div className="flex items-center justify-center w-full md:w-auto gap-2 px-5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Cycle #{group.current_cycle_number} contribution done — see you next
          cycle!
        </span>
      </div>
    );
  }

  if (blockReason) {
    return (
      <button
        disabled
        title={blockReason}
        className="flex items-center justify-center w-full md:w-auto h-12 px-8 rounded-xl font-semibold text-sm text-muted-foreground bg-muted border border-border/50 cursor-not-allowed gap-2 opacity-60"
      >
        <Lock className="h-4 w-4" />
        {group.current_members < group.expected_members
          ? `Waiting for members (${group.current_members}/${group.expected_members})`
          : 'Contributions not open yet'}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full md:w-auto h-12 px-8 rounded-xl font-semibold text-white bg-linear-to-r from-cyan-500 to-teal-600 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 text-sm"
    >
      Contribute GH₵ {formatted}
    </button>
  );
}

// Page

interface GroupDetailPageProps {
  groupId: string;
}

export function GroupDetailPage({ groupId }: GroupDetailPageProps) {
  const queryClient = useQueryClient();
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    data: group,
    isLoading,
    error,
  } = useQuery<GroupDetail>({
    queryKey: ['groupDetail', groupId],
    queryFn: () => authService.getGroupDetail(groupId) as Promise<GroupDetail>,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const contributeMutation = useMutation({
    mutationFn: () => authService.contributeToGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
      setShowContributeDialog(false);
      toast.success('Contribution recorded!', {
        description: 'Your contribution has been added to this cycle.',
      });
    },
    onError: (err: unknown) => {
      const response = (
        err as {
          response?: {
            data?: { error?: string; already_contributed?: boolean };
          };
        }
      )?.response;
      const data = response?.data;

      if (
        response &&
        'status' in response &&
        (response as { status?: number }).status === 409
      ) {
        setShowContributeDialog(false);
        queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
        toast.info('Already contributed', {
          description:
            data?.error ??
            'You have already contributed for this cycle. See you next cycle!',
        });
        return;
      }

      const msg =
        data?.error ?? 'Please check your wallet balance and try again.';
      toast.error('Contribution failed', { description: msg });
    },
  });

  if (isLoading) return <GroupDetailSkeleton />;
  if (error || !group) return <GroupDetailError />;

  const blockReason = getContributeBlockReason(group);

  const handleContributeClick = () => {
    if (blockReason) {
      toast.info('Not available', { description: blockReason });
      return;
    }
    setShowContributeDialog(true);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-32 md:pb-12 space-y-6">
      <HeroSection
        group={group}
        onInviteClick={() => setShowInviteModal(true)}
      />

      <StatsGrid group={group} />

      <CycleTransparencySection group={group} />

      <div className="grid lg:grid-cols-2 gap-6 lg:items-start">
        <ContributionTrackerSection group={group} />
        <MemberRosterSection group={group} />
      </div>

      {group.description && (
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6">
          <h2 className="font-semibold text-foreground mb-2.5">
            About this group
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {decodeHtmlEntities(group.description)}
          </p>
        </div>
      )}

      {group.status === 'active' && (
        <>
          {/* Mobile sticky bar */}
          <div className="fixed bottom-18 left-0 right-0 md:hidden px-4 z-10">
            <div
              className="flex items-center justify-center w-full rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-xl p-3"
              style={{ WebkitBackdropFilter: 'blur(20px)' }}
            >
              <ContributeButton
                group={group}
                blockReason={blockReason}
                onClick={handleContributeClick}
              />
            </div>
          </div>

          {/* Desktop inline */}
          <div className="hidden md:block pt-2">
            <ContributeButton
              group={group}
              blockReason={blockReason}
              onClick={handleContributeClick}
            />
          </div>
        </>
      )}

      <ContributeDialog
        isOpen={showContributeDialog}
        onOpenChange={setShowContributeDialog}
        onConfirm={() => contributeMutation.mutate()}
        isPending={contributeMutation.isPending}
        amount={group.contribution_amount}
        cycleNumber={group.current_cycle_number}
      />

      <InviteLinkModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={String(group.public_id ?? group.id)}
        groupName={group.group_name}
        isAdmin={group.is_current_user_admin}
      />
    </main>
  );
}
