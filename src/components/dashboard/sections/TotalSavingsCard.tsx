// src/components/dashboard/sections/TotalSavingsCard.tsx

'use client';

import { Eye, EyeOff, TrendingUp, DollarSign } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface TotalSavingsCardProps {
  totalSavings: number;
  growthText: string;
  individualSavings: number;
  groupSavings: number;
  showBalance: boolean;
  onToggleBalance: () => void;
  onCashOut: () => void;
  savingsExpanded: boolean;
  onToggleExpanded: () => void;
}

export function TotalSavingsCard({
  totalSavings,
  growthText,
  individualSavings,
  groupSavings,
  showBalance,
  onToggleBalance,
  onCashOut,
  savingsExpanded,
  onToggleExpanded,
}: TotalSavingsCardProps) {
  return (
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
              onClick={onToggleExpanded}
            >
              {savingsExpanded ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="secondary"
              className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
              onClick={onCashOut}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Cash Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
