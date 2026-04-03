// src/components/dashboard/sections/WalletBalanceCard.tsx

'use client';

import { Eye, EyeOff, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

import type { ScheduledContributionsCache } from '@/src/types/dashboard';

interface WalletBalanceCardProps {
  showBalance: boolean;
  onToggleBalance: () => void;
  onTopUp: () => void;
}

export function WalletBalanceCard({
  showBalance,
  onToggleBalance,
  onTopUp,
}: WalletBalanceCardProps) {
  // Read directly from the query cache — no queryFn needed, no extra API call.
  // ScheduledContributions component populates this cache entry.
  const queryClient = useQueryClient();
  const scheduledData = queryClient.getQueryData<ScheduledContributionsCache>([
    'scheduled-contributions',
  ]);

  const walletBalance = parseFloat(scheduledData?.wallet_balance ?? '0');
  const totalUpcoming = parseFloat(scheduledData?.total_upcoming_amount ?? '0');
  const scheduledCount =
    scheduledData?.contributions.filter((c) => c.status !== 'completed')
      .length ?? 0;
  const hasSufficientBalance = walletBalance >= totalUpcoming;

  return (
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
            onClick={onToggleBalance}
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
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
              {showBalance ? `GHS ${walletBalance.toFixed(2)}` : 'GHS •••••'}
            </div>
            <div className="text-sm text-white/80">
              Available for auto-deductions
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <div className="text-sm text-white/80 mb-2">
              Upcoming Deductions
            </div>
            <div className="text-2xl mb-1">GHS {totalUpcoming.toFixed(2)}</div>
            <div className="text-xs text-white/70">
              Total from {scheduledCount} scheduled contribution
              {scheduledCount !== 1 ? 's' : ''}
            </div>
          </div>

          {hasSufficientBalance ? (
            <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-300/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-200 shrink-0 mt-0.5" />
              <div className="text-xs text-green-50">
                <p className="font-semibold mb-1">Sufficient Balance</p>
                <p>Your wallet has enough funds for upcoming contributions</p>
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
              onClick={onTopUp}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Top Up Wallet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
