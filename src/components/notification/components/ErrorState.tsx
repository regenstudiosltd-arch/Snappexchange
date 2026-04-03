// src/components/notification/components/ErrorState.tsx

import { RefreshCw, XCircle } from 'lucide-react';

interface ErrorStateProps {
  onRefresh: () => void;
}

export function ErrorState({ onRefresh }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 p-4 mb-4">
        <XCircle className="h-7 w-7 text-rose-400" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">
        Could not load notifications
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Check your connection and try again.
      </p>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
