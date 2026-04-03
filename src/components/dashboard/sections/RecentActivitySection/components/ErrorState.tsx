// src/components/dashboard/sections/RecentActivitySection/components/ErrorState.tsx

import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/src/components/ui/button';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-4 px-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 ring-1 ring-rose-200 dark:ring-rose-500/20 flex items-center justify-center">
        <AlertCircle className="h-5 w-5 text-rose-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          Couldn&apos;t load activity
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Check your connection and try again
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="gap-2 rounded-xl h-8 text-xs "
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );
}
