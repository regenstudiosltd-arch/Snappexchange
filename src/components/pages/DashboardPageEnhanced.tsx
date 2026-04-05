'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// ── Skeletons
import { DashboardSkeleton } from '../dashboard/sections/DashboardSkeletons';
import { ActivitySkeleton } from '../dashboard/sections/RecentActivitySection/components/ActivitySkeleton';
import { ScheduledSkeleton } from '../dashboard/sections/ScheduledContributionSection/ScheduledSkeleton';

// ── Section components
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

// ── Modals
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

// ── Services & types
import { authService } from '@/src/services/auth.service';
import type {
  DashboardResponse,
  GoalsDashboardResponse,
  DashboardHomeEnhancedProps,
} from '@/src/types/dashboard';

const STALE_TIME = 1000 * 60 * 5;

export function DashboardHomeEnhanced({
  onNavigate,
}: DashboardHomeEnhancedProps) {
  // ── Process any pending invite from sessionStorage.
  //    If found: auto-joins the group and redirects to its detail page.
  //    This hook is a no-op when there is no pending invite.
  usePendingInvite();

  // ── UI state
  const [showBalance, setShowBalance] = useState(true);
  const [savingsExpanded, setSavingsExpanded] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // ── Data fetching
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

  // ── Derived values
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

  // ── Handlers
  const toggleBalance = () => setShowBalance((prev) => !prev);
  const toggleSavingsExpanded = () => setSavingsExpanded((prev) => !prev);

  const handleTopUpComplete: (amount: number, method: string) => void = () => {
    // Side-effect handler; extend with toast/refetch as needed
  };

  // ── Early return: loading
  if (isDashboardLoading || isGoalsLoading) {
    return <DashboardSkeleton />;
  }

  // ── Render
  return (
    <div className="space-y-6 mb-18 md:mb-0">
      {/* Hero savings card */}
      <TotalSavingsCard
        totalSavings={totalSavings}
        growthText={growthText}
        individualSavings={individualSavings}
        groupSavings={groupSavings}
        showBalance={showBalance}
        onToggleBalance={toggleBalance}
        onCashOut={() => setIsCashOutOpen(true)}
        savingsExpanded={savingsExpanded}
        onToggleExpanded={toggleSavingsExpanded}
      />

      {/* Quick actions row */}
      <QuickActions
        onNavigate={onNavigate}
        setIsCreateGroupOpen={setIsCreateGroupOpen}
        setIsJoinGroupOpen={setIsJoinGroupOpen}
      />

      {/* Groups + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />
        <RecentActivity onNavigate={onNavigate} />
      </div>

      {/* Financial goals */}
      <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

      {/* Scheduled contributions + Wallet balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        <ScheduledContributions onNavigate={onNavigate} />
        <WalletBalanceCard
          showBalance={showBalance}
          onToggleBalance={toggleBalance}
          onTopUp={() => setIsTopUpOpen(true)}
        />
      </div>

      {/* ── Modals ── */}
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
        availableBalance={totalSavings}
        payoutAccount={{
          provider: 'MTN Momo',
          number: '024 XXX XXXX',
          name: 'James Daniel',
        }}
      />
      <TopUpWalletModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onComplete={handleTopUpComplete}
        currentBalance={0}
      />
    </div>
  );
}

// // src/components/pages/DashboardPageEnhanced.tsx

// 'use client';

// import dynamic from 'next/dynamic';
// import { useState, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';

// // ── Skeletons
// import { DashboardSkeleton } from '../dashboard/sections/DashboardSkeletons';
// import { ActivitySkeleton } from '../dashboard/sections/RecentActivitySection/components/ActivitySkeleton';
// import { ScheduledSkeleton } from '../dashboard/sections/ScheduledContributionSection/ScheduledSkeleton';

// // ── Section components
// import { TotalSavingsCard } from '../dashboard/sections/TotalSavingsCard';
// import { QuickActions } from '../dashboard/sections/QuickActions';

// const RecentActivity = dynamic(
//   () =>
//     import('../dashboard/sections/RecentActivitySection/RecentActivity').then(
//       (m) => ({ default: m.RecentActivity }),
//     ),
//   { loading: () => <ActivitySkeleton /> },
// );

// const FinancialGoalsSection = dynamic(
//   () =>
//     import('../dashboard/sections/FinancialGoalsSection').then((m) => ({
//       default: m.FinancialGoalsSection,
//     })),
//   { loading: () => <div className="h-40 rounded-xl bg-muted animate-pulse" /> },
// );

// const ScheduledContributions = dynamic(
//   () =>
//     import('../dashboard/sections/ScheduledContributionSection/ScheduledContributions').then(
//       (m) => ({ default: m.ScheduledContributions }),
//     ),
//   { loading: () => <ScheduledSkeleton /> },
// );

// const WalletBalanceCard = dynamic(
//   () =>
//     import('../dashboard/sections/WalletBalanceCard').then((m) => ({
//       default: m.WalletBalanceCard,
//     })),
//   { loading: () => <div className="h-40 rounded-xl bg-muted animate-pulse" /> },
// );

// const SavingsGroupsSection = dynamic(
//   () =>
//     import('../dashboard/sections/SavingsGroupsSection').then((m) => ({
//       default: m.SavingsGroupsSection,
//     })),
//   { loading: () => <div className="h-40 rounded-xl bg-muted animate-pulse" /> },
// );

// // ── Modals
// const CreateGroupModal = dynamic(() =>
//   import('../modals/CreateGroupModal/CreateGroupModal').then((m) => ({
//     default: m.CreateGroupModal,
//   })),
// );

// const JoinGroupModal = dynamic(() =>
//   import('../modals/JoinGroupModal/JoinGroupModal').then((m) => ({
//     default: m.JoinGroupModal,
//   })),
// );

// const CashOutModal = dynamic(() =>
//   import('@/src/components/modals/CashOutModal').then((m) => ({
//     default: m.CashOutModal,
//   })),
// );

// const TopUpWalletModal = dynamic(() =>
//   import('@/src/components/modals/TopUpWalletModal').then((m) => ({
//     default: m.TopUpWalletModal,
//   })),
// );

// // ── Services & types
// import { authService } from '@/src/services/auth.service';
// import type {
//   DashboardResponse,
//   GoalsDashboardResponse,
//   DashboardHomeEnhancedProps,
// } from '@/src/types/dashboard';

// const STALE_TIME = 1000 * 60 * 5;

// export function DashboardHomeEnhanced({
//   onNavigate,
// }: DashboardHomeEnhancedProps) {
//   // ── UI state
//   const [showBalance, setShowBalance] = useState(true);
//   const [savingsExpanded, setSavingsExpanded] = useState(false);
//   const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
//   const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
//   const [isCashOutOpen, setIsCashOutOpen] = useState(false);
//   const [isTopUpOpen, setIsTopUpOpen] = useState(false);

//   // ── Data fetching
//   const { data: dashboardData, isLoading: isDashboardLoading } =
//     useQuery<DashboardResponse>({
//       queryKey: ['dashboard'],
//       queryFn: authService.dashboard,
//       staleTime: STALE_TIME,
//     });

//   const { data: goalsData, isLoading: isGoalsLoading } =
//     useQuery<GoalsDashboardResponse>({
//       queryKey: ['goals-dashboard'],
//       queryFn: authService.goalsDashboard,
//       staleTime: STALE_TIME,
//     });

//   // ── Derived values
//   const totalSavings = useMemo(
//     () =>
//       dashboardData?.total_savings ? Number(dashboardData.total_savings) : 0,
//     [dashboardData],
//   );

//   const growthText = useMemo(
//     () => dashboardData?.growth_text || '+0.0% from last month',
//     [dashboardData],
//   );

//   const groupSavings = useMemo(
//     () =>
//       (dashboardData?.joined_groups ?? []).reduce(
//         (sum, g) => sum + Number(g.user_total_contribution || 0),
//         0,
//       ),
//     [dashboardData],
//   );

//   const individualSavings = useMemo(
//     () => (goalsData?.total_saved ? Number(goalsData.total_saved) : 0),
//     [goalsData],
//   );

//   // ── Handlers
//   const toggleBalance = () => setShowBalance((prev) => !prev);
//   const toggleSavingsExpanded = () => setSavingsExpanded((prev) => !prev);

//   const handleTopUpComplete: (amount: number, method: string) => void = () => {
//     // Side-effect handler; extend with toast/refetch as needed
//   };

//   // ── Early return: loading
//   if (isDashboardLoading || isGoalsLoading) {
//     return <DashboardSkeleton />;
//   }

//   // ── Render
//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       {/* Hero savings card */}
//       <TotalSavingsCard
//         totalSavings={totalSavings}
//         growthText={growthText}
//         individualSavings={individualSavings}
//         groupSavings={groupSavings}
//         showBalance={showBalance}
//         onToggleBalance={toggleBalance}
//         onCashOut={() => setIsCashOutOpen(true)}
//         savingsExpanded={savingsExpanded}
//         onToggleExpanded={toggleSavingsExpanded}
//       />

//       {/* Quick actions row */}
//       <QuickActions
//         onNavigate={onNavigate}
//         setIsCreateGroupOpen={setIsCreateGroupOpen}
//         setIsJoinGroupOpen={setIsJoinGroupOpen}
//       />

//       {/* Groups + Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />
//         <RecentActivity onNavigate={onNavigate} />
//       </div>

//       {/* Financial goals */}
//       <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

//       {/* Scheduled contributions + Wallet balance */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
//         <ScheduledContributions onNavigate={onNavigate} />
//         <WalletBalanceCard
//           showBalance={showBalance}
//           onToggleBalance={toggleBalance}
//           onTopUp={() => setIsTopUpOpen(true)}
//         />
//       </div>

//       {/* ── Modals ── */}
//       <CreateGroupModal
//         isOpen={isCreateGroupOpen}
//         onClose={() => setIsCreateGroupOpen(false)}
//         onComplete={(groupData) => console.log('Group created:', groupData)}
//       />
//       <JoinGroupModal
//         isOpen={isJoinGroupOpen}
//         onClose={() => setIsJoinGroupOpen(false)}
//       />
//       <CashOutModal
//         isOpen={isCashOutOpen}
//         onClose={() => setIsCashOutOpen(false)}
//         availableBalance={totalSavings}
//         payoutAccount={{
//           provider: 'MTN Momo',
//           number: '024 XXX XXXX',
//           name: 'James Daniel',
//         }}
//       />
//       <TopUpWalletModal
//         isOpen={isTopUpOpen}
//         onClose={() => setIsTopUpOpen(false)}
//         onComplete={handleTopUpComplete}
//         currentBalance={0}
//       />
//     </div>
//   );
// }

// // src/components/pages/dashboard/DashboardHomeEnhanced.tsx

// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';

// // ── Skeletons ──────────────────────────────────────────────────────────────────
// import { DashboardSkeleton } from '../dashboard/skeletons';

// // ── Section components ─────────────────────────────────────────────────────────
// import {
//   TotalSavingsCard,
//   QuickActions,
//   SavingsGroupsSection,
//   FinancialGoalsSection,
//   WalletBalanceCard,
// } from '../dashboard/sections';

// // ── Live functional components ─────────────────────────────────────────────────
// import { RecentActivity } from '../dashboard/sections/RecentActivitySection';
// import { ScheduledContributions } from '@/src/components/Scheduledcontributions';

// // ── Modals ─────────────────────────────────────────────────────────────────────
// import { CreateGroupModal } from '@/src/components/modals/CreateGroupModal';
// import { CashOutModal } from '@/src/components/modals/CashOutModal';
// import { JoinGroupModal } from '@/src/components/modals/JoinGroupModal';
// import { TopUpWalletModal } from '@/src/components/modals/TopUpWalletModal';

// // ── Services & types ───────────────────────────────────────────────────────────
// import { authService } from '@/src/services/auth.service';
// import type {
//   DashboardResponse,
//   GoalsDashboardResponse,
//   DashboardHomeEnhancedProps,
// } from '../dashboard/types';

// const STALE_TIME = 1000 * 60 * 5;

// export function DashboardHomeEnhanced({
//   onNavigate,
// }: DashboardHomeEnhancedProps) {
//   // ── UI state ─────────────────────────────────────────────────────────────────
//   const [showBalance, setShowBalance] = useState(true);
//   const [savingsExpanded, setSavingsExpanded] = useState(false);
//   const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
//   const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
//   const [isCashOutOpen, setIsCashOutOpen] = useState(false);
//   const [isTopUpOpen, setIsTopUpOpen] = useState(false);

//   // ── Data fetching ─────────────────────────────────────────────────────────────
//   const { data: dashboardData, isLoading: isDashboardLoading } =
//     useQuery<DashboardResponse>({
//       queryKey: ['dashboard'],
//       queryFn: authService.dashboard,
//       staleTime: STALE_TIME,
//     });

//   const { data: goalsData, isLoading: isGoalsLoading } =
//     useQuery<GoalsDashboardResponse>({
//       queryKey: ['goals-dashboard'],
//       queryFn: authService.goalsDashboard,
//       staleTime: STALE_TIME,
//     });

