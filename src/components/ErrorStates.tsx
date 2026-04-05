'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowLeft, WifiOff, Target } from 'lucide-react';
import { cn } from './ui/utils';

// Shared

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 32 C8 18.7 18.7 8 32 8 C45.3 8 56 18.7 56 32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="opacity-15"
      />
      <path
        d="M16 32 C16 23.2 23.2 16 32 16 C40.8 16 48 23.2 48 32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="opacity-30"
      />
      <path
        d="M24 32 C24 27.6 27.6 24 32 24 C36.4 24 40 27.6 40 32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="opacity-60"
      />
      <circle
        cx="32"
        cy="40"
        r="3.5"
        fill="currentColor"
        className="opacity-80"
      />
      <line
        x1="14"
        y1="14"
        x2="50"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-70"
      />
    </svg>
  );
}

// GroupsPage

interface GroupsPageErrorProps {
  onRetry: () => void;
}

export function GroupsPageError({ onRetry }: GroupsPageErrorProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden px-8 py-12 text-center',
        'bg-card ring-1 ring-border',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* Dot grid texture */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 pointer-events-none',
          '[background-image:radial-linear(rgba(0,0,0,0.04)_1px,transparent_1px)]',
          'dark:[background-image:radial-linear(rgba(255,255,255,0.03)_1px,transparent_1px)]',
          'bg-size-[20px_20px]',
        )}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/60 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-5 max-w-sm mx-auto">
        {/* Icon tile */}
        <div
          className={cn(
            'h-16 w-16 rounded-2xl flex items-center justify-center',
            'bg-linear-to-br from-cyan-500/10 to-teal-600/10',
            'ring-1 ring-cyan-500/25',
          )}
        >
          <WifiOff
            className="h-7 w-7 text-cyan-600 dark:text-cyan-400"
            strokeWidth={1.5}
          />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Something went wrong on our end
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t load your groups right now. This is a problem on
            our side, not yours. Give it a moment and try again.
          </p>
        </div>

        {/* Retry CTA */}
        <button
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
            'text-sm font-semibold text-white transition-all duration-150',
            'bg-linear-to-r from-cyan-500 to-teal-600',
            'hover:opacity-90 active:scale-[0.97]',
            'shadow-[0_2px_10px_rgba(6,182,212,0.35)]',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
          Refresh page
        </button>

        <p className="text-[11px] text-muted-foreground/60">
          If this keeps happening, our team is already on it.
        </p>
      </div>
    </div>
  );
}

// GoalsPage

interface GoalsPageErrorProps {
  onRetry: () => void;
}

export function GoalsPageError({ onRetry }: GoalsPageErrorProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden px-8 py-12 text-center',
        'bg-card ring-1 ring-border',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* Dot grid texture */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 pointer-events-none',
          '[background-image:radial-linear(rgba(0,0,0,0.04)_1px,transparent_1px)]',
          'dark:[background-image:radial-linear(rgba(255,255,255,0.03)_1px,transparent_1px)]',
          'bg-size-[20px_20px]',
        )}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/60 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-5 max-w-sm mx-auto">
        {/* Icon tile */}
        <div
          className={cn(
            'h-16 w-16 rounded-2xl flex items-center justify-center',
            'bg-linear-to-br from-cyan-500/10 to-teal-600/10',
            'ring-1 ring-cyan-500/25',
          )}
        >
          <Target
            className="h-7 w-7 text-cyan-600 dark:text-cyan-400"
            strokeWidth={1.5}
          />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            We couldn&apos;t load your goals
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            There was a problem on our end syncing your goals — not anything
            you&apos;ve done. Your data is safe. Give it a moment and try again.
          </p>
        </div>

        {/* Retry CTA */}
        <button
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
            'text-sm font-semibold text-white transition-all duration-150',
            'bg-linear-to-r from-cyan-500 to-teal-600',
            'hover:opacity-90 active:scale-[0.97]',
            'shadow-[0_2px_10px_rgba(6,182,212,0.35)]',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
          Try again
        </button>

        <p className="text-[11px] text-muted-foreground/60">
          If this keeps happening, our team is already on it.
        </p>
      </div>
    </div>
  );
}

// GroupDetailPage

