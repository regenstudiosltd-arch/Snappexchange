'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  PlusCircle,
  Target,
  Bot,
  Lightbulb,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { CreateGroupModal } from '../modals/CreateGroupModal';
import { CashOutModal } from '../modals/CashOutModal';
import { JoinGroupModal } from '../modals/JoinGroupModal';
import { TopUpWalletModal } from '../modals/TopUpWalletModal';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';

interface DashboardResponse {
  total_savings: string | number;
  growth_text: string;
  joined_groups: Array<{
    id: number;
    group_name: string;
    current_members: number;
    next_payout_days: number | null;
    user_total_contribution: string | number;
    total_saved: string | number;
    progress_percentage: number;
    contribution_amount: string | number;
    frequency: string;
  }>;
}

interface GoalsDashboardResponse {
  total_saved: string | number;
  goals: Array<{
    id: number;
    name: string;
    target_amount: string | number;
    current_saved: string | number;
    progress_percentage: number;
  }>;
}

interface DashboardHomeEnhancedProps {
  onNavigate: (page: string) => void;
}

export function DashboardHomeEnhanced({
  onNavigate,
}: DashboardHomeEnhancedProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [savingsExpanded, setSavingsExpanded] = useState(false);
  const [walletBalance] = useState(850);

  const { data: dashboardData } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: authService.dashboard,
    staleTime: 1000 * 60 * 5,
  });

  const { data: goalsData } = useQuery<GoalsDashboardResponse>({
    queryKey: ['goals-dashboard'],
    queryFn: authService.goalsDashboard,
    staleTime: 1000 * 60 * 5,
  });

  const totalSavings = dashboardData?.total_savings
    ? Number(dashboardData.total_savings)
    : 0;

  const growthText = dashboardData?.growth_text || '+0.0% from last month';

  const groupSavings = (dashboardData?.joined_groups || []).reduce(
    (sum, g) => sum + Number(g.user_total_contribution || 0),
    0,
  );
  const individualSavings = goalsData?.total_saved
    ? Number(goalsData.total_saved)
    : 0;

  // Savings Groups
  const savingsGroups = (dashboardData?.joined_groups || []).map((g) => ({
    name: g.group_name,
    members: g.current_members,
    totalSaved: Number(g.total_saved),
    yourContribution: Number(g.user_total_contribution),
    nextPayout: `${g.next_payout_days ?? 0} days`,
    progress: g.progress_percentage,
  }));

  // Financial Goals
  const goals = (goalsData?.goals || []).map((g) => ({
    name: g.name,
    target: Number(g.target_amount),
    saved: Number(g.current_saved),
    progress: g.progress_percentage,
  }));

  const quickActions = [
    {
      icon: PlusCircle,
      label: 'Create Group',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: () => setIsCreateGroupOpen(true),
    },
    {
      icon: Users,
      label: 'Join Group',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: () => setIsJoinGroupOpen(true),
    },
    {
      icon: Lightbulb,
      label: 'AI Tips',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: () => onNavigate('AI Assistant'),
    },
    {
      icon: Bot,
      label: 'Chat Bot',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: () => onNavigate('Bot Integration'),
    },
  ];

  const recentActivity = [
    {
      type: 'contribution',
      group: 'Family Savings Circle',
      amount: 200,
      date: '2 hours ago',
      status: 'completed',
    },
    {
      type: 'payout',
      group: 'Business Partners',
      amount: 1500,
      date: '1 day ago',
      status: 'completed',
    },
    {
      type: 'contribution',
      group: 'Wedding Fund',
      amount: 300,
      date: '2 days ago',
      status: 'completed',
    },
  ];

  const scheduledContributions = [
    {
      id: '1',
      groupName: 'Family Savings Circle',
      amount: 200,
      dueDate: '2025-12-10',
      status: 'scheduled',
      frequency: 'Monthly',
    },
    {
      id: '2',
      groupName: 'Business Partners',
      amount: 150,
      dueDate: '2025-12-12',
      status: 'scheduled',
      frequency: 'Bi-weekly',
    },
    {
      id: '3',
      groupName: 'Wedding Fund',
      amount: 100,
      dueDate: '2025-12-15',
      status: 'scheduled',
      frequency: 'Weekly',
    },
  ];

  const handleTopUpComplete = (amount: number, method: string) => {
    console.log(`Wallet topped up with GHS ${amount} via ${method}`);
  };

  return (
    <div className="space-y-6 mb-18 md:mb-0">
      {/* Total Savings Card */}
      <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[16px] md:text-[20px] font-medium">
              Total Savings
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl mb-2">
                {showBalance ? `₵${totalSavings.toFixed(2)}` : '₵•••••'}
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">{growthText}</span>
              </div>
            </div>

            {savingsExpanded && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 animate-in slide-in-from-top">
                <div>
                  <div className="text-sm text-white/80 mb-1">Individual</div>
                  <div className="text-xl">₵{individualSavings.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-white/80 mb-1">Groups</div>
                  <div className="text-xl">₵{groupSavings.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-white/20">
              <Button
                variant="secondary"
                className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
                onClick={() => setSavingsExpanded(!savingsExpanded)}
              >
                {savingsExpanded ? 'Hide' : 'Show'} Details
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
                onClick={() => setIsCashOutOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Cash Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions – kept very close to original */}
      <div>
        <h3 className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md group bg-card"
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
                    action.bgColor,
                  )}
                >
                  <Icon className={cn('h-7 w-7', action.color)} />
                </div>
                <span className="text-sm text-center font-medium text-foreground">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Groups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground">
              Your Savings Groups
            </h3>
            {savingsGroups.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/90"
              >
                View All
              </Button>
            )}
          </div>

          {savingsGroups.length > 0 ? (
            savingsGroups.map((group, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow bg-card border-border"
              >
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow bg-card border-border"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-medium text-foreground">
                          {group.name}
                        </CardTitle>
                        <CardDescription>
                          {group.members} members
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Total Saved
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          ₵{group.totalSaved.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{group.progress}%</span>
                      </div>
                      <Progress
                        value={group.progress}
                        className="h-2 dark:bg-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">
                          Your Contribution
                        </div>
                        <div className="font-medium text-foreground">
                          ₵{group.yourContribution.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">
                          Next Payout
                        </div>
                        <div className="text-primary font-medium">
                          {group.nextPayout}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">
                  No groups yet
                </h4>
                <p className="text-sm text-muted-foreground max-w-70 mb-6">
                  Join a savings circle or create your own to start saving with
                  others.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
            Recent Activity
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4',
                    index < recentActivity.length - 1 &&
                      'border-b border-border',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-2.5 rounded-lg',
                        activity.type === 'contribution'
                          ? 'bg-primary/10'
                          : 'bg-teal-500/10 dark:bg-teal-900/30',
                      )}
                    >
                      {activity.type === 'contribution' ? (
                        <ArrowUpRight className="h-5 w-5 text-primary" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {activity.group}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {activity.date}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        activity.type === 'contribution'
                          ? 'text-primary'
                          : 'text-teal-600 dark:text-teal-400',
                      )}
                    >
                      {activity.type === 'contribution' ? '-' : '+'}₵
                      {activity.amount}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Goals Preview */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl font-medium text-foreground">
                Financial Goals
              </CardTitle>
              <CardDescription className="text-[14px] text-muted-foreground">
                Track your personal savings targets
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('Goals')}
            >
              <Target className="h-4 w-4 mr-2" />
              {goals.length > 0 ? 'View All' : 'Add Goal'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map((goal, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {goal.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress
                    value={goal.progress}
                    className="h-2 mb-3 dark:bg-gray-500"
                  />
                  <div className="text-xs text-muted-foreground">
                    ₵{goal.saved.toLocaleString()} of ₵
                    {goal.target.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You haven&apos;t set any personal financial goals yet.
              </p>
              <p className="text-primary p-0 h-auto">
                Click the{' '}
                <span className="font-bold">&quot;Add Goal&quot;</span> button
                to set your first goal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Contributions & Wallet Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg md:text-xl font-medium text-foreground">
                  Scheduled Contributions
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Auto-deduction from wallet
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">
                    {contribution.groupName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    {contribution.status}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-primary font-medium">
                      GHS {contribution.amount}
                    </span>{' '}
                    • {contribution.frequency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(contribution.dueDate).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                      },
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-primary/90">
                  <p className="font-medium mb-1">Auto-Deduction Active</p>
                  <p>
                    Contributions will be automatically deducted from your
                    wallet on due dates. Ensure sufficient balance to avoid
                    missed payments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Balance */}
        <Card className="bg-linear-to-br from-purple-500 to-indigo-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <CardTitle>Wallet Balance</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-4xl mb-2">
                  {showBalance
                    ? `GHS ${walletBalance.toFixed(2)}`
                    : 'GHS •••••'}
                </div>
                <div className="text-sm text-white/80">
                  Available for auto-deductions
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <div className="text-sm text-white/80 mb-2">
                  Upcoming Deductions
                </div>
                <div className="text-2xl mb-1">
                  GHS{' '}
                  {scheduledContributions
                    .reduce((sum, c) => sum + c.amount, 0)
                    .toFixed(2)}
                </div>
                <div className="text-xs text-white/70">
                  Total from {scheduledContributions.length} scheduled
                  contributions
                </div>
              </div>
              {walletBalance >=
              scheduledContributions.reduce((sum, c) => sum + c.amount, 0) ? (
                <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-300/30 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-200 shrink-0 mt-0.5" />
                  <div className="text-xs text-green-50">
                    <p className="font-semibold mb-1">Sufficient Balance</p>
                    <p>
                      Your wallet has enough funds for upcoming contributions
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-amber-500/20 border border-amber-300/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-200 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-50">
                    <p className="font-semibold mb-1">Low Balance</p>
                    <p>Top up to avoid missed contributions</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => setIsTopUpOpen(true)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Top Up Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
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
          name: 'Kwame Asante',
        }}
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