//   // ── Derived values ────────────────────────────────────────────────────────────
//   const totalSavings = useMemo(
//     () =>
//       dashboardData?.total_savings ? Number(dashboardData.total_savings) : 0,
//     [dashboardData],
//   );

//   const growthText = useMemo(
//     () => dashboardData?.growth_text || '+0.0% from last month',
//     [dashboardData],
//   );

//   const groupSavings = useMemo(
//     () =>
//       (dashboardData?.joined_groups ?? []).reduce(
//         (sum, g) => sum + Number(g.user_total_contribution || 0),
//         0,
//       ),
//     [dashboardData],
//   );

//   const individualSavings = useMemo(
//     () => (goalsData?.total_saved ? Number(goalsData.total_saved) : 0),
//     [goalsData],
//   );

//   // ── Handlers ──────────────────────────────────────────────────────────────────
//   const toggleBalance = () => setShowBalance((prev) => !prev);
//   const toggleSavingsExpanded = () => setSavingsExpanded((prev) => !prev);

//   const handleTopUpComplete = (_amount: number, _method: string) => {
//     // Side-effect handler; extend with toast/refetch as needed
//   };

//   // ── Early return: loading ─────────────────────────────────────────────────────
//   if (isDashboardLoading || isGoalsLoading) {
//     return <DashboardSkeleton />;
//   }

//   // ── Render ────────────────────────────────────────────────────────────────────
//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       {/* Hero savings card */}
//       <TotalSavingsCard
//         totalSavings={totalSavings}
//         growthText={growthText}
//         individualSavings={individualSavings}
//         groupSavings={groupSavings}
//         showBalance={showBalance}
//         onToggleBalance={toggleBalance}
//         onCashOut={() => setIsCashOutOpen(true)}
//         savingsExpanded={savingsExpanded}
//         onToggleExpanded={toggleSavingsExpanded}
//       />

//       {/* Quick actions row */}
//       <QuickActions
//         onNavigate={onNavigate}
//         setIsCreateGroupOpen={setIsCreateGroupOpen}
//         setIsJoinGroupOpen={setIsJoinGroupOpen}
//       />

//       {/* Groups + Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />
//         <RecentActivity onNavigate={onNavigate} />
//       </div>

//       {/* Financial goals */}
//       <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

//       {/* Scheduled contributions + Wallet balance */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
//         <ScheduledContributions onNavigate={onNavigate} />
//         <WalletBalanceCard
//           showBalance={showBalance}
//           onToggleBalance={toggleBalance}
//           onTopUp={() => setIsTopUpOpen(true)}
//         />
//       </div>

//       {/* ── Modals ── */}
//       <CreateGroupModal
//         isOpen={isCreateGroupOpen}
//         onClose={() => setIsCreateGroupOpen(false)}
//         onComplete={(groupData) => console.log('Group created:', groupData)}
//       />
//       <JoinGroupModal
//         isOpen={isJoinGroupOpen}
//         onClose={() => setIsJoinGroupOpen(false)}
//       />
//       <CashOutModal
//         isOpen={isCashOutOpen}
//         onClose={() => setIsCashOutOpen(false)}
//         availableBalance={totalSavings}
//         payoutAccount={{
//           provider: 'MTN Momo',
//           number: '024 XXX XXXX',
//           name: 'James Daniel',
//         }}
//       />
//       <TopUpWalletModal
//         isOpen={isTopUpOpen}
//         onClose={() => setIsTopUpOpen(false)}
//         onComplete={handleTopUpComplete}
//         currentBalance={0}
//       />
//     </div>
//   );
// }

// // src/components/pages/DashboardHomeEnhanced.tsx

// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import {
//   TrendingUp,
//   Users,
//   PlusCircle,
//   Target,
//   Bot,
//   Lightbulb,
//   Eye,
//   EyeOff,
//   DollarSign,
//   Wallet,
//   CheckCircle2,
//   AlertCircle,
// } from 'lucide-react';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Progress } from '../ui/progress';
// import { Skeleton } from '../ui/skeleton';

// import { CreateGroupModal } from '../modals/CreateGroupModal';
// import { CashOutModal } from '../modals/CashOutModal';
// import { JoinGroupModal } from '../modals/JoinGroupModal';
// import { TopUpWalletModal } from '../modals/TopUpWalletModal';

// // ── Real functional components (live data)
// import { RecentActivity } from '../Recentactivity';
// import { ScheduledContributions } from '../Scheduledcontributions';

// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface DashboardResponse {
//   total_savings: string | number;
//   growth_text: string;
//   joined_groups: Array<{
//     id: number;
//     group_name: string;
//     current_members: number;
//     next_payout_days: number | null;
//     user_total_contribution: string | number;
//     total_saved: string | number;
//     progress_percentage: number;
//     contribution_amount: string | number;
//     frequency: string;
//   }>;
// }

// interface GoalsDashboardResponse {
//   total_saved: string | number;
//   goals: Array<{
//     id: number;
//     name: string;
//     target_amount: string | number;
//     current_saved: string | number;
//     progress_percentage: number;
//   }>;
// }

// interface DashboardHomeEnhancedProps {
//   onNavigate: (page: string, params?: Record<string, string>) => void;
// }

// // ─── Skeletons ────────────────────────────────────────────────────────────────

// function TotalSavingsCardSkeleton() {
//   return (
//     <div className="rounded-2xl bg-linear-to-br from-cyan-500/30 to-teal-600/30 p-6 space-y-5 animate-pulse">
//       <div className="flex items-center justify-between">
//         <Skeleton className="h-5 w-28 rounded bg-white/30" />
//         <Skeleton className="h-9 w-9 rounded-md bg-white/30" />
//       </div>
//       <Skeleton className="h-10 w-44 rounded bg-white/30" />
//       <div className="flex items-center gap-2">
//         <Skeleton className="h-4 w-4 rounded-full bg-white/30" />
//         <Skeleton className="h-4 w-40 rounded bg-white/30" />
//       </div>
//       <div className="border-t border-white/20 pt-4 flex gap-2">
//         <Skeleton className="h-10 flex-1 rounded-md bg-white/30" />
//         <Skeleton className="h-10 flex-1 rounded-md bg-white/30" />
//       </div>
//     </div>
//   );
// }