export function GroupDetailError() {
  const router = useRouter();

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-6',
        'bg-background',
        '[background-image:radial-linear(rgba(0,0,0,0.045)_1px,transparent_1px)]',
        'dark:[background-image:radial-linear(rgba(255,255,255,0.03)_1px,transparent_1px)]',
        'bg-size-[24px_24px]',
      )}
    >
      <div className="w-full max-w-md">
        <div
          className={cn(
            'rounded-2xl overflow-hidden',
            'bg-card ring-1 ring-border',
            'shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_24px_60px_-12px_rgba(0,0,0,0.1)]',
            'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_-16px_rgba(0,0,0,0.55)]',
          )}
        >
          {/* Brand strip */}
          <div className="h-1 bg-linear-to-r from-cyan-500 to-teal-600" />

          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center gap-6">
            {/* Illustration */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl scale-150"
              />
              <div
                className={cn(
                  'relative h-20 w-20 rounded-2xl flex items-center justify-center',
                  'bg-linear-to-br from-cyan-500/12 to-teal-600/12',
                  'ring-1 ring-cyan-500/25',
                )}
              >
                <SignalIcon className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">
                Server error
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                This one&apos;s on us
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">
                We ran into a problem loading this group. Your data is safe. We
                just couldn&apos;t reach it right now. Please refresh and try
                again.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-border" />

            {/* Actions */}
            <div className="w-full space-y-2.5">
              {/* Primary */}
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  'w-full h-12 rounded-xl flex items-center justify-center gap-2',
                  'text-sm font-semibold text-white transition-all duration-150',
                  'bg-linear-to-r from-cyan-500 to-teal-600',
                  'hover:opacity-90 active:scale-[0.98]',
                  'shadow-[0_2px_12px_rgba(6,182,212,0.4)]',
                )}
              >
                <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
                Refresh page
              </button>

              {/* Secondary */}
              <button
                onClick={() => router.back()}
                className={cn(
                  'w-full h-11 rounded-xl flex items-center justify-center gap-2',
                  'text-sm font-medium transition-all duration-150',
                  'bg-muted text-muted-foreground ring-1 ring-border',
                  'hover:text-foreground hover:ring-cyan-500/40',
                  'active:scale-[0.98]',
                )}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Go back
              </button>
            </div>

            {/* Fine print */}
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              If this keeps happening,{' '}
              <a
                href="mailto:support@snappx.app"
                className={cn(
                  'underline underline-offset-2 transition-colors',
                  'text-cyan-600 dark:text-cyan-400',
                  'hover:text-teal-600 dark:hover:text-teal-400',
                )}
              >
                contact support
              </a>{' '}
              and we&apos;ll sort it out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// AnalyticsPage

interface AnalyticsPageErrorProps {
  onRetry: () => void;
}

export function AnalyticsPageError({ onRetry }: AnalyticsPageErrorProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden px-8 py-14 text-center',
        'bg-card ring-1 ring-border',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* Dot grid texture */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 pointer-events-none',
          '[background-image:radial-linear(rgba(0,0,0,0.04)_1px,transparent_1px)]',
          'dark:[background-image:radial-linear(rgba(255,255,255,0.03)_1px,transparent_1px)]',
          'bg-size-[20px_20px]',
        )}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/60 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-5 max-w-sm mx-auto">
        {/* Icon tile */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl scale-150"
          />
          <div
            className={cn(
              'relative h-16 w-16 rounded-2xl flex items-center justify-center',
              'bg-linear-to-br from-cyan-500/10 to-teal-600/10',
              'ring-1 ring-cyan-500/25',
            )}
          >
            <SignalIcon className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">
            Server error
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Couldn&apos;t load your analytics
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We ran into a problem fetching your data — nothing on your end. Your
            savings and activity are safe. Try refreshing and it should come
            right back.
          </p>
        </div>

        {/* Retry CTA */}
        <button
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
            'text-sm font-semibold text-white transition-all duration-150',
            'bg-linear-to-r from-cyan-500 to-teal-600',
            'hover:opacity-90 active:scale-[0.97]',
            'shadow-[0_2px_10px_rgba(6,182,212,0.35)]',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
          Refresh
        </button>

        <p className="text-[11px] text-muted-foreground/60">
          If this keeps happening, our team is already on it.
        </p>
      </div>
    </div>
  );
}

// RequestsPage

interface RequestsPageErrorProps {
  onRetry: () => void;
}

export function RequestsPageError({ onRetry }: RequestsPageErrorProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden px-8 py-12 text-center',
        'bg-card ring-1 ring-border',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* Dot grid texture */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 pointer-events-none',
          '[background-image:radial-linear(rgba(0,0,0,0.04)_1px,transparent_1px)]',
          'dark:[background-image:radial-linear(rgba(255,255,255,0.03)_1px,transparent_1px)]',
          'bg-size-[20px_20px]',
        )}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/60 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-5 max-w-sm mx-auto">
        {/* Icon tile */}
        <div
          className={cn(
            'h-16 w-16 rounded-2xl flex items-center justify-center',
            'bg-linear-to-br from-cyan-500/10 to-teal-600/10',
            'ring-1 ring-cyan-500/25',
          )}
        >
          <WifiOff
            className="h-7 w-7 text-cyan-600 dark:text-cyan-400"
            strokeWidth={1.5}
          />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Couldn&apos;t load join requests
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We hit a snag fetching your requests. You did Nothing wrong. Give it
            a moment and try again.
          </p>
        </div>

        {/* Retry CTA */}
        <button
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
            'text-sm font-semibold text-white transition-all duration-150',
            'bg-linear-to-r from-cyan-500 to-teal-600',
            'hover:opacity-90 active:scale-[0.97]',
            'shadow-[0_2px_10px_rgba(6,182,212,0.35)]',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
          Try again
        </button>

        <p className="text-[11px] text-muted-foreground/60">
          If this keeps happening, our team is already on it.
        </p>
      </div>
    </div>
  );
}
