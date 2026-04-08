'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

//  Skeletons
import { DashboardSkeleton } from '../dashboard/sections/DashboardSkeletons';
import { ActivitySkeleton } from '../dashboard/sections/RecentActivitySection/components/ActivitySkeleton';
import { ScheduledSkeleton } from '../dashboard/sections/ScheduledContributionSection/ScheduledSkeleton';

//  Section components
import { TotalSavingsCard } from '../dashboard/sections/TotalSavingsCard';
import { QuickActions } from '../dashboard/sections/QuickActions';

import { usePendingInvite } from '@/src/hooks/usePendingInvite';

const RecentActivity = dynamic(
  () =>
    import('../dashboard/sections/RecentActivitySection/RecentActivity').then(
      (m) => ({ default: m.RecentActivity }),
    ),
  { loading: () => <ActivitySkeleton /> },
);

const FinancialGoalsSection = dynamic(
  () =>
    import('../dashboard/sections/FinancialGoalsSection').then((m) => ({
      default: m.FinancialGoalsSection,
    })),
  { loading: () => <div className="h-40 rounded-xl bg-muted animate-pulse" /> },
);

const ScheduledContributions = dynamic(
  () =>
    import('../dashboard/sections/ScheduledContributionSection/ScheduledContributions').then(
      (m) => ({ default: m.ScheduledContributions }),
    ),
  { loading: () => <ScheduledSkeleton /> },
);

const WalletBalanceCard = dynamic(
  () =>
    import('../dashboard/sections/WalletBalanceCard').then((m) => ({
      default: m.WalletBalanceCard,
    })),
  { loading: () => <div className="h-40 rounded-xl bg-muted animate-pulse" /> },
);

const SavingsGroupsSection = dynamic(
  () =>
    import('../dashboard/sections/SavingsGroupsSection').then((m) => ({
      default: m.SavingsGroupsSection,
    })),
  { loading: () => <div className="h-40 rounded-xl bg-muted animate-pulse" /> },
);

//  Modals
const CreateGroupModal = dynamic(() =>
  import('../modals/CreateGroupModal/CreateGroupModal').then((m) => ({
    default: m.CreateGroupModal,
  })),
);

const JoinGroupModal = dynamic(() =>
  import('../modals/JoinGroupModal/JoinGroupModal').then((m) => ({
    default: m.JoinGroupModal,
  })),
);

const CashOutModal = dynamic(() =>
  import('@/src/components/modals/CashOutModal').then((m) => ({
    default: m.CashOutModal,
  })),
);

const TopUpWalletModal = dynamic(() =>
  import('@/src/components/modals/TopUpWalletModal').then((m) => ({
    default: m.TopUpWalletModal,
  })),
);

//  Services & types
import { authService } from '@/src/services/auth.service';
import type {
  DashboardResponse,
  GoalsDashboardResponse,
  DashboardHomeEnhancedProps,
  ScheduledContributionsCache,
} from '@/src/types/dashboard';

const STALE_TIME = 1000 * 60 * 5;

export function DashboardHomeEnhanced({
  onNavigate,
  onRefresh,
}: DashboardHomeEnhancedProps) {
  usePendingInvite();

  const queryClient = useQueryClient();

  //  UI state
  const [showBalance, setShowBalance] = useState(true);
  const [savingsExpanded, setSavingsExpanded] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  //  Data fetching
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useQuery<DashboardResponse>({
      queryKey: ['dashboard'],
      queryFn: authService.dashboard,
      staleTime: STALE_TIME,
    });

  const { data: goalsData, isLoading: isGoalsLoading } =
    useQuery<GoalsDashboardResponse>({
      queryKey: ['goals-dashboard'],
      queryFn: authService.goalsDashboard,
      staleTime: STALE_TIME,
    });

  //  Profile for cashout account details
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    staleTime: STALE_TIME,
  });

  //  Real wallet balance from scheduled-contributions query cache
  const scheduledCache = queryClient.getQueryData<ScheduledContributionsCache>([
    'scheduled-contributions',
  ]);
  const walletBalance = parseFloat(scheduledCache?.wallet_balance ?? '0');

  //  Derived values
  const totalSavings = useMemo(
    () =>
      dashboardData?.total_savings ? Number(dashboardData.total_savings) : 0,
    [dashboardData],
  );

  const growthText = useMemo(
    () => dashboardData?.growth_text || '+0.0% from last month',
    [dashboardData],
  );

  const groupSavings = useMemo(
    () =>
      (dashboardData?.joined_groups ?? []).reduce(
        (sum, g) => sum + Number(g.user_total_contribution || 0),
        0,
      ),
    [dashboardData],
  );

  const individualSavings = useMemo(
    () => (goalsData?.total_saved ? Number(goalsData.total_saved) : 0),
    [goalsData],
  );

  //  Payment handlers
  const handleTopUpComplete = (amount: number) => {
    queryClient.invalidateQueries({ queryKey: ['scheduled-contributions'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success(`₵${amount.toFixed(2)} added to your wallet!`);
    onRefresh?.();
  };

  const handleCashOutComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['scheduled-contributions'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  //  Payout account details for CashOutModal
  const payoutAccount = useMemo(
    () => ({
      provider: profile?.momo_provider
        ? profile.momo_provider.toUpperCase()
        : 'MoMo',
      number: profile?.momo_number ?? '—',
      name: profile?.momo_name ?? profile?.full_name ?? '—',
    }),
    [profile],
  );

  if (isDashboardLoading || isGoalsLoading) {
    return <DashboardSkeleton />;
  }

  //  Render
  return (
    <div className="space-y-6 mb-18 md:mb-0">
      <TotalSavingsCard
        totalSavings={totalSavings}
        growthText={growthText}
        individualSavings={individualSavings}
        groupSavings={groupSavings}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance((p) => !p)}
        onCashOut={() => setIsCashOutOpen(true)}
        savingsExpanded={savingsExpanded}
        onToggleExpanded={() => setSavingsExpanded((p) => !p)}
      />

      <QuickActions
        onNavigate={onNavigate}
        setIsCreateGroupOpen={setIsCreateGroupOpen}
        setIsJoinGroupOpen={setIsJoinGroupOpen}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />
        <RecentActivity onNavigate={onNavigate} />
      </div>

      <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        <ScheduledContributions onNavigate={onNavigate} />
        <WalletBalanceCard
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance((p) => !p)}
          onTopUp={() => setIsTopUpOpen(true)}
        />
      </div>

      {/*  Modals  */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onComplete={(groupData) => console.log('Group created:', groupData)}
      />
      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
      />

      <CashOutModal
        isOpen={isCashOutOpen}
        onClose={() => setIsCashOutOpen(false)}
        availableBalance={walletBalance}
        payoutAccount={payoutAccount}
        onComplete={handleCashOutComplete}
      />

      <TopUpWalletModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onComplete={handleTopUpComplete}
        currentBalance={walletBalance}
      />
    </div>
  );
}
