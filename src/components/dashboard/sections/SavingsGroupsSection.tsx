// src/components/dashboard/sections/SavingsGroupsSection.tsx

'use client';

import { useMemo } from 'react';
import { Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Progress } from '@/src/components/ui/progress';

import type { JoinedGroup } from '@/src/types/dashboard';

interface SavingsGroupsSectionProps {
  groups: JoinedGroup[];
}

interface NormalizedGroup {
  name: string;
  members: number;
  totalSaved: number;
  yourContribution: number;
  nextPayout: string;
  progress: number;
}

function normalizeGroups(groups: JoinedGroup[]): NormalizedGroup[] {
  return groups.map((g) => ({
    name: g.group_name,
    members: g.current_members,
    totalSaved: Number(g.total_saved),
    yourContribution: Number(g.user_total_contribution),
    nextPayout: `${g.next_payout_days ?? 0} days`,
    progress: g.progress_percentage,
  }));
}

export function SavingsGroupsSection({ groups }: SavingsGroupsSectionProps) {
  const savingsGroups = useMemo(() => normalizeGroups(groups), [groups]);

  return (
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
        savingsGroups.map((group) => (
          <Card
            key={group.name}
            className="hover:shadow-md transition-shadow bg-card border-border"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-foreground">
                    {group.name}
                  </CardTitle>
                  <CardDescription>{group.members} members</CardDescription>
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
                  <div className="text-muted-foreground mb-1">Next Payout</div>
                  <div className="text-primary font-medium">
                    {group.nextPayout}
                  </div>
                </div>
              </div>
            </CardContent>
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
  );
}
