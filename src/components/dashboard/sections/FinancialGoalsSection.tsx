// src/components/dashboard/sections/FinancialGoalsSection.tsx

'use client';

import { useMemo } from 'react';
import { Target } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Progress } from '@/src/components/ui/progress';

import type { GoalsDashboardResponse } from '@/src/types/dashboard';

interface FinancialGoalsSectionProps {
  goalsData: GoalsDashboardResponse | undefined;
  onNavigate: (page: string) => void;
}

interface NormalizedGoal {
  name: string;
  target: number;
  saved: number;
  progress: number;
}

function normalizeGoals(
  goalsData: GoalsDashboardResponse | undefined,
): NormalizedGoal[] {
  return (goalsData?.goals ?? []).map((g) => ({
    name: g.name,
    target: Number(g.target_amount),
    saved: Number(g.current_saved),
    progress: g.progress_percentage,
  }));
}

export function FinancialGoalsSection({
  goalsData,
  onNavigate,
}: FinancialGoalsSectionProps) {
  const goals = useMemo(() => normalizeGoals(goalsData), [goalsData]);

  return (
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
            {goals.map((goal) => (
              <div
                key={goal.name}
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
              Click the <span className="font-bold">&quot;Add Goal&quot;</span>{' '}
              button to set your first goal.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
