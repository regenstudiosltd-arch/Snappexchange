'use client';

import { useState } from 'react';
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
  const [walletBalance, setWalletBalance] = useState(850);

  const totalSavings = 7150;
  const individualSavings = 1500;
  const groupSavings = 5650;

  // Scheduled contributions for auto-deduction
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
    setWalletBalance((prev) => prev + amount);
    console.log(`Wallet topped up with GHS ${amount} via ${method}`);
  };

  const quickActions = [
    {
      icon: PlusCircle,
      label: 'Create Group',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
      onClick: () => setIsCreateGroupOpen(true),
    },
    {
      icon: Users,
      label: 'Join Group',
      color: 'text-teal-600',
      bgColor: 'bg-teal-500/10',
      onClick: () => setIsJoinGroupOpen(true),
    },
    {
      icon: Lightbulb,
      label: 'AI Tips',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
      onClick: () => onNavigate('AI Assistant'),
    },
    {
      icon: Bot,
      label: 'Chat Bot',
      color: 'text-teal-600',
      bgColor: 'bg-teal-500/10',
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

  const savingsGroups = [
    {
      name: 'Family Savings Circle',
      members: 8,
      totalSaved: 16000,
      yourContribution: 2000,
      nextPayout: '5 days',
      progress: 65,
    },
    {
      name: 'Business Partners',
      members: 12,
      totalSaved: 45000,
      yourContribution: 3750,
      nextPayout: '12 days',
      progress: 80,
    },
    {
      name: 'Wedding Fund',
      members: 6,
      totalSaved: 8400,
      yourContribution: 1400,
      nextPayout: '2 days',
      progress: 45,
    },
  ];

  return (
    <div className="space-y-6">
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
                <span className="text-sm">+12.5% from last month</span>
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

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-[16px] md:text-[24px] font-medium">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 hover:border-cyan-500 transition-all hover:shadow-lg group"
              >
                <div
                  className={`w-14 h-14 rounded-full ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-7 w-7 ${action.color}`} />
                </div>
                <span className="text-sm text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Groups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] md:text-[24px] font-medium">
              Your Savings Groups
            </h3>
            <Button variant="ghost" size="sm" className="text-cyan-600">
              View All
            </Button>
          </div>

          {savingsGroups.map((group, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-[16px] md:text-[20px] font-medium">
                      {group.name}
                    </CardTitle>
                    <CardDescription>{group.members} members</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Total Saved
                    </div>
                    <div className="text-lg">
                      ₵{group.totalSaved.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{group.progress}%</span>
                  </div>
                  <Progress value={group.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">
                      Your Contribution
                    </div>
                    <div>₵{group.yourContribution.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">
                      Next Payout
                    </div>
                    <div className="text-teal-600">{group.nextPayout}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-[16px] md:text-[24px] font-medium">
            Recent Activity
          </h3>
          <Card>
            <CardContent className="p-0">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`p-4 ${
                    index < recentActivity.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === 'contribution'
                          ? 'bg-cyan-500/10'
                          : 'bg-teal-500/10'
                      }`}
                    >
                      {activity.type === 'contribution' ? (
                        <ArrowUpRight
                          className={`h-4 w-4 ${
                            activity.type === 'contribution'
                              ? 'text-cyan-600'
                              : 'text-teal-600'
                          }`}
                        />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{activity.group}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.date}
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        activity.type === 'contribution'
                          ? 'text-cyan-600'
                          : 'text-teal-600'
                      }`}
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[16px] md:text-[20px] font-medium">
                Financial Goals
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Track your personal savings targets
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('Goals')}
            >
              <Target className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Emergency Fund',
                target: 5000,
                saved: 3200,
                progress: 64,
              },
              { name: 'New Laptop', target: 3000, saved: 2100, progress: 70 },
              { name: 'Vacation', target: 4000, saved: 1200, progress: 30 },
            ].map((goal, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border hover:border-cyan-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">{goal.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {goal.progress}%
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2 mb-2" />
                <div className="text-xs text-muted-foreground">
                  ₵{goal.saved.toLocaleString()} of ₵
                  {goal.target.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Contributions & Wallet Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Contributions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-600" />
              <div>
                <CardTitle className="text-[16px] md:text-[20px] font-medium">
                  Scheduled Contributions
                </CardTitle>
                <CardDescription className="text-md text-muted-foreground">
                  Auto-deduction from wallet
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="p-3 rounded-lg border bg-linear-to-r from-cyan-50 to-teal-50 border-cyan-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {contribution.groupName}
                  </span>
                  <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    {contribution.status}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-cyan-600 font-semibold">
                      GHS {contribution.amount}
                    </span>{' '}
                    • {contribution.frequency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(contribution.dueDate).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-1">Auto-Deduction Active</p>
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

              {/* Upcoming Deductions */}
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

              {/* Balance Status */}
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
        onComplete={(groupData) => {
          console.log('Group created:', groupData);
        }}
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