// function QuickActionsSkeleton() {
//   return (
//     <div className="space-y-4 animate-pulse">
//       <Skeleton className="h-7 w-40 rounded" />
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <div
//             key={i}
//             className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card"
//           >
//             <Skeleton className="w-14 h-14 rounded-full" />
//             <Skeleton className="h-4 w-20 rounded" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function SavingsGroupCardSkeleton() {
//   return (
//     <Card className="bg-card border-border animate-pulse">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="space-y-1.5">
//             <Skeleton className="h-5 w-36 rounded" />
//             <Skeleton className="h-4 w-20 rounded" />
//           </div>
//           <div className="text-right space-y-1.5">
//             <Skeleton className="h-4 w-20 rounded" />
//             <Skeleton className="h-5 w-24 rounded" />
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-5">
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <Skeleton className="h-4 w-14 rounded" />
//             <Skeleton className="h-4 w-10 rounded" />
//           </div>
//           <Skeleton className="h-2 w-full rounded-full" />
//         </div>
//         <div className="grid grid-cols-2 gap-6">
//           <div className="space-y-1.5">
//             <Skeleton className="h-4 w-28 rounded" />
//             <Skeleton className="h-5 w-16 rounded" />
//           </div>
//           <div className="space-y-1.5">
//             <Skeleton className="h-4 w-20 rounded" />
//             <Skeleton className="h-5 w-16 rounded" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function FinancialGoalsSectionSkeleton() {
//   return (
//     <Card className="bg-card border-border animate-pulse">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <div className="space-y-1.5">
//             <Skeleton className="h-5 w-36 rounded" />
//             <Skeleton className="h-4 w-52 rounded" />
//           </div>
//           <Skeleton className="h-9 w-24 rounded-md" />
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div
//               key={i}
//               className="p-5 rounded-lg border border-border space-y-3"
//             >
//               <div className="flex items-center justify-between">
//                 <Skeleton className="h-4 w-24 rounded" />
//                 <Skeleton className="h-3 w-8 rounded" />
//               </div>
//               <Skeleton className="h-2 w-full rounded-full" />
//               <Skeleton className="h-3 w-32 rounded" />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function DashboardSkeleton() {
//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       <TotalSavingsCardSkeleton />
//       <QuickActionsSkeleton />
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-4">
//           <Skeleton className="h-7 w-48 rounded" />
//           <SavingsGroupCardSkeleton />
//           <SavingsGroupCardSkeleton />
//         </div>
//         {/* RecentActivity has its own skeleton */}
//         <div className="space-y-4 animate-pulse">
//           <Skeleton className="h-7 w-36 rounded" />
//           <Skeleton className="h-64 w-full rounded-xl" />
//         </div>
//       </div>
//       <FinancialGoalsSectionSkeleton />
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Skeleton className="h-80 w-full rounded-xl" />
//         <Skeleton className="h-80 w-full rounded-xl" />
//       </div>
//     </div>
//   );
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function TotalSavingsCard({
//   totalSavings,
//   growthText,
//   individualSavings,
//   groupSavings,
//   showBalance,
//   onToggleBalance,
//   onCashOut,
//   savingsExpanded,
//   onToggleExpanded,
// }: {
//   totalSavings: number;
//   growthText: string;
//   individualSavings: number;
//   groupSavings: number;
//   showBalance: boolean;
//   onToggleBalance: () => void;
//   onCashOut: () => void;
//   savingsExpanded: boolean;
//   onToggleExpanded: () => void;
// }) {
//   return (
//     <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-[16px] md:text-[20px] font-medium">
//             Total Savings
//           </CardTitle>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="text-white hover:bg-white/20"
//             onClick={onToggleBalance}
//             aria-label={showBalance ? 'Hide balance' : 'Show balance'}
//           >
//             {showBalance ? (
//               <Eye className="h-5 w-5" />
//             ) : (
//               <EyeOff className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-4xl mb-2">
//               {showBalance ? `₵${totalSavings.toFixed(2)}` : '₵•••••'}
//             </div>
//             <div className="flex items-center gap-2 text-white/90">
//               <TrendingUp className="h-4 w-4" />
//               <span className="text-sm">{growthText}</span>
//             </div>
//           </div>

//           {savingsExpanded && (
//             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 animate-in slide-in-from-top">
//               <div>
//                 <div className="text-sm text-white/80 mb-1">Individual</div>
//                 <div className="text-xl">₵{individualSavings.toFixed(2)}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-white/80 mb-1">Groups</div>
//                 <div className="text-xl">₵{groupSavings.toFixed(2)}</div>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2 pt-4 border-t border-white/20">
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//               onClick={onToggleExpanded}
//             >
//               {savingsExpanded ? 'Hide' : 'Show'} Details
//             </Button>
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//               onClick={onCashOut}
//             >
//               <DollarSign className="h-4 w-4 mr-2" />
//               Cash Out
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function QuickActions({
//   onNavigate,
//   setIsCreateGroupOpen,
//   setIsJoinGroupOpen,
// }: {
//   onNavigate: (page: string) => void;
//   setIsCreateGroupOpen: (open: boolean) => void;
//   setIsJoinGroupOpen: (open: boolean) => void;
// }) {
//   const actions = useMemo(
//     () => [
//       {
//         icon: PlusCircle,
//         label: 'Create Group',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => setIsCreateGroupOpen(true),
//       },
//       {
//         icon: Users,
//         label: 'Join Group',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => setIsJoinGroupOpen(true),
//       },
//       {
//         icon: Lightbulb,
//         label: 'AI Tips',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => onNavigate('AI Assistant'),
//       },
//       {
//         icon: Bot,
//         label: 'Chat Bot',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => onNavigate('Bot Integration'),
//       },
//     ],
//     [onNavigate, setIsCreateGroupOpen, setIsJoinGroupOpen],
//   );

//   return (
//     <div>
//       <h3 className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
//         Quick Actions
//       </h3>
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {actions.map((action, index) => {
//           const Icon = action.icon;
//           return (
//             <button
//               key={index}
//               onClick={action.onClick}
//               className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md group bg-card"
//               aria-label={action.label}
//             >
//               <div
//                 className={cn(
//                   'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
//                   action.bgColor,
//                 )}
//               >
//                 <Icon className={cn('h-7 w-7', action.color)} />
//               </div>
//               <span className="text-sm text-center font-medium text-foreground">
//                 {action.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function SavingsGroupsSection({
//   groups,
// }: {
//   groups: DashboardResponse['joined_groups'];
// }) {
//   const savingsGroups = useMemo(
//     () =>
//       groups.map((g) => ({
//         name: g.group_name,
//         members: g.current_members,
//         totalSaved: Number(g.total_saved),
//         yourContribution: Number(g.user_total_contribution),
//         nextPayout: `${g.next_payout_days ?? 0} days`,
//         progress: g.progress_percentage,
//       })),
//     [groups],
//   );

//   return (
//     <div className="lg:col-span-2 space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//           Your Savings Groups
//         </h3>
//         {savingsGroups.length > 0 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="text-primary hover:text-primary/90"
//           >
//             View All
//           </Button>
//         )}
//       </div>

//       {savingsGroups.length > 0 ? (
//         savingsGroups.map((group, index) => (
//           <Card
//             key={index}
//             className="hover:shadow-md transition-shadow bg-card border-border"
//           >
//             <CardHeader className="pb-3">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <CardTitle className="text-lg font-medium text-foreground">
//                     {group.name}
//                   </CardTitle>
//                   <CardDescription>{group.members} members</CardDescription>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-sm text-muted-foreground">
//                     Total Saved
//                   </div>
//                   <div className="text-lg font-semibold text-foreground">
//                     ₵{group.totalSaved.toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-5">
//               <div>
//                 <div className="flex items-center justify-between text-sm mb-2">
//                   <span className="text-muted-foreground">Progress</span>
//                   <span className="font-medium">{group.progress}%</span>
//                 </div>
//                 <Progress
//                   value={group.progress}
//                   className="h-2 dark:bg-gray-500"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-6 text-sm">
//                 <div>
//                   <div className="text-muted-foreground mb-1">
//                     Your Contribution
//                   </div>
//                   <div className="font-medium text-foreground">
//                     ₵{group.yourContribution.toLocaleString()}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-muted-foreground mb-1">Next Payout</div>
//                   <div className="text-primary font-medium">
//                     {group.nextPayout}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))
//       ) : (
//         <Card className="border-dashed border-2 bg-muted/10">
//           <CardContent className="flex flex-col items-center justify-center py-12 text-center">
//             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
//               <Users className="h-8 w-8 text-primary" />
//             </div>
//             <h4 className="text-lg font-semibold text-foreground">
//               No groups yet
//             </h4>
//             <p className="text-sm text-muted-foreground max-w-70 mb-6">
//               Join a savings circle or create your own to start saving with
//               others.
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// function FinancialGoalsSection({
//   goalsData,
//   onNavigate,
// }: {
//   goalsData: GoalsDashboardResponse | undefined;
//   onNavigate: (page: string) => void;
// }) {
//   const goals = useMemo(
//     () =>
//       (goalsData?.goals ?? []).map((g) => ({
//         name: g.name,
//         target: Number(g.target_amount),
//         saved: Number(g.current_saved),
//         progress: g.progress_percentage,
//       })),
//     [goalsData],
//   );

//   return (
//     <Card className="bg-card border-border">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//               Financial Goals
//             </CardTitle>
//             <CardDescription className="text-[14px] text-muted-foreground">
//               Track your personal savings targets
//             </CardDescription>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => onNavigate('Goals')}
//           >
//             <Target className="h-4 w-4 mr-2" />
//             {goals.length > 0 ? 'View All' : 'Add Goal'}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {goals.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {goals.map((goal, index) => (
//               <div
//                 key={index}
//                 className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-sm font-medium text-foreground">
//                     {goal.name}
//                   </span>
//                   <span className="text-xs text-muted-foreground">
//                     {goal.progress}%
//                   </span>
//                 </div>
//                 <Progress
//                   value={goal.progress}
//                   className="h-2 mb-3 dark:bg-gray-500"
//                 />
//                 <div className="text-xs text-muted-foreground">
//                   ₵{goal.saved.toLocaleString()} of ₵
//                   {goal.target.toLocaleString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-8 text-center">
//             <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
//               <Target className="h-6 w-6 text-primary/60" />
//             </div>
//             <p className="text-sm text-muted-foreground mb-4">
//               You haven&apos;t set any personal financial goals yet.
//             </p>
//             <p className="text-primary p-0 h-auto">
//               Click the <span className="font-bold">&quot;Add Goal&quot;</span>{' '}
//               button to set your first goal.
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Wallet balance card (live from scheduled contributions data) ─────────────

// function WalletBalanceCard({
//   showBalance,
//   onToggleBalance,
//   onTopUp,
// }: {
//   showBalance: boolean;
//   onToggleBalance: () => void;
//   onTopUp: () => void;
// }) {
//   // Read directly from the query cache — no queryFn needed, no extra API call.
//   // ScheduledContributions component populates this cache entry.
//   const queryClient = useQueryClient();
//   const scheduledData = queryClient.getQueryData<{
//     wallet_balance: string;
//     total_upcoming_amount: string;
//     contributions: Array<{ status: string }>;
//   }>(['scheduled-contributions']);

//   const walletBalance = parseFloat(scheduledData?.wallet_balance ?? '0');
//   const totalUpcoming = parseFloat(scheduledData?.total_upcoming_amount ?? '0');
//   const scheduledCount =
//     scheduledData?.contributions.filter((c) => c.status !== 'completed')
//       .length ?? 0;
//   const hasSufficientBalance = walletBalance >= totalUpcoming;

//   return (
//     <Card className="bg-linear-to-br from-purple-500 to-indigo-600 text-white">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Wallet className="h-5 w-5" />
//             <CardTitle>Wallet Balance</CardTitle>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="text-white hover:bg-white/20"
//             onClick={onToggleBalance}
//             aria-label={showBalance ? 'Hide balance' : 'Show balance'}
//           >
//             {showBalance ? (
//               <Eye className="h-5 w-5" />
//             ) : (
//               <EyeOff className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-4xl mb-2">
//               {showBalance ? `GHS ${walletBalance.toFixed(2)}` : 'GHS •••••'}
//             </div>
//             <div className="text-sm text-white/80">
//               Available for auto-deductions
//             </div>
//           </div>

//           <div className="pt-4 border-t border-white/20">
//             <div className="text-sm text-white/80 mb-2">
//               Upcoming Deductions
//             </div>
//             <div className="text-2xl mb-1">GHS {totalUpcoming.toFixed(2)}</div>
//             <div className="text-xs text-white/70">
//               Total from {scheduledCount} scheduled contribution
//               {scheduledCount !== 1 ? 's' : ''}
//             </div>
//           </div>

//           {hasSufficientBalance ? (
//             <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-300/30 rounded-lg">
//               <CheckCircle2 className="h-4 w-4 text-green-200 shrink-0 mt-0.5" />
//               <div className="text-xs text-green-50">
//                 <p className="font-semibold mb-1">Sufficient Balance</p>
//                 <p>Your wallet has enough funds for upcoming contributions</p>
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-start gap-2 p-3 bg-amber-500/20 border border-amber-300/30 rounded-lg">
//               <AlertCircle className="h-4 w-4 text-amber-200 shrink-0 mt-0.5" />
//               <div className="text-xs text-amber-50">
//                 <p className="font-semibold mb-1">Low Balance</p>
//                 <p>Top up to avoid missed contributions</p>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2 pt-2">
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
//               onClick={onTopUp}
//             >
//               <Wallet className="h-4 w-4 mr-2" />
//               Top Up Wallet
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// export function DashboardHomeEnhanced({
//   onNavigate,
// }: DashboardHomeEnhancedProps) {
//   const [showBalance, setShowBalance] = useState(true);
//   const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
//   const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
//   const [isCashOutOpen, setIsCashOutOpen] = useState(false);
//   const [isTopUpOpen, setIsTopUpOpen] = useState(false);
//   const [savingsExpanded, setSavingsExpanded] = useState(false);

//   const { data: dashboardData, isLoading: isDashboardLoading } =
//     useQuery<DashboardResponse>({
//       queryKey: ['dashboard'],
//       queryFn: authService.dashboard,
//       staleTime: 1000 * 60 * 5,
//     });

//   const { data: goalsData, isLoading: isGoalsLoading } =
//     useQuery<GoalsDashboardResponse>({
//       queryKey: ['goals-dashboard'],
//       queryFn: authService.goalsDashboard,
//       staleTime: 1000 * 60 * 5,
//     });

//   const totalSavings = useMemo(
//     () =>
//       dashboardData?.total_savings ? Number(dashboardData.total_savings) : 0,
//     [dashboardData],
//   );

//   const growthText = useMemo(
//     () => dashboardData?.growth_text || '+0.0% from last month',
//     [dashboardData],
//   );

//   const groupSavings = useMemo(
//     () =>
//       (dashboardData?.joined_groups ?? []).reduce(
//         (sum, g) => sum + Number(g.user_total_contribution || 0),
//         0,
//       ),
//     [dashboardData],
//   );

//   const individualSavings = useMemo(
//     () => (goalsData?.total_saved ? Number(goalsData.total_saved) : 0),
//     [goalsData],
//   );

//   if (isDashboardLoading || isGoalsLoading) {
//     return <DashboardSkeleton />;
//   }

//   const handleTopUpComplete = (amount: number, method: string) => {
//     console.log(`Wallet topped up with GHS ${amount} via ${method}`);
//   };

//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       {/* Total savings hero card */}
//       <TotalSavingsCard
//         totalSavings={totalSavings}
//         growthText={growthText}
//         individualSavings={individualSavings}
//         groupSavings={groupSavings}
//         showBalance={showBalance}
//         onToggleBalance={() => setShowBalance((prev) => !prev)}
//         onCashOut={() => setIsCashOutOpen(true)}
//         savingsExpanded={savingsExpanded}
//         onToggleExpanded={() => setSavingsExpanded((prev) => !prev)}
//       />

//       {/* Quick actions */}
//       <QuickActions
//         onNavigate={onNavigate}
//         setIsCreateGroupOpen={setIsCreateGroupOpen}
//         setIsJoinGroupOpen={setIsJoinGroupOpen}
//       />

//       {/* Groups + Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />

//         {/* ✅ Real Recent Activity — live from /accounts/activity/ */}
//         <RecentActivity onNavigate={onNavigate} />
//       </div>

//       {/* Financial goals */}
//       <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

//       {/* Scheduled Contributions + Wallet Balance */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
//         {/* ✅ Real Scheduled Contributions — live from /accounts/scheduled-contributions/ */}
//         <ScheduledContributions onNavigate={onNavigate} />

//         {/* Wallet Balance Card — reads live data from scheduled-contributions cache */}
//         <WalletBalanceCard
//           showBalance={showBalance}
//           onToggleBalance={() => setShowBalance((prev) => !prev)}
//           onTopUp={() => setIsTopUpOpen(true)}
//         />
//       </div>

//       {/* Modals */}
//       <CreateGroupModal
//         isOpen={isCreateGroupOpen}
//         onClose={() => setIsCreateGroupOpen(false)}
//         onComplete={(groupData) => console.log('Group created:', groupData)}
//       />
//       <JoinGroupModal
//         isOpen={isJoinGroupOpen}
//         onClose={() => setIsJoinGroupOpen(false)}
//       />
//       <CashOutModal
//         isOpen={isCashOutOpen}
//         onClose={() => setIsCashOutOpen(false)}
//         availableBalance={totalSavings}
//         payoutAccount={{
//           provider: 'MTN Momo',
//           number: '024 XXX XXXX',
//           name: 'James Daniel',
//         }}
//       />
//       <TopUpWalletModal
//         isOpen={isTopUpOpen}
//         onClose={() => setIsTopUpOpen(false)}
//         onComplete={handleTopUpComplete}
//         currentBalance={0}
//       />
//     </div>
//   );
// }

// // src/app/components/pages/DashboardHomeEnhanced.tsx

// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import {
//   TrendingUp,
//   Users,
//   PlusCircle,
//   Target,
//   Bot,
//   Lightbulb,
//   Eye,
//   EyeOff,
//   ArrowUpRight,
//   ArrowDownRight,
//   DollarSign,
//   Wallet,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
// } from 'lucide-react';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Progress } from '../ui/progress';
// import { Skeleton } from '../ui/skeleton';

// import { CreateGroupModal } from '../modals/CreateGroupModal';
// import { CashOutModal } from '../modals/CashOutModal';
// import { JoinGroupModal } from '../modals/JoinGroupModal';
// import { TopUpWalletModal } from '../modals/TopUpWalletModal';

// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// // ─── Types

// interface DashboardResponse {
//   total_savings: string | number;
//   growth_text: string;
//   joined_groups: Array<{
//     id: number;
//     group_name: string;
//     current_members: number;
//     next_payout_days: number | null;
//     user_total_contribution: string | number;
//     total_saved: string | number;
//     progress_percentage: number;
//     contribution_amount: string | number;
//     frequency: string;
//   }>;
// }

// interface GoalsDashboardResponse {
//   total_saved: string | number;
//   goals: Array<{
//     id: number;
//     name: string;
//     target_amount: string | number;
//     current_saved: string | number;
//     progress_percentage: number;
//   }>;
// }

// interface DashboardHomeEnhancedProps {
//   onNavigate: (page: string) => void;
// }

// function TotalSavingsCardSkeleton() {
//   return (
//     <div className="rounded-2xl bg-linear-to-br from-cyan-500/30 to-teal-600/30 p-6 space-y-5 animate-pulse">
//       {/* Title row: label + eye icon */}
//       <div className="flex items-center justify-between">
//         <Skeleton className="h-5 w-28 rounded bg-white/30" />
//         <Skeleton className="h-9 w-9 rounded-md bg-white/30" />
//       </div>

//       {/* Large balance */}
//       <Skeleton className="h-10 w-44 rounded bg-white/30" />

//       {/* Growth text row */}
//       <div className="flex items-center gap-2">
//         <Skeleton className="h-4 w-4 rounded-full bg-white/30" />
//         <Skeleton className="h-4 w-40 rounded bg-white/30" />
//       </div>

//       {/* Divider */}
//       <div className="border-t border-white/20 pt-4 flex gap-2">
//         <Skeleton className="h-10 flex-1 rounded-md bg-white/30" />
//         <Skeleton className="h-10 flex-1 rounded-md bg-white/30" />
//       </div>
//     </div>
//   );
// }

// function QuickActionsSkeleton() {
//   return (
//     <div className="space-y-4 animate-pulse">
//       <Skeleton className="h-7 w-40 rounded" />
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <div
//             key={i}
//             className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card"
//           >
//             <Skeleton className="w-14 h-14 rounded-full" />
//             <Skeleton className="h-4 w-20 rounded" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function SavingsGroupCardSkeleton() {
//   return (
//     <Card className="bg-card border-border animate-pulse">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="space-y-1.5">
//             <Skeleton className="h-5 w-36 rounded" />
//             <Skeleton className="h-4 w-20 rounded" />
//           </div>
//           <div className="text-right space-y-1.5">
//             <Skeleton className="h-4 w-20 rounded" />
//             <Skeleton className="h-5 w-24 rounded" />
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-5">
//         {/* Progress */}
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <Skeleton className="h-4 w-14 rounded" />
//             <Skeleton className="h-4 w-10 rounded" />
//           </div>
//           <Skeleton className="h-2 w-full rounded-full" />
//         </div>
//         {/* Stats row */}
//         <div className="grid grid-cols-2 gap-6">
//           <div className="space-y-1.5">
//             <Skeleton className="h-4 w-28 rounded" />
//             <Skeleton className="h-5 w-16 rounded" />
//           </div>
//           <div className="space-y-1.5">
//             <Skeleton className="h-4 w-20 rounded" />
//             <Skeleton className="h-5 w-16 rounded" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function SavingsGroupsSectionSkeleton() {
//   return (
//     <div className="lg:col-span-2 space-y-4 animate-pulse">
//       <div className="flex items-center justify-between">
//         <Skeleton className="h-7 w-48 rounded" />
//         <Skeleton className="h-8 w-16 rounded-md" />
//       </div>
//       <SavingsGroupCardSkeleton />
//       <SavingsGroupCardSkeleton />
//     </div>
//   );
// }

// function RecentActivitySectionSkeleton() {
//   return (
//     <div className="space-y-4 animate-pulse">
//       <Skeleton className="h-7 w-36 rounded" />
//       <Card className="bg-card border-border">
//         <CardContent className="p-0">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div
//               key={i}
//               className={cn(
//                 'p-4 flex items-start gap-4',
//                 i < 2 && 'border-b border-border',
//               )}
//             >
//               {/* Icon box */}
//               <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
//               {/* Text stack */}
//               <div className="flex-1 space-y-1.5">
//                 <Skeleton className="h-4 w-40 rounded" />
//                 <Skeleton className="h-3 w-20 rounded" />
//               </div>
//               {/* Amount */}
//               <Skeleton className="h-4 w-14 rounded shrink-0" />
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function FinancialGoalsSectionSkeleton() {
//   return (
//     <Card className="bg-card border-border animate-pulse">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <div className="space-y-1.5">
//             <Skeleton className="h-5 w-36 rounded" />
//             <Skeleton className="h-4 w-52 rounded" />
//           </div>
//           <Skeleton className="h-9 w-24 rounded-md" />
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div
//               key={i}
//               className="p-5 rounded-lg border border-border space-y-3"
//             >
//               <div className="flex items-center justify-between">
//                 <Skeleton className="h-4 w-24 rounded" />
//                 <Skeleton className="h-3 w-8 rounded" />
//               </div>
//               <Skeleton className="h-2 w-full rounded-full" />
//               <Skeleton className="h-3 w-32 rounded" />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function ScheduledContributionsCardSkeleton() {
//   return (
//     <Card className="bg-card border-border animate-pulse">
//       <CardHeader>
//         <div className="flex items-center gap-3">
//           <Skeleton className="h-5 w-5 rounded shrink-0" />
//           <div className="space-y-1.5">
//             <Skeleton className="h-5 w-44 rounded" />
//             <Skeleton className="h-4 w-36 rounded" />
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <div
//             key={i}
//             className="p-4 rounded-lg border border-border bg-muted/30 space-y-3"
//           >
//             {/* Group name + status badge */}
//             <div className="flex items-center justify-between">
//               <Skeleton className="h-4 w-40 rounded" />
//               <Skeleton className="h-6 w-20 rounded-full" />
//             </div>
//             {/* Amount row */}
//             <div className="flex items-center justify-between">
//               <Skeleton className="h-4 w-32 rounded" />
//               <Skeleton className="h-3 w-14 rounded" />
//             </div>
//           </div>
//         ))}
//         {/* Info banner */}
//         <div className="pt-3 border-t border-border">
//           <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-3">
//             <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
//             <div className="space-y-1.5 flex-1">
//               <Skeleton className="h-4 w-36 rounded" />
//               <Skeleton className="h-3 w-full rounded" />
//               <Skeleton className="h-3 w-4/5 rounded" />
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function WalletBalanceCardSkeleton() {
//   return (
//     <div className="rounded-2xl bg-linear-to-br from-purple-500/30 to-indigo-600/30 p-6 space-y-5 animate-pulse">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Skeleton className="h-5 w-5 rounded bg-white/30" />
//           <Skeleton className="h-5 w-28 rounded bg-white/30" />
//         </div>
//         <Skeleton className="h-9 w-9 rounded-md bg-white/30" />
//       </div>

//       {/* Balance */}
//       <div className="space-y-1.5">
//         <Skeleton className="h-10 w-40 rounded bg-white/30" />
//         <Skeleton className="h-4 w-48 rounded bg-white/30" />
//       </div>

//       {/* Upcoming deductions block */}
//       <div className="pt-4 border-t border-white/20 space-y-2">
//         <Skeleton className="h-4 w-36 rounded bg-white/30" />
//         <Skeleton className="h-8 w-32 rounded bg-white/30" />
//         <Skeleton className="h-3 w-52 rounded bg-white/30" />
//       </div>

//       {/* Status badge */}
//       <Skeleton className="h-16 w-full rounded-lg bg-white/20" />

//       {/* Top Up button */}
//       <Skeleton className="h-10 w-full rounded-md bg-white/30" />
//     </div>
//   );
// }

// /** Full-page composed skeleton  */
// function DashboardSkeleton() {
//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       <TotalSavingsCardSkeleton />
//       <QuickActionsSkeleton />
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <SavingsGroupsSectionSkeleton />
//         <RecentActivitySectionSkeleton />
//       </div>
//       <FinancialGoalsSectionSkeleton />
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ScheduledContributionsCardSkeleton />
//         <WalletBalanceCardSkeleton />
//       </div>
//     </div>
//   );
// }

// // ─── Sub-components

// function TotalSavingsCard({
//   totalSavings,
//   growthText,
//   individualSavings,
//   groupSavings,
//   showBalance,
//   onToggleBalance,
//   onCashOut,
//   savingsExpanded,
//   onToggleExpanded,
// }: {
//   totalSavings: number;
//   growthText: string;
//   individualSavings: number;
//   groupSavings: number;
//   showBalance: boolean;
//   onToggleBalance: () => void;
//   onCashOut: () => void;
//   savingsExpanded: boolean;
//   onToggleExpanded: () => void;
// }) {
//   return (
//     <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-[16px] md:text-[20px] font-medium">
//             Total Savings
//           </CardTitle>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="text-white hover:bg-white/20"
//             onClick={onToggleBalance}
//             aria-label={showBalance ? 'Hide balance' : 'Show balance'}
//           >
//             {showBalance ? (
//               <Eye className="h-5 w-5" />
//             ) : (
//               <EyeOff className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-4xl mb-2">
//               {showBalance ? `₵${totalSavings.toFixed(2)}` : '₵•••••'}
//             </div>
//             <div className="flex items-center gap-2 text-white/90">
//               <TrendingUp className="h-4 w-4" />
//               <span className="text-sm">{growthText}</span>
//             </div>
//           </div>

//           {savingsExpanded && (
//             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 animate-in slide-in-from-top">
//               <div>
//                 <div className="text-sm text-white/80 mb-1">Individual</div>
//                 <div className="text-xl">₵{individualSavings.toFixed(2)}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-white/80 mb-1">Groups</div>
//                 <div className="text-xl">₵{groupSavings.toFixed(2)}</div>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2 pt-4 border-t border-white/20">
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//               onClick={onToggleExpanded}
//             >
//               {savingsExpanded ? 'Hide' : 'Show'} Details
//             </Button>
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//               onClick={onCashOut}
//             >
//               <DollarSign className="h-4 w-4 mr-2" />
//               Cash Out
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function QuickActions({
//   onNavigate,
//   setIsCreateGroupOpen,
//   setIsJoinGroupOpen,
// }: {
//   onNavigate: (page: string) => void;
//   setIsCreateGroupOpen: (open: boolean) => void;
//   setIsJoinGroupOpen: (open: boolean) => void;
// }) {
//   const actions = useMemo(
//     () => [
//       {
//         icon: PlusCircle,
//         label: 'Create Group',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => setIsCreateGroupOpen(true),
//       },
//       {
//         icon: Users,
//         label: 'Join Group',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => setIsJoinGroupOpen(true),
//       },
//       {
//         icon: Lightbulb,
//         label: 'AI Tips',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => onNavigate('AI Assistant'),
//       },
//       {
//         icon: Bot,
//         label: 'Chat Bot',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => onNavigate('Bot Integration'),
//       },
//     ],
//     [onNavigate, setIsCreateGroupOpen, setIsJoinGroupOpen],
//   );

//   return (
//     <div>
//       <h3 className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
//         Quick Actions
//       </h3>
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {actions.map((action, index) => {
//           const Icon = action.icon;
//           return (
//             <button
//               key={index}
//               onClick={action.onClick}
//               className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md group bg-card"
//               aria-label={action.label}
//             >
//               <div
//                 className={cn(
//                   'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
//                   action.bgColor,
//                 )}
//               >
//                 <Icon className={cn('h-7 w-7', action.color)} />
//               </div>
//               <span className="text-sm text-center font-medium text-foreground">
//                 {action.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function SavingsGroupsSection({
//   groups,
// }: {
//   groups: DashboardResponse['joined_groups'];
// }) {
//   const savingsGroups = useMemo(() => {
//     return groups.map((g) => ({
//       name: g.group_name,
//       members: g.current_members,
//       totalSaved: Number(g.total_saved),
//       yourContribution: Number(g.user_total_contribution),
//       nextPayout: `${g.next_payout_days ?? 0} days`,
//       progress: g.progress_percentage,
//     }));
//   }, [groups]);

//   return (
//     <div className="lg:col-span-2 space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//           Your Savings Groups
//         </h3>
//         {savingsGroups.length > 0 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="text-primary hover:text-primary/90"
//           >
//             View All
//           </Button>
//         )}
//       </div>

//       {savingsGroups.length > 0 ? (
//         savingsGroups.map((group, index) => (
//           <Card
//             key={index}
//             className="hover:shadow-md transition-shadow bg-card border-border"
//           >
//             <CardHeader className="pb-3">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <CardTitle className="text-lg font-medium text-foreground">
//                     {group.name}
//                   </CardTitle>
//                   <CardDescription>{group.members} members</CardDescription>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-sm text-muted-foreground">
//                     Total Saved
//                   </div>
//                   <div className="text-lg font-semibold text-foreground">
//                     ₵{group.totalSaved.toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-5">
//               <div>
//                 <div className="flex items-center justify-between text-sm mb-2">
//                   <span className="text-muted-foreground">Progress</span>
//                   <span className="font-medium">{group.progress}%</span>
//                 </div>
//                 <Progress
//                   value={group.progress}
//                   className="h-2 dark:bg-gray-500"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-6 text-sm">
//                 <div>
//                   <div className="text-muted-foreground mb-1">
//                     Your Contribution
//                   </div>
//                   <div className="font-medium text-foreground">
//                     ₵{group.yourContribution.toLocaleString()}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-muted-foreground mb-1">Next Payout</div>
//                   <div className="text-primary font-medium">
//                     {group.nextPayout}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))
//       ) : (
//         <Card className="border-dashed border-2 bg-muted/10">
//           <CardContent className="flex flex-col items-center justify-center py-12 text-center">
//             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
//               <Users className="h-8 w-8 text-primary" />
//             </div>
//             <h4 className="text-lg font-semibold text-foreground">
//               No groups yet
//             </h4>
//             <p className="text-sm text-muted-foreground max-w-70 mb-6">
//               Join a savings circle or create your own to start saving with
//               others.
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// function RecentActivitySection() {
//   const recentActivity = [
//     {
//       type: 'contribution' as const,
//       group: 'Family Savings Circle',
//       amount: 200,
//       date: '2 hours ago',
//       status: 'completed',
//     },
//     {
//       type: 'payout' as const,
//       group: 'Business Partners',
//       amount: 1500,
//       date: '1 day ago',
//       status: 'completed',
//     },
//     {
//       type: 'contribution' as const,
//       group: 'Wedding Fund',
//       amount: 300,
//       date: '2 days ago',
//       status: 'completed',
//     },
//   ];

//   return (
//     <div className="space-y-4">
//       <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//         Recent Activity
//       </h3>
//       <Card className="bg-card border-border">
//         <CardContent className="p-0">
//           {recentActivity.map((activity, index) => (
//             <div
//               key={index}
//               className={cn(
//                 'p-4',
//                 index < recentActivity.length - 1 && 'border-b border-border',
//               )}
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={cn(
//                     'p-2.5 rounded-lg',
//                     activity.type === 'contribution'
//                       ? 'bg-primary/10'
//                       : 'bg-teal-500/10 dark:bg-teal-900/30',
//                   )}
//                 >
//                   {activity.type === 'contribution' ? (
//                     <ArrowUpRight className="h-5 w-5 text-primary" />
//                   ) : (
//                     <ArrowDownRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="font-medium text-foreground truncate">
//                     {activity.group}
//                   </div>
//                   <div className="text-xs text-muted-foreground mt-0.5">
//                     {activity.date}
//                   </div>
//                 </div>
//                 <div
//                   className={cn(
//                     'text-sm font-medium',
//                     activity.type === 'contribution'
//                       ? 'text-primary'
//                       : 'text-teal-600 dark:text-teal-400',
//                   )}
//                 >
//                   {activity.type === 'contribution' ? '-' : '+'}₵
//                   {activity.amount}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function FinancialGoalsSection({
//   goalsData,
//   onNavigate,
// }: {
//   goalsData: GoalsDashboardResponse | undefined;
//   onNavigate: (page: string) => void;
// }) {
//   const goals = useMemo(() => {
//     return (goalsData?.goals ?? []).map((g) => ({
//       name: g.name,
//       target: Number(g.target_amount),
//       saved: Number(g.current_saved),
//       progress: g.progress_percentage,
//     }));
//   }, [goalsData]);

//   return (
//     <Card className="bg-card border-border">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//               Financial Goals
//             </CardTitle>
//             <CardDescription className="text-[14px] text-muted-foreground">
//               Track your personal savings targets
//             </CardDescription>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => onNavigate('Goals')}
//           >
//             <Target className="h-4 w-4 mr-2" />
//             {goals.length > 0 ? 'View All' : 'Add Goal'}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {goals.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {goals.map((goal, index) => (
//               <div
//                 key={index}
//                 className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-sm font-medium text-foreground">
//                     {goal.name}
//                   </span>
//                   <span className="text-xs text-muted-foreground">
//                     {goal.progress}%
//                   </span>
//                 </div>
//                 <Progress
//                   value={goal.progress}
//                   className="h-2 mb-3 dark:bg-gray-500"
//                 />
//                 <div className="text-xs text-muted-foreground">
//                   ₵{goal.saved.toLocaleString()} of ₵
//                   {goal.target.toLocaleString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-8 text-center">
//             <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
//               <Target className="h-6 w-6 text-primary/60" />
//             </div>
//             <p className="text-sm text-muted-foreground mb-4">
//               You haven&apos;t set any personal financial goals yet.
//             </p>
//             <p className="text-primary p-0 h-auto">
//               Click the <span className="font-bold">&quot;Add Goal&quot;</span>{' '}
//               button to set your first goal.
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function ScheduledContributionsCard() {
//   const scheduledContributions = useMemo(
//     () => [
//       {
//         id: '1',
//         groupName: 'Family Savings Circle',
//         amount: 200,
//         dueDate: '2025-12-10',
//         status: 'scheduled' as const,
//         frequency: 'Monthly',
//       },
//       {
//         id: '2',
//         groupName: 'Business Partners',
//         amount: 150,
//         dueDate: '2025-12-12',
//         status: 'scheduled' as const,
//         frequency: 'Bi-weekly',
//       },
//       {
//         id: '3',
//         groupName: 'Wedding Fund',
//         amount: 100,
//         dueDate: '2025-12-15',
//         status: 'scheduled' as const,
//         frequency: 'Weekly',
//       },
//     ],
//     [],
//   );

//   return (
//     <Card className="bg-card border-border">
//       <CardHeader>
//         <div className="flex items-center gap-3">
//           <Calendar className="h-5 w-5 text-primary" />
//           <div>
//             <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//               Scheduled Contributions
//             </CardTitle>
//             <CardDescription className="text-muted-foreground">
//               Auto-deduction from wallet
//             </CardDescription>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {scheduledContributions.map((contribution) => (
//           <div
//             key={contribution.id}
//             className="p-4 rounded-lg border border-border bg-muted/30"
//           >
//             <div className="flex items-center justify-between mb-3">
//               <span className="font-medium text-foreground">
//                 {contribution.groupName}
//               </span>
//               <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
//                 <Clock className="h-3 w-3" />
//                 {contribution.status}
//               </div>
//             </div>
//             <div className="flex items-center justify-between text-sm">
//               <div className="text-muted-foreground">
//                 <span className="text-primary font-medium">
//                   GHS {contribution.amount}
//                 </span>{' '}
//                 • {contribution.frequency}
//               </div>
//               <div className="text-xs text-muted-foreground">
//                 {new Date(contribution.dueDate).toLocaleDateString('en-US', {
//                   month: 'short',
//                   day: 'numeric',
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="pt-3 border-t border-border">
//           <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
//             <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
//             <div className="text-sm text-primary/90">
//               <p className="font-medium mb-1">Auto-Deduction Active</p>
//               <p>
//                 Contributions will be automatically deducted from your wallet on
//                 due dates. Ensure sufficient balance to avoid missed payments.
//               </p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function WalletBalanceCard({
//   walletBalance,
//   showBalance,
//   onToggleBalance,
//   scheduledContributions,
//   onTopUp,
// }: {
//   walletBalance: number;
//   showBalance: boolean;
//   onToggleBalance: () => void;
//   scheduledContributions: Array<{ amount: number }>;
//   onTopUp: () => void;
// }) {
//   const totalUpcoming = useMemo(
//     () => scheduledContributions.reduce((sum, c) => sum + c.amount, 0),
//     [scheduledContributions],
//   );

//   const hasSufficientBalance = walletBalance >= totalUpcoming;

//   return (
//     <Card className="bg-linear-to-br from-purple-500 to-indigo-600 text-white">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Wallet className="h-5 w-5" />
//             <CardTitle>Wallet Balance</CardTitle>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="text-white hover:bg-white/20"
//             onClick={onToggleBalance}
//             aria-label={showBalance ? 'Hide balance' : 'Show balance'}
//           >
//             {showBalance ? (
//               <Eye className="h-5 w-5" />
//             ) : (
//               <EyeOff className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-4xl mb-2">
//               {showBalance ? `GHS ${walletBalance.toFixed(2)}` : 'GHS •••••'}
//             </div>
//             <div className="text-sm text-white/80">
//               Available for auto-deductions
//             </div>
//           </div>

//           <div className="pt-4 border-t border-white/20">
//             <div className="text-sm text-white/80 mb-2">
//               Upcoming Deductions
//             </div>
//             <div className="text-2xl mb-1">GHS {totalUpcoming.toFixed(2)}</div>
//             <div className="text-xs text-white/70">
//               Total from {scheduledContributions.length} scheduled contributions
//             </div>
//           </div>

//           {hasSufficientBalance ? (
//             <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-300/30 rounded-lg">
//               <CheckCircle2 className="h-4 w-4 text-green-200 shrink-0 mt-0.5" />
//               <div className="text-xs text-green-50">
//                 <p className="font-semibold mb-1">Sufficient Balance</p>
//                 <p>Your wallet has enough funds for upcoming contributions</p>
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-start gap-2 p-3 bg-amber-500/20 border border-amber-300/30 rounded-lg">
//               <AlertCircle className="h-4 w-4 text-amber-200 shrink-0 mt-0.5" />
//               <div className="text-xs text-amber-50">
//                 <p className="font-semibold mb-1">Low Balance</p>
//                 <p>Top up to avoid missed contributions</p>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2 pt-2">
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
//               onClick={onTopUp}
//             >
//               <Wallet className="h-4 w-4 mr-2" />
//               Top Up Wallet
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// export function DashboardHomeEnhanced({
//   onNavigate,
// }: DashboardHomeEnhancedProps) {
//   const [showBalance, setShowBalance] = useState(true);
//   const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
//   const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
//   const [isCashOutOpen, setIsCashOutOpen] = useState(false);
//   const [isTopUpOpen, setIsTopUpOpen] = useState(false);
//   const [savingsExpanded, setSavingsExpanded] = useState(false);

//   const walletBalance = 850;

//   const { data: dashboardData, isLoading: isDashboardLoading } =
//     useQuery<DashboardResponse>({
//       queryKey: ['dashboard'],
//       queryFn: authService.dashboard,
//       staleTime: 1000 * 60 * 5,
//     });

//   const { data: goalsData, isLoading: isGoalsLoading } =
//     useQuery<GoalsDashboardResponse>({
//       queryKey: ['goals-dashboard'],
//       queryFn: authService.goalsDashboard,
//       staleTime: 1000 * 60 * 5,
//     });

//   const totalSavings = useMemo(
//     () =>
//       dashboardData?.total_savings ? Number(dashboardData.total_savings) : 0,
//     [dashboardData],
//   );

//   const growthText = useMemo(
//     () => dashboardData?.growth_text || '+0.0% from last month',
//     [dashboardData],
//   );

//   const groupSavings = useMemo(
//     () =>
//       (dashboardData?.joined_groups ?? []).reduce(
//         (sum, g) => sum + Number(g.user_total_contribution || 0),
//         0,
//       ),
//     [dashboardData],
//   );

//   const individualSavings = useMemo(
//     () => (goalsData?.total_saved ? Number(goalsData.total_saved) : 0),
//     [goalsData],
//   );

//   const scheduledContributions = useMemo(
//     () => [
//       { id: '1', groupName: 'Family Savings Circle', amount: 200 },
//       { id: '2', groupName: 'Business Partners', amount: 150 },
//       { id: '3', groupName: 'Wedding Fund', amount: 100 },
//     ],
//     [],
//   );

//   if (isDashboardLoading || isGoalsLoading) {
//     return <DashboardSkeleton />;
//   }

//   const handleTopUpComplete = (amount: number, method: string) => {
//     console.log(`Wallet topped up with GHS ${amount} via ${method}`);
//   };

//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       <TotalSavingsCard
//         totalSavings={totalSavings}
//         growthText={growthText}
//         individualSavings={individualSavings}
//         groupSavings={groupSavings}
//         showBalance={showBalance}
//         onToggleBalance={() => setShowBalance((prev) => !prev)}
//         onCashOut={() => setIsCashOutOpen(true)}
//         savingsExpanded={savingsExpanded}
//         onToggleExpanded={() => setSavingsExpanded((prev) => !prev)}
//       />

//       <QuickActions
//         onNavigate={onNavigate}
//         setIsCreateGroupOpen={setIsCreateGroupOpen}
//         setIsJoinGroupOpen={setIsJoinGroupOpen}
//       />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />
//         <RecentActivitySection />
//       </div>

//       <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ScheduledContributionsCard />
//         <WalletBalanceCard
//           walletBalance={walletBalance}
//           showBalance={showBalance}
//           onToggleBalance={() => setShowBalance((prev) => !prev)}
//           scheduledContributions={scheduledContributions}
//           onTopUp={() => setIsTopUpOpen(true)}
//         />
//       </div>

//       <CreateGroupModal
//         isOpen={isCreateGroupOpen}
//         onClose={() => setIsCreateGroupOpen(false)}
//         onComplete={(groupData) => console.log('Group created:', groupData)}
//       />
//       <JoinGroupModal
//         isOpen={isJoinGroupOpen}
//         onClose={() => setIsJoinGroupOpen(false)}
//       />
//       <CashOutModal
//         isOpen={isCashOutOpen}
//         onClose={() => setIsCashOutOpen(false)}
//         availableBalance={totalSavings}
//         payoutAccount={{
//           provider: 'MTN Momo',
//           number: '024 XXX XXXX',
//           name: 'James Daniel',
//         }}
//       />
//       <TopUpWalletModal
//         isOpen={isTopUpOpen}
//         onClose={() => setIsTopUpOpen(false)}
//         onComplete={handleTopUpComplete}
//         currentBalance={walletBalance}
//       />
//     </div>
//   );
// }

// src/app/components/pages/DashboardHomeEnhanced.tsx
// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import {
//   TrendingUp,
//   Users,
//   PlusCircle,
//   Target,
//   Bot,
//   Lightbulb,
//   Eye,
//   EyeOff,
//   ArrowUpRight,
//   ArrowDownRight,
//   DollarSign,
//   Wallet,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
// } from 'lucide-react';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Progress } from '../ui/progress';

// import { CreateGroupModal } from '../modals/CreateGroupModal';
// import { CashOutModal } from '../modals/CashOutModal';
// import { JoinGroupModal } from '../modals/JoinGroupModal';
// import { TopUpWalletModal } from '../modals/TopUpWalletModal';

// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// // Types
// interface DashboardResponse {
//   total_savings: string | number;
//   growth_text: string;
//   joined_groups: Array<{
//     id: number;
//     group_name: string;
//     current_members: number;
//     next_payout_days: number | null;
//     user_total_contribution: string | number;
//     total_saved: string | number;
//     progress_percentage: number;
//     contribution_amount: string | number;
//     frequency: string;
//   }>;
// }

// interface GoalsDashboardResponse {
//   total_saved: string | number;
//   goals: Array<{
//     id: number;
//     name: string;
//     target_amount: string | number;
//     current_saved: string | number;
//     progress_percentage: number;
//   }>;
// }

// interface DashboardHomeEnhancedProps {
//   onNavigate: (page: string) => void;
// }

// // Reusable sub-components

// function TotalSavingsCard({
//   totalSavings,
//   growthText,
//   individualSavings,
//   groupSavings,
//   showBalance,
//   onToggleBalance,
//   onCashOut,
//   savingsExpanded,
//   onToggleExpanded,
// }: {
//   totalSavings: number;
//   growthText: string;
//   individualSavings: number;
//   groupSavings: number;
//   showBalance: boolean;
//   onToggleBalance: () => void;
//   onCashOut: () => void;
//   savingsExpanded: boolean;
//   onToggleExpanded: () => void;
// }) {
//   return (
//     <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-[16px] md:text-[20px] font-medium">
//             Total Savings
//           </CardTitle>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="text-white hover:bg-white/20"
//             onClick={onToggleBalance}
//             aria-label={showBalance ? 'Hide balance' : 'Show balance'}
//           >
//             {showBalance ? (
//               <Eye className="h-5 w-5" />
//             ) : (
//               <EyeOff className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-4xl mb-2">
//               {showBalance ? `₵${totalSavings.toFixed(2)}` : '₵•••••'}
//             </div>
//             <div className="flex items-center gap-2 text-white/90">
//               <TrendingUp className="h-4 w-4" />
//               <span className="text-sm">{growthText}</span>
//             </div>
//           </div>

//           {savingsExpanded && (
//             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 animate-in slide-in-from-top">
//               <div>
//                 <div className="text-sm text-white/80 mb-1">Individual</div>
//                 <div className="text-xl">₵{individualSavings.toFixed(2)}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-white/80 mb-1">Groups</div>
//                 <div className="text-xl">₵{groupSavings.toFixed(2)}</div>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2 pt-4 border-t border-white/20">
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//               onClick={onToggleExpanded}
//             >
//               {savingsExpanded ? 'Hide' : 'Show'} Details
//             </Button>
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//               onClick={onCashOut}
//             >
//               <DollarSign className="h-4 w-4 mr-2" />
//               Cash Out
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function QuickActions({
//   onNavigate,
//   setIsCreateGroupOpen,
//   setIsJoinGroupOpen,
// }: {
//   onNavigate: (page: string) => void;
//   setIsCreateGroupOpen: (open: boolean) => void;
//   setIsJoinGroupOpen: (open: boolean) => void;
// }) {
//   const actions = useMemo(
//     () => [
//       {
//         icon: PlusCircle,
//         label: 'Create Group',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => setIsCreateGroupOpen(true),
//       },
//       {
//         icon: Users,
//         label: 'Join Group',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => setIsJoinGroupOpen(true),
//       },
//       {
//         icon: Lightbulb,
//         label: 'AI Tips',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => onNavigate('AI Assistant'),
//       },
//       {
//         icon: Bot,
//         label: 'Chat Bot',
//         color: 'text-primary',
//         bgColor: 'bg-primary/10',
//         onClick: () => onNavigate('Bot Integration'),
//       },
//     ],
//     [onNavigate, setIsCreateGroupOpen, setIsJoinGroupOpen],
//   );

//   return (
//     <div>
//       <h3 className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
//         Quick Actions
//       </h3>
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {actions.map((action, index) => {
//           const Icon = action.icon;
//           return (
//             <button
//               key={index}
//               onClick={action.onClick}
//               className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md group bg-card"
//               aria-label={action.label}
//             >
//               <div
//                 className={cn(
//                   'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
//                   action.bgColor,
//                 )}
//               >
//                 <Icon className={cn('h-7 w-7', action.color)} />
//               </div>
//               <span className="text-sm text-center font-medium text-foreground">
//                 {action.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function SavingsGroupsSection({
//   groups,
// }: {
//   groups: DashboardResponse['joined_groups'];
// }) {
//   const savingsGroups = useMemo(() => {
//     return groups.map((g) => ({
//       name: g.group_name,
//       members: g.current_members,
//       totalSaved: Number(g.total_saved),
//       yourContribution: Number(g.user_total_contribution),
//       nextPayout: `${g.next_payout_days ?? 0} days`,
//       progress: g.progress_percentage,
//     }));
//   }, [groups]);

//   return (
//     <div className="lg:col-span-2 space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//           Your Savings Groups
//         </h3>
//         {savingsGroups.length > 0 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="text-primary hover:text-primary/90"
//           >
//             View All
//           </Button>
//         )}
//       </div>

//       {savingsGroups.length > 0 ? (
//         savingsGroups.map((group, index) => (
//           <Card
//             key={index}
//             className="hover:shadow-md transition-shadow bg-card border-border"
//           >
//             <CardHeader className="pb-3">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <CardTitle className="text-lg font-medium text-foreground">
//                     {group.name}
//                   </CardTitle>
//                   <CardDescription>{group.members} members</CardDescription>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-sm text-muted-foreground">
//                     Total Saved
//                   </div>
//                   <div className="text-lg font-semibold text-foreground">
//                     ₵{group.totalSaved.toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-5">
//               <div>
//                 <div className="flex items-center justify-between text-sm mb-2">
//                   <span className="text-muted-foreground">Progress</span>
//                   <span className="font-medium">{group.progress}%</span>
//                 </div>
//                 <Progress
//                   value={group.progress}
//                   className="h-2 dark:bg-gray-500"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-6 text-sm">
//                 <div>
//                   <div className="text-muted-foreground mb-1">
//                     Your Contribution
//                   </div>
//                   <div className="font-medium text-foreground">
//                     ₵{group.yourContribution.toLocaleString()}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-muted-foreground mb-1">Next Payout</div>
//                   <div className="text-primary font-medium">
//                     {group.nextPayout}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))
//       ) : (
//         <Card className="border-dashed border-2 bg-muted/10">
//           <CardContent className="flex flex-col items-center justify-center py-12 text-center">
//             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
//               <Users className="h-8 w-8 text-primary" />
//             </div>
//             <h4 className="text-lg font-semibold text-foreground">
//               No groups yet
//             </h4>
//             <p className="text-sm text-muted-foreground max-w-70 mb-6">
//               Join a savings circle or create your own to start saving with
//               others.
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// function RecentActivitySection() {
//   // Hardcoded demo data
//   const recentActivity = [
//     {
//       type: 'contribution' as const,
//       group: 'Family Savings Circle',
//       amount: 200,
//       date: '2 hours ago',
//       status: 'completed',
//     },
//     {
//       type: 'payout' as const,
//       group: 'Business Partners',
//       amount: 1500,
//       date: '1 day ago',
//       status: 'completed',
//     },
//     {
//       type: 'contribution' as const,
//       group: 'Wedding Fund',
//       amount: 300,
//       date: '2 days ago',
//       status: 'completed',
//     },
//   ];

//   return (
//     <div className="space-y-4">
//       <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//         Recent Activity
//       </h3>
//       <Card className="bg-card border-border">
//         <CardContent className="p-0">
//           {recentActivity.map((activity, index) => (
//             <div
//               key={index}
//               className={cn(
//                 'p-4',
//                 index < recentActivity.length - 1 && 'border-b border-border',
//               )}
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={cn(
//                     'p-2.5 rounded-lg',
//                     activity.type === 'contribution'
//                       ? 'bg-primary/10'
//                       : 'bg-teal-500/10 dark:bg-teal-900/30',
//                   )}
//                 >
//                   {activity.type === 'contribution' ? (
//                     <ArrowUpRight className="h-5 w-5 text-primary" />
//                   ) : (
//                     <ArrowDownRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="font-medium text-foreground truncate">
//                     {activity.group}
//                   </div>
//                   <div className="text-xs text-muted-foreground mt-0.5">
//                     {activity.date}
//                   </div>
//                 </div>
//                 <div
//                   className={cn(
//                     'text-sm font-medium',
//                     activity.type === 'contribution'
//                       ? 'text-primary'
//                       : 'text-teal-600 dark:text-teal-400',
//                   )}
//                 >
//                   {activity.type === 'contribution' ? '-' : '+'}₵
//                   {activity.amount}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function FinancialGoalsSection({
//   goalsData,
//   onNavigate,
// }: {
//   goalsData: GoalsDashboardResponse | undefined;
//   onNavigate: (page: string) => void;
// }) {
//   const goals = useMemo(() => {
//     return (goalsData?.goals ?? []).map((g) => ({
//       name: g.name,
//       target: Number(g.target_amount),
//       saved: Number(g.current_saved),
//       progress: g.progress_percentage,
//     }));
//   }, [goalsData]);

//   return (
//     <Card className="bg-card border-border">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//               Financial Goals
//             </CardTitle>
//             <CardDescription className="text-[14px] text-muted-foreground">
//               Track your personal savings targets
//             </CardDescription>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => onNavigate('Goals')}
//           >
//             <Target className="h-4 w-4 mr-2" />
//             {goals.length > 0 ? 'View All' : 'Add Goal'}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {goals.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {goals.map((goal, index) => (
//               <div
//                 key={index}
//                 className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-sm font-medium text-foreground">
//                     {goal.name}
//                   </span>
//                   <span className="text-xs text-muted-foreground">
//                     {goal.progress}%
//                   </span>
//                 </div>
//                 <Progress
//                   value={goal.progress}
//                   className="h-2 mb-3 dark:bg-gray-500"
//                 />
//                 <div className="text-xs text-muted-foreground">
//                   ₵{goal.saved.toLocaleString()} of ₵
//                   {goal.target.toLocaleString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-8 text-center">
//             <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
//               <Target className="h-6 w-6 text-primary/60" />
//             </div>
//             <p className="text-sm text-muted-foreground mb-4">
//               You haven&apos;t set any personal financial goals yet.
//             </p>
//             <p className="text-primary p-0 h-auto">
//               Click the <span className="font-bold">&quot;Add Goal&quot;</span>{' '}
//               button to set your first goal.
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function ScheduledContributionsCard() {
//   // Hardcoded demo data
//   const scheduledContributions = useMemo(
//     () => [
//       {
//         id: '1',
//         groupName: 'Family Savings Circle',
//         amount: 200,
//         dueDate: '2025-12-10',
//         status: 'scheduled' as const,
//         frequency: 'Monthly',
//       },
//       {
//         id: '2',
//         groupName: 'Business Partners',
//         amount: 150,
//         dueDate: '2025-12-12',
//         status: 'scheduled' as const,
//         frequency: 'Bi-weekly',
//       },
//       {
//         id: '3',
//         groupName: 'Wedding Fund',
//         amount: 100,
//         dueDate: '2025-12-15',
//         status: 'scheduled' as const,
//         frequency: 'Weekly',
//       },
//     ],
//     [],
//   );

//   return (
//     <Card className="bg-card border-border">
//       <CardHeader>
//         <div className="flex items-center gap-3">
//           <Calendar className="h-5 w-5 text-primary" />
//           <div>
//             <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//               Scheduled Contributions
//             </CardTitle>
//             <CardDescription className="text-muted-foreground">
//               Auto-deduction from wallet
//             </CardDescription>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {scheduledContributions.map((contribution) => (
//           <div
//             key={contribution.id}
//             className="p-4 rounded-lg border border-border bg-muted/30"
//           >
//             <div className="flex items-center justify-between mb-3">
//               <span className="font-medium text-foreground">
//                 {contribution.groupName}
//               </span>
//               <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
//                 <Clock className="h-3 w-3" />
//                 {contribution.status}
//               </div>
//             </div>
//             <div className="flex items-center justify-between text-sm">
//               <div className="text-muted-foreground">
//                 <span className="text-primary font-medium">
//                   GHS {contribution.amount}
//                 </span>{' '}
//                 • {contribution.frequency}
//               </div>
//               <div className="text-xs text-muted-foreground">
//                 {new Date(contribution.dueDate).toLocaleDateString('en-US', {
//                   month: 'short',
//                   day: 'numeric',
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="pt-3 border-t border-border">
//           <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
//             <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
//             <div className="text-sm text-primary/90">
//               <p className="font-medium mb-1">Auto-Deduction Active</p>
//               <p>
//                 Contributions will be automatically deducted from your wallet on
//                 due dates. Ensure sufficient balance to avoid missed payments.
//               </p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function WalletBalanceCard({
//   walletBalance,
//   showBalance,
//   onToggleBalance,
//   scheduledContributions,
//   onTopUp,
// }: {
//   walletBalance: number;
//   showBalance: boolean;
//   onToggleBalance: () => void;
//   scheduledContributions: Array<{ amount: number }>;
//   onTopUp: () => void;
// }) {
//   const totalUpcoming = useMemo(
//     () => scheduledContributions.reduce((sum, c) => sum + c.amount, 0),
//     [scheduledContributions],
//   );

//   const hasSufficientBalance = walletBalance >= totalUpcoming;

//   return (
//     <Card className="bg-linear-to-br from-purple-500 to-indigo-600 text-white">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Wallet className="h-5 w-5" />
//             <CardTitle>Wallet Balance</CardTitle>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="text-white hover:bg-white/20"
//             onClick={onToggleBalance}
//             aria-label={showBalance ? 'Hide balance' : 'Show balance'}
//           >
//             {showBalance ? (
//               <Eye className="h-5 w-5" />
//             ) : (
//               <EyeOff className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-4xl mb-2">
//               {showBalance ? `GHS ${walletBalance.toFixed(2)}` : 'GHS •••••'}
//             </div>
//             <div className="text-sm text-white/80">
//               Available for auto-deductions
//             </div>
//           </div>

//           <div className="pt-4 border-t border-white/20">
//             <div className="text-sm text-white/80 mb-2">
//               Upcoming Deductions
//             </div>
//             <div className="text-2xl mb-1">GHS {totalUpcoming.toFixed(2)}</div>
//             <div className="text-xs text-white/70">
//               Total from {scheduledContributions.length} scheduled contributions
//             </div>
//           </div>

//           {hasSufficientBalance ? (
//             <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-300/30 rounded-lg">
//               <CheckCircle2 className="h-4 w-4 text-green-200 shrink-0 mt-0.5" />
//               <div className="text-xs text-green-50">
//                 <p className="font-semibold mb-1">Sufficient Balance</p>
//                 <p>Your wallet has enough funds for upcoming contributions</p>
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-start gap-2 p-3 bg-amber-500/20 border border-amber-300/30 rounded-lg">
//               <AlertCircle className="h-4 w-4 text-amber-200 shrink-0 mt-0.5" />
//               <div className="text-xs text-amber-50">
//                 <p className="font-semibold mb-1">Low Balance</p>
//                 <p>Top up to avoid missed contributions</p>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-2 pt-2">
//             <Button
//               variant="secondary"
//               className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
//               onClick={onTopUp}
//             >
//               <Wallet className="h-4 w-4 mr-2" />
//               Top Up Wallet
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // Main component

// export function DashboardHomeEnhanced({
//   onNavigate,
// }: DashboardHomeEnhancedProps) {
//   // Local UI state
//   const [showBalance, setShowBalance] = useState(true);
//   const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
//   const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
//   const [isCashOutOpen, setIsCashOutOpen] = useState(false);
//   const [isTopUpOpen, setIsTopUpOpen] = useState(false);
//   const [savingsExpanded, setSavingsExpanded] = useState(false);

//   // Demo wallet balance
//   const walletBalance = 850;

//   // Data fetching
//   const { data: dashboardData, isLoading: isDashboardLoading } =
//     useQuery<DashboardResponse>({
//       queryKey: ['dashboard'],
//       queryFn: authService.dashboard,
//       staleTime: 1000 * 60 * 5,
//     });

//   const { data: goalsData, isLoading: isGoalsLoading } =
//     useQuery<GoalsDashboardResponse>({
//       queryKey: ['goals-dashboard'],
//       queryFn: authService.goalsDashboard,
//       staleTime: 1000 * 60 * 5,
//     });

//   // Derived values with useMemo
//   const totalSavings = useMemo(() => {
//     return dashboardData?.total_savings
//       ? Number(dashboardData.total_savings)
//       : 0;
//   }, [dashboardData]);

//   const growthText = useMemo(() => {
//     return dashboardData?.growth_text || '+0.0% from last month';
//   }, [dashboardData]);

//   const groupSavings = useMemo(() => {
//     return (dashboardData?.joined_groups ?? []).reduce(
//       (sum, g) => sum + Number(g.user_total_contribution || 0),
//       0,
//     );
//   }, [dashboardData]);

//   const individualSavings = useMemo(() => {
//     return goalsData?.total_saved ? Number(goalsData.total_saved) : 0;
//   }, [goalsData]);

//   const scheduledContributions = useMemo(() => {
//     // Hardcoded demo data
//     return [
//       { id: '1', groupName: 'Family Savings Circle', amount: 200 },
//       { id: '2', groupName: 'Business Partners', amount: 150 },
//       { id: '3', groupName: 'Wedding Fund', amount: 100 },
//     ];
//   }, []);

//   // Loading state (added – senior engineers never ship without it)
//   if (isDashboardLoading || isGoalsLoading) {
//     return (
//       <div className="space-y-6 mb-18 md:mb-0">
//         <div className="h-64 bg-muted animate-pulse rounded-2xl" />
//         <div className="h-40 bg-muted animate-pulse rounded-2xl" />
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-2xl" />
//           <div className="h-96 bg-muted animate-pulse rounded-2xl" />
//         </div>
//       </div>
//     );
//   }

//   const handleTopUpComplete = (amount: number, method: string) => {
//     console.log(`Wallet topped up with GHS ${amount} via ${method}`);
//     // In a real app this would invalidate queries / update local state
//   };

//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       {/* Total Savings Card */}
//       <TotalSavingsCard
//         totalSavings={totalSavings}
//         growthText={growthText}
//         individualSavings={individualSavings}
//         groupSavings={groupSavings}
//         showBalance={showBalance}
//         onToggleBalance={() => setShowBalance((prev) => !prev)}
//         onCashOut={() => setIsCashOutOpen(true)}
//         savingsExpanded={savingsExpanded}
//         onToggleExpanded={() => setSavingsExpanded((prev) => !prev)}
//       />

//       {/* Quick Actions */}
//       <QuickActions
//         onNavigate={onNavigate}
//         setIsCreateGroupOpen={setIsCreateGroupOpen}
//         setIsJoinGroupOpen={setIsJoinGroupOpen}
//       />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Savings Groups */}
//         <SavingsGroupsSection groups={dashboardData?.joined_groups ?? []} />

//         {/* Recent Activity */}
//         <RecentActivitySection />
//       </div>

//       {/* Financial Goals */}
//       <FinancialGoalsSection goalsData={goalsData} onNavigate={onNavigate} />

//       {/* Scheduled Contributions & Wallet Balance */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ScheduledContributionsCard />

//         <WalletBalanceCard
//           walletBalance={walletBalance}
//           showBalance={showBalance}
//           onToggleBalance={() => setShowBalance((prev) => !prev)}
//           scheduledContributions={scheduledContributions}
//           onTopUp={() => setIsTopUpOpen(true)}
//         />
//       </div>

//       {/* Modals (unchanged) */}
//       <CreateGroupModal
//         isOpen={isCreateGroupOpen}
//         onClose={() => setIsCreateGroupOpen(false)}
//         onComplete={(groupData) => console.log('Group created:', groupData)}
//       />
//       <JoinGroupModal
//         isOpen={isJoinGroupOpen}
//         onClose={() => setIsJoinGroupOpen(false)}
//       />
//       <CashOutModal
//         isOpen={isCashOutOpen}
//         onClose={() => setIsCashOutOpen(false)}
//         availableBalance={totalSavings}
//         payoutAccount={{
//           provider: 'MTN Momo',
//           number: '024 XXX XXXX',
//           name: 'James Daniel',
//         }}
//       />
//       <TopUpWalletModal
//         isOpen={isTopUpOpen}
//         onClose={() => setIsTopUpOpen(false)}
//         onComplete={handleTopUpComplete}
//         currentBalance={walletBalance}
//       />
//     </div>
//   );
// }

// // src/app/components/pages/DashboardHomeEnhanced.tsx

// 'use client';

// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import {
//   TrendingUp,
//   Users,
//   PlusCircle,
//   Target,
//   Bot,
//   Lightbulb,
//   Eye,
//   EyeOff,
//   ArrowUpRight,
//   ArrowDownRight,
//   DollarSign,
//   Wallet,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Progress } from '../ui/progress';
// import { CreateGroupModal } from '../modals/CreateGroupModal';
// import { CashOutModal } from '../modals/CashOutModal';
// import { JoinGroupModal } from '../modals/JoinGroupModal';
// import { TopUpWalletModal } from '../modals/TopUpWalletModal';
// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// interface DashboardResponse {
//   total_savings: string | number;
//   growth_text: string;
//   joined_groups: Array<{
//     id: number;
//     group_name: string;
//     current_members: number;
//     next_payout_days: number | null;
//     user_total_contribution: string | number;
//     total_saved: string | number;
//     progress_percentage: number;
//     contribution_amount: string | number;
//     frequency: string;
//   }>;
// }

// interface GoalsDashboardResponse {
//   total_saved: string | number;
//   goals: Array<{
//     id: number;
//     name: string;
//     target_amount: string | number;
//     current_saved: string | number;
//     progress_percentage: number;
//   }>;
// }

// interface DashboardHomeEnhancedProps {
//   onNavigate: (page: string) => void;
// }

// export function DashboardHomeEnhanced({
//   onNavigate,
// }: DashboardHomeEnhancedProps) {
//   const [showBalance, setShowBalance] = useState(true);
//   const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
//   const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
//   const [isCashOutOpen, setIsCashOutOpen] = useState(false);
//   const [isTopUpOpen, setIsTopUpOpen] = useState(false);
//   const [savingsExpanded, setSavingsExpanded] = useState(false);
//   const [walletBalance] = useState(850);

//   const { data: dashboardData } = useQuery<DashboardResponse>({
//     queryKey: ['dashboard'],
//     queryFn: authService.dashboard,
//     staleTime: 1000 * 60 * 5,
//   });

//   const { data: goalsData } = useQuery<GoalsDashboardResponse>({
//     queryKey: ['goals-dashboard'],
//     queryFn: authService.goalsDashboard,
//     staleTime: 1000 * 60 * 5,
//   });

//   const totalSavings = dashboardData?.total_savings
//     ? Number(dashboardData.total_savings)
//     : 0;

//   const growthText = dashboardData?.growth_text || '+0.0% from last month';

//   const groupSavings = (dashboardData?.joined_groups || []).reduce(
//     (sum, g) => sum + Number(g.user_total_contribution || 0),
//     0,
//   );
//   const individualSavings = goalsData?.total_saved
//     ? Number(goalsData.total_saved)
//     : 0;

//   // Savings Groups
//   const savingsGroups = (dashboardData?.joined_groups || []).map((g) => ({
//     name: g.group_name,
//     members: g.current_members,
//     totalSaved: Number(g.total_saved),
//     yourContribution: Number(g.user_total_contribution),
//     nextPayout: `${g.next_payout_days ?? 0} days`,
//     progress: g.progress_percentage,
//   }));

//   // Financial Goals
//   const goals = (goalsData?.goals || []).map((g) => ({
//     name: g.name,
//     target: Number(g.target_amount),
//     saved: Number(g.current_saved),
//     progress: g.progress_percentage,
//   }));

//   const quickActions = [
//     {
//       icon: PlusCircle,
//       label: 'Create Group',
//       color: 'text-primary',
//       bgColor: 'bg-primary/10',
//       onClick: () => setIsCreateGroupOpen(true),
//     },
//     {
//       icon: Users,
//       label: 'Join Group',
//       color: 'text-primary',
//       bgColor: 'bg-primary/10',
//       onClick: () => setIsJoinGroupOpen(true),
//     },
//     {
//       icon: Lightbulb,
//       label: 'AI Tips',
//       color: 'text-primary',
//       bgColor: 'bg-primary/10',
//       onClick: () => onNavigate('AI Assistant'),
//     },
//     {
//       icon: Bot,
//       label: 'Chat Bot',
//       color: 'text-primary',
//       bgColor: 'bg-primary/10',
//       onClick: () => onNavigate('Bot Integration'),
//     },
//   ];

//   const recentActivity = [
//     {
//       type: 'contribution',
//       group: 'Family Savings Circle',
//       amount: 200,
//       date: '2 hours ago',
//       status: 'completed',
//     },
//     {
//       type: 'payout',
//       group: 'Business Partners',
//       amount: 1500,
//       date: '1 day ago',
//       status: 'completed',
//     },
//     {
//       type: 'contribution',
//       group: 'Wedding Fund',
//       amount: 300,
//       date: '2 days ago',
//       status: 'completed',
//     },
//   ];

//   const scheduledContributions = [
//     {
//       id: '1',
//       groupName: 'Family Savings Circle',
//       amount: 200,
//       dueDate: '2025-12-10',
//       status: 'scheduled',
//       frequency: 'Monthly',
//     },
//     {
//       id: '2',
//       groupName: 'Business Partners',
//       amount: 150,
//       dueDate: '2025-12-12',
//       status: 'scheduled',
//       frequency: 'Bi-weekly',
//     },
//     {
//       id: '3',
//       groupName: 'Wedding Fund',
//       amount: 100,
//       dueDate: '2025-12-15',
//       status: 'scheduled',
//       frequency: 'Weekly',
//     },
//   ];

//   const handleTopUpComplete = (amount: number, method: string) => {
//     console.log(`Wallet topped up with GHS ${amount} via ${method}`);
//   };

//   return (
//     <div className="space-y-6 mb-18 md:mb-0">
//       {/* Total Savings Card */}
//       <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-[16px] md:text-[20px] font-medium">
//               Total Savings
//             </CardTitle>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="text-white hover:bg-white/20"
//               onClick={() => setShowBalance(!showBalance)}
//             >
//               {showBalance ? (
//                 <Eye className="h-5 w-5" />
//               ) : (
//                 <EyeOff className="h-5 w-5" />
//               )}
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div>
//               <div className="text-4xl mb-2">
//                 {showBalance ? `₵${totalSavings.toFixed(2)}` : '₵•••••'}
//               </div>
//               <div className="flex items-center gap-2 text-white/90">
//                 <TrendingUp className="h-4 w-4" />
//                 <span className="text-sm">{growthText}</span>
//               </div>
//             </div>

//             {savingsExpanded && (
//               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 animate-in slide-in-from-top">
//                 <div>
//                   <div className="text-sm text-white/80 mb-1">Individual</div>
//                   <div className="text-xl">₵{individualSavings.toFixed(2)}</div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-white/80 mb-1">Groups</div>
//                   <div className="text-xl">₵{groupSavings.toFixed(2)}</div>
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-2 pt-4 border-t border-white/20">
//               <Button
//                 variant="secondary"
//                 className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//                 onClick={() => setSavingsExpanded(!savingsExpanded)}
//               >
//                 {savingsExpanded ? 'Hide' : 'Show'} Details
//               </Button>
//               <Button
//                 variant="secondary"
//                 className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
//                 onClick={() => setIsCashOutOpen(true)}
//               >
//                 <DollarSign className="h-4 w-4 mr-2" />
//                 Cash Out
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Quick Actions – kept very close to original */}
//       <div>
//         <h3 className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
//           Quick Actions
//         </h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {quickActions.map((action, index) => {
//             const Icon = action.icon;
//             return (
//               <button
//                 key={index}
//                 onClick={action.onClick}
//                 className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md group bg-card"
//               >
//                 <div
//                   className={cn(
//                     'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
//                     action.bgColor,
//                   )}
//                 >
//                   <Icon className={cn('h-7 w-7', action.color)} />
//                 </div>
//                 <span className="text-sm text-center font-medium text-foreground">
//                   {action.label}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Savings Groups */}
//         <div className="lg:col-span-2 space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//               Your Savings Groups
//             </h3>
//             {savingsGroups.length > 0 && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-primary hover:text-primary/90"
//               >
//                 View All
//               </Button>
//             )}
//           </div>

//           {savingsGroups.length > 0 ? (
//             savingsGroups.map((group, index) => (
//               <Card
//                 key={index}
//                 className="hover:shadow-md transition-shadow bg-card border-border"
//               >
//                 <Card
//                   key={index}
//                   className="hover:shadow-md transition-shadow bg-card border-border"
//                 >
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <CardTitle className="text-lg font-medium text-foreground">
//                           {group.name}
//                         </CardTitle>
//                         <CardDescription>
//                           {group.members} members
//                         </CardDescription>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-sm text-muted-foreground">
//                           Total Saved
//                         </div>
//                         <div className="text-lg font-semibold text-foreground">
//                           ₵{group.totalSaved.toLocaleString()}
//                         </div>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-5">
//                     <div>
//                       <div className="flex items-center justify-between text-sm mb-2">
//                         <span className="text-muted-foreground">Progress</span>
//                         <span className="font-medium">{group.progress}%</span>
//                       </div>
//                       <Progress
//                         value={group.progress}
//                         className="h-2 dark:bg-gray-500"
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-6 text-sm">
//                       <div>
//                         <div className="text-muted-foreground mb-1">
//                           Your Contribution
//                         </div>
//                         <div className="font-medium text-foreground">
//                           ₵{group.yourContribution.toLocaleString()}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-muted-foreground mb-1">
//                           Next Payout
//                         </div>
//                         <div className="text-primary font-medium">
//                           {group.nextPayout}
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Card>
//             ))
//           ) : (
//             <Card className="border-dashed border-2 bg-muted/10">
//               <CardContent className="flex flex-col items-center justify-center py-12 text-center">
//                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
//                   <Users className="h-8 w-8 text-primary" />
//                 </div>
//                 <h4 className="text-lg font-semibold text-foreground">
//                   No groups yet
//                 </h4>
//                 <p className="text-sm text-muted-foreground max-w-70 mb-6">
//                   Join a savings circle or create your own to start saving with
//                   others.
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Recent Activity */}
//         <div className="space-y-4">
//           <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//             Recent Activity
//           </h3>
//           <Card className="bg-card border-border">
//             <CardContent className="p-0">
//               {recentActivity.map((activity, index) => (
//                 <div
//                   key={index}
//                   className={cn(
//                     'p-4',
//                     index < recentActivity.length - 1 &&
//                       'border-b border-border',
//                   )}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div
//                       className={cn(
//                         'p-2.5 rounded-lg',
//                         activity.type === 'contribution'
//                           ? 'bg-primary/10'
//                           : 'bg-teal-500/10 dark:bg-teal-900/30',
//                       )}
//                     >
//                       {activity.type === 'contribution' ? (
//                         <ArrowUpRight className="h-5 w-5 text-primary" />
//                       ) : (
//                         <ArrowDownRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium text-foreground truncate">
//                         {activity.group}
//                       </div>
//                       <div className="text-xs text-muted-foreground mt-0.5">
//                         {activity.date}
//                       </div>
//                     </div>
//                     <div
//                       className={cn(
//                         'text-sm font-medium',
//                         activity.type === 'contribution'
//                           ? 'text-primary'
//                           : 'text-teal-600 dark:text-teal-400',
//                       )}
//                     >
//                       {activity.type === 'contribution' ? '-' : '+'}₵
//                       {activity.amount}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Financial Goals Preview */}
//       <Card className="bg-card border-border">
//         <CardHeader className="pb-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//                 Financial Goals
//               </CardTitle>
//               <CardDescription className="text-[14px] text-muted-foreground">
//                 Track your personal savings targets
//               </CardDescription>
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => onNavigate('Goals')}
//             >
//               <Target className="h-4 w-4 mr-2" />
//               {goals.length > 0 ? 'View All' : 'Add Goal'}
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {goals.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {goals.map((goal, index) => (
//                 <div
//                   key={index}
//                   className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card"
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <span className="text-sm font-medium text-foreground">
//                       {goal.name}
//                     </span>
//                     <span className="text-xs text-muted-foreground">
//                       {goal.progress}%
//                     </span>
//                   </div>
//                   <Progress
//                     value={goal.progress}
//                     className="h-2 mb-3 dark:bg-gray-500"
//                   />
//                   <div className="text-xs text-muted-foreground">
//                     ₵{goal.saved.toLocaleString()} of ₵
//                     {goal.target.toLocaleString()}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-8 text-center">
//               <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
//                 <Target className="h-6 w-6 text-primary/60" />
//               </div>
//               <p className="text-sm text-muted-foreground mb-4">
//                 You haven&apos;t set any personal financial goals yet.
//               </p>
//               <p className="text-primary p-0 h-auto">
//                 Click the{' '}
//                 <span className="font-bold">&quot;Add Goal&quot;</span> button
//                 to set your first goal.
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Scheduled Contributions & Wallet Balance */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <div className="flex items-center gap-3">
//               <Calendar className="h-5 w-5 text-primary" />
//               <div>
//                 <CardTitle className="text-lg md:text-xl font-medium text-foreground">
//                   Scheduled Contributions
//                 </CardTitle>
//                 <CardDescription className="text-muted-foreground">
//                   Auto-deduction from wallet
//                 </CardDescription>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {scheduledContributions.map((contribution) => (
//               <div
//                 key={contribution.id}
//                 className="p-4 rounded-lg border border-border bg-muted/30"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="font-medium text-foreground">
//                     {contribution.groupName}
//                   </span>
//                   <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
//                     <Clock className="h-3 w-3" />
//                     {contribution.status}
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="text-muted-foreground">
//                     <span className="text-primary font-medium">
//                       GHS {contribution.amount}
//                     </span>{' '}
//                     • {contribution.frequency}
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     {new Date(contribution.dueDate).toLocaleDateString(
//                       'en-US',
//                       {
//                         month: 'short',
//                         day: 'numeric',
//                       },
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div className="pt-3 border-t border-border">
//               <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
//                 <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
//                 <div className="text-sm text-primary/90">
//                   <p className="font-medium mb-1">Auto-Deduction Active</p>
//                   <p>
//                     Contributions will be automatically deducted from your
//                     wallet on due dates. Ensure sufficient balance to avoid
//                     missed payments.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Wallet Balance */}
//         <Card className="bg-linear-to-br from-purple-500 to-indigo-600 text-white">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Wallet className="h-5 w-5" />
//                 <CardTitle>Wallet Balance</CardTitle>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="text-white hover:bg-white/20"
//                 onClick={() => setShowBalance(!showBalance)}
//               >
//                 {showBalance ? (
//                   <Eye className="h-5 w-5" />
//                 ) : (
//                   <EyeOff className="h-5 w-5" />
//                 )}
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div>
//                 <div className="text-4xl mb-2">
//                   {showBalance
//                     ? `GHS ${walletBalance.toFixed(2)}`
//                     : 'GHS •••••'}
//                 </div>
//                 <div className="text-sm text-white/80">
//                   Available for auto-deductions
//                 </div>
//               </div>
//               <div className="pt-4 border-t border-white/20">
//                 <div className="text-sm text-white/80 mb-2">
//                   Upcoming Deductions
//                 </div>
//                 <div className="text-2xl mb-1">
//                   GHS{' '}
//                   {scheduledContributions
//                     .reduce((sum, c) => sum + c.amount, 0)
//                     .toFixed(2)}
//                 </div>
//                 <div className="text-xs text-white/70">
//                   Total from {scheduledContributions.length} scheduled
//                   contributions
//                 </div>
//               </div>
//               {walletBalance >=
//               scheduledContributions.reduce((sum, c) => sum + c.amount, 0) ? (
//                 <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-300/30 rounded-lg">
//                   <CheckCircle2 className="h-4 w-4 text-green-200 shrink-0 mt-0.5" />
//                   <div className="text-xs text-green-50">
//                     <p className="font-semibold mb-1">Sufficient Balance</p>
//                     <p>
//                       Your wallet has enough funds for upcoming contributions
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-start gap-2 p-3 bg-amber-500/20 border border-amber-300/30 rounded-lg">
//                   <AlertCircle className="h-4 w-4 text-amber-200 shrink-0 mt-0.5" />
//                   <div className="text-xs text-amber-50">
//                     <p className="font-semibold mb-1">Low Balance</p>
//                     <p>Top up to avoid missed contributions</p>
//                   </div>
//                 </div>
//               )}
//               <div className="flex gap-2 pt-2">
//                 <Button
//                   variant="secondary"
//                   className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
//                   onClick={() => setIsTopUpOpen(true)}
//                 >
//                   <Wallet className="h-4 w-4 mr-2" />
//                   Top Up Wallet
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Modals */}
//       <CreateGroupModal
//         isOpen={isCreateGroupOpen}
//         onClose={() => setIsCreateGroupOpen(false)}
//         onComplete={(groupData) => console.log('Group created:', groupData)}
//       />
//       <JoinGroupModal
//         isOpen={isJoinGroupOpen}
//         onClose={() => setIsJoinGroupOpen(false)}
//       />
//       <CashOutModal
//         isOpen={isCashOutOpen}
//         onClose={() => setIsCashOutOpen(false)}
//         availableBalance={totalSavings}
//         payoutAccount={{
//           provider: 'MTN Momo',
//           number: '024 XXX XXXX',
//           name: 'Kwame Asante',
//         }}
//       />
//       <TopUpWalletModal
//         isOpen={isTopUpOpen}
//         onClose={() => setIsTopUpOpen(false)}
//         onComplete={handleTopUpComplete}
//         currentBalance={walletBalance}
//       />
//     </div>
//   );
// }
