// src/components/dashboard/sections/ScheduledContributionSection/component/EmptyState.tsx

import { Calendar, Zap, Users } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import type { ScheduledContributionsProps } from '@/src/types/dashboard';

interface EmptyStateProps {
  onNavigate?: ScheduledContributionsProps['onNavigate'];
}

export function EmptyState({ onNavigate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
          <Calendar className="h-7 w-7 text-primary/50" />
        </div>
        <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
          <Zap className="h-3 w-3 text-primary/60" />
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground tracking-tight">
        No contributions scheduled
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-50 leading-relaxed">
        Join a savings group and your payment schedule will appear here.
      </p>
      {onNavigate && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 gap-2 rounded-xl h-8 text-xs font-medium"
          onClick={() => onNavigate('Groups')}
        >
          <Users className="h-3.5 w-3.5" />
          Browse Groups
        </Button>
      )}
    </div>
  );
}
