'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  ArrowLeft,
  Users,
  Calendar,
  Loader2,
  Wallet,
  TrendingUp,
  Share2,
} from 'lucide-react';

// UI Components
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { toast } from 'sonner';

// Services & Libs
import { authService } from '@/src/services/auth.service';
import { decodeHtmlEntities } from '@/src/lib/html';
import { InviteLinkModal } from '../modals/InviteLinkModal/InviteLinkModal';
import { GroupDetailError } from '../ErrorStates';

// --- Types ---
interface GroupDetail {
  id: number;
  public_id: string;
  group_name: string;
  description: string;
  contribution_amount: string;
  frequency: string;
  current_members: number;
  expected_members: number;
  total_group_savings: string;
  total_savings: string;
  next_due: string | null;
  status: 'active' | 'inactive' | string;
  admin_name: string;
  admin_photo?: string;
  is_current_user_admin: boolean;
}

// --- Pure Helpers ---
const formatCurrency = (amount: string | number): string => {
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(parsed) ? '0' : parsed.toLocaleString();
};

const calculateProgress = (group: GroupDetail): number => {
  if (group.expected_members <= 0) return 0;
  const target = parseFloat(group.contribution_amount) * group.expected_members;
  if (target === 0) return 0;
  const current = parseFloat(group.total_group_savings);
  return Math.min(Math.round((current / target) * 100), 100);
};

// --- Skeleton Components ---

function StatCardSkeleton({
  hasProgressBar = false,
}: {
  hasProgressBar?: boolean;
}) {
  return (
    <Card className="border-muted shadow-sm animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-3.5 w-24 rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-8 w-36 rounded bg-muted" />
        {hasProgressBar ? (
          <div className="mt-4 h-2 w-full rounded-full bg-muted" />
        ) : (
          <div className="h-3 w-28 rounded bg-muted" />
        )}
      </CardContent>
    </Card>
  );
}

function GroupDetailPageSkeleton() {
  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10 pb-20">
      <nav className="flex items-center gap-3 animate-pulse">
        <div className="h-9 w-20 rounded-md bg-muted" />
        <div className="flex-1" />
        <div className="h-9 w-28 rounded-md bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </nav>
      <header className="flex flex-col md:flex-row md:items-center gap-6 animate-pulse">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-9 w-64 rounded-lg bg-muted" />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-muted" />
              <div className="h-3.5 w-32 rounded bg-muted" />
            </div>
            <div className="h-3.5 w-24 rounded bg-muted" />
          </div>
        </div>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton hasProgressBar />
      </section>
      <Card className="border-muted shadow-sm animate-pulse">
        <CardHeader>
          <div className="h-5 w-32 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-3.5 w-full rounded bg-muted" />
          <div className="h-3.5 w-5/6 rounded bg-muted" />
          <div className="h-3.5 w-3/4 rounded bg-muted" />
        </CardContent>
      </Card>
      <div className="pt-4 animate-pulse">
        <div className="h-14 w-full md:w-64 rounded-md bg-muted" />
      </div>
    </main>
  );
}

// --- Internal Sub-Components ---

function StatCard({
  title,
  icon: Icon,
  value,
  subtext,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  value?: React.ReactNode;
  subtext?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-muted shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {value && (
          <div className="text-2xl lg:text-3xl font-bold truncate">{value}</div>
        )}
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function ContributeDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  amount,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  amount: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Contribution</DialogTitle>
          <DialogDescription>
            You are about to contribute{' '}
            <strong>GH₵ {formatCurrency(amount)}</strong> to the group. This
            action cannot be undone in this cycle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
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
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Confirm & Contribute'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---

export function GroupDetailPage({ groupId }: { groupId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showContributeConfirm, setShowContributeConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  if (isLoading) return <GroupDetailPageSkeleton />;

  if (error || !group) return <GroupDetailError />;

  const cycleProgress = calculateProgress(group);
  const isFull = group.current_members >= group.expected_members;
  const formattedNextDue = group.next_due
    ? new Date(group.next_due).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10 pb-20">
      {/* Navigation & Status */}
      <nav className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1" />

        {/* ── INVITE BUTTON (nav bar) ── */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowInviteModal(true)}
                  disabled={isFull}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Invite</span>
                </Button>
              </span>
            </TooltipTrigger>
            {isFull && (
              <TooltipContent>
                <p>Group already full</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <Badge
          className="uppercase tracking-wide"
          variant={group.status === 'active' ? 'default' : 'secondary'}
        >
          {group.status}
        </Badge>
      </nav>

      {/* Hero Header */}
      <header className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg text-white">
          <Users className="h-10 w-10" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight truncate">
            {group.group_name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {group.admin_photo && (
                <Image
                  src={group.admin_photo}
                  alt={group.admin_name}
                  width={28}
                  height={28}
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
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Current Pot"
          icon={Wallet}
          value={`GH₵ ${formatCurrency(group.total_group_savings)}`}
          subtext="Total contributions this cycle"
        />
        <StatCard
          title="Your Contribution"
          icon={TrendingUp}
          value={`GH₵ ${formatCurrency(group.total_savings)}`}
          subtext="Your savings in this group"
        />
        <StatCard
          title="Next Payout"
          icon={Calendar}
          value={formattedNextDue}
        />
        <StatCard title="Cycle Progress">
          <div className="text-3xl font-bold">{cycleProgress}%</div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
        </StatCard>
      </section>

      {/* Description Card */}
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

      {/* Action Footer */}
      {group.status === 'active' && (
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowContributeConfirm(true)}
            className="flex-1 sm:flex-none text-lg px-8 py-6 bg-cyan-500 hover:bg-cyan-600 shadow-lg text-white"
          >
            Contribute GH₵ {formatCurrency(group.contribution_amount)}
          </Button>

          {/* ── INVITE BUTTON (mobile, action footer) ── */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="sm:hidden">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-cyan-500/40 text-cyan-600 hover:bg-cyan-500/10 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowInviteModal(true)}
                    disabled={isFull}
                  >
                    <Share2 className="h-5 w-5" />
                    Invite members
                  </Button>
                </span>
              </TooltipTrigger>
              {isFull && (
                <TooltipContent>
                  <p>Group already full</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Modals */}
      <ContributeDialog
        isOpen={showContributeConfirm}
        onOpenChange={setShowContributeConfirm}
        onConfirm={() => contributeMutation.mutate()}
        isPending={contributeMutation.isPending}
        amount={group.contribution_amount}
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
