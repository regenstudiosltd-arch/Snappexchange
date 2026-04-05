'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Check, RefreshCw, Link2, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/src/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';
import { authService } from '@/src/services/auth.service';
import { cn } from '../../ui/utils';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  isAdmin: boolean;
}

interface InviteData {
  token: string;
  invite_url: string;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

// ─── Brand Icons

const PLATFORMS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: '#22C55E',
    getHref: (url: string, text: string) =>
      `https://wa.me/?text=${text}%20${url}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    key: 'telegram',
    label: 'Telegram',
    color: '#38BDF8',
    getHref: (url: string, text: string) =>
      `https://t.me/share/url?url=${url}&text=${text}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'X',
    color: '#0f172a',
    darkColor: '#e2e8f0',
    getHref: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#60A5FA',
    getHref: (url: string, _: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: '#818CF8',
    getHref: (url: string, _: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
] as const;

// ─── Utilities ──

function shortenForDisplay(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const token = pathname.split('/').filter(Boolean).pop() ?? pathname;
    const short =
      token.length > 20 ? `${token.slice(0, 10)}…${token.slice(-6)}` : token;
    return `${hostname}/…/${short}`;
  } catch {
    return url.length > 36 ? `${url.slice(0, 24)}…${url.slice(-10)}` : url;
  }
}

// ─── Skeleton ───

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md animate-pulse',
        'dark:bg-zinc-800 bg-zinc-100',
        className,
      )}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-6 pt-6 pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

// ─── Main component

export function InviteLinkModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  isAdmin,
}: InviteLinkModalProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const {
    data: invite,
    isLoading,
    error,
  } = useQuery<InviteData>({
    queryKey: ['invite-link', groupId],
    queryFn: () => authService.getInviteLink(groupId),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => authService.regenerateInviteLink(groupId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['invite-link', groupId],
        (old: InviteData | undefined) => ({
          ...old,
          ...data,
          click_count: data.click_count ?? 0,
        }),
      );
      toast.success('New link generated', {
        description: 'Previous links are now invalid.',
      });
    },
    onError: () => toast.error('Failed to regenerate link'),
  });

  const handleCopy = useCallback(async () => {
    if (!invite?.invite_url) return;
    try {
      await navigator.clipboard.writeText(invite.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [invite]);

  const encodedText = invite?.invite_url
    ? encodeURIComponent(
        `Join my savings circle "${groupName}" on SnappX! Let's save together. 💰`,
      )
    : '';
  const encodedUrl = invite?.invite_url
    ? encodeURIComponent(invite.invite_url)
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Reset defaults
          'p-0 gap-0 border-0',
          // Size
          'w-[calc(100vw-24px)] max-w-110',
          // Shape
          'rounded-2xl overflow-hidden',
          // Surface — dark
          'dark:bg-zinc-950 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_64px_-12px_rgba(0,0,0,0.7)]',
          // Surface — light
          'bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_64px_-12px_rgba(0,0,0,0.14)]',
          // Remove Radix default close button
          '[&>button:last-child]:hidden',
        )}
      >
        <VisuallyHidden>
          <DialogTitle>Invite members to {groupName}</DialogTitle>
        </VisuallyHidden>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error || !invite ? (
          /* ── Error state ─────────────── */
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center',
                'dark:bg-red-500/10 bg-red-50',
              )}
            >
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium dark:text-zinc-100 text-zinc-900">
                Unable to load invite link
              </p>
              <p className="text-xs dark:text-zinc-500 text-zinc-400">
                Close and try again, or contact support.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4">
              <div>
                {/* Eyebrow */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] dark:text-zinc-500 text-zinc-500 mb-1">
                  Circle invite
                </p>
                {/* Title */}
                <DialogTitle
                  aria-hidden
                  className={cn(
                    'text-base font-semibold leading-snug',
                    'dark:text-zinc-50 text-zinc-900',
                    'max-w-65 truncate',
                  )}
                >
                  {groupName}
                </DialogTitle>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                {/* Active pill */}
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                    'dark:bg-emerald-500/8 dark:ring-1 dark:ring-emerald-500/20',
                    'bg-emerald-50 ring-1 ring-emerald-200',
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide dark:text-emerald-400 text-emerald-600">
                    Active
                  </span>
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center transition-colors',
                    'dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/6',
                    'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100',
                  )}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ── Divider ─ */}
            <div className="dark:border-t dark:border-white/5 border-t border-zinc-100" />

            {/* ── Link row  */}
            <div className="px-6 pt-4 pb-3">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] dark:text-zinc-500 text-zinc-500 mb-2">
                Invite link
              </label>

              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 h-11',
                  'dark:bg-zinc-900 dark:ring-1 dark:ring-white/6',
                  'bg-zinc-50 ring-1 ring-zinc-200',
                )}
              >
                {/* Icon */}
                <Link2
                  className="h-3.5 w-3.5 shrink-0 dark:text-zinc-600 text-zinc-400"
                  strokeWidth={2}
                />

                {/* URL */}
                <span className="flex-1 text-xs font-mono truncate dark:text-zinc-400 text-zinc-600 select-all">
                  {shortenForDisplay(invite.invite_url)}
                </span>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 h-6.5 px-2.5 rounded-md',
                    'text-[11px] font-medium transition-all duration-150',
                    copied
                      ? 'dark:bg-emerald-500/12 dark:text-emerald-400 dark:ring-1 dark:ring-emerald-500/20 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                      : [
                          'dark:bg-white/6 dark:text-zinc-300 dark:ring-1 dark:ring-white/8 dark:hover:bg-white/10 dark:hover:text-white',
                          'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900',
                          'shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                        ],
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" strokeWidth={2} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Share via  */}
            <div className="px-6 pb-4">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] dark:text-zinc-500 text-zinc-500 mb-2">
                Share via
              </label>

              <div className="grid grid-cols-5 gap-2">
                {PLATFORMS.map(
                  ({ key, label, color, icon, getHref, ...rest }) => {
                    const darkColor =
                      'darkColor' in rest
                        ? (rest as { darkColor: string }).darkColor
                        : undefined;
                    return (
                      <a
                        key={key}
                        href={getHref(encodedUrl, encodedText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'group relative flex flex-col items-center justify-center gap-2 py-3 rounded-xl',
                          'transition-all duration-150',
                          'dark:bg-zinc-900 dark:ring-1 dark:ring-white/5 dark:hover:ring-white/10',
                          'bg-zinc-50 ring-1 ring-zinc-100 hover:ring-zinc-200',
                          'hover:-translate-y-px active:translate-y-0',
                          'shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
                        )}
                      >
                        {/* Icon — always brand color, opacity fades until hover */}
                        <span
                          className="transition-opacity duration-150 opacity-75 group-hover:opacity-100"
                          style={{
                            color,
                            ...(darkColor
                              ? ({
                                  '--icon-dark-color': darkColor,
                                } as React.CSSProperties)
                              : {}),
                          }}
                        >
                          <span
                            className={
                              darkColor ? 'dark:text-(--icon-dark-color)' : ''
                            }
                          >
                            {icon}
                          </span>
                        </span>
                        <span className="text-[9px] font-semibold dark:text-zinc-500 text-zinc-600 group-hover:dark:text-zinc-300 group-hover:text-zinc-800 transition-colors leading-none">
                          {label}
                        </span>
                      </a>
                    );
                  },
                )}
              </div>
            </div>

            {/* ── Divider ─ */}
            <div className="dark:border-t dark:border-white/5 border-t border-zinc-100" />

            {/* ── Footer: stats + admin reset  */}
            <div className="flex items-center justify-between px-6 py-4">
              {/* Stats */}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums tracking-tight dark:text-zinc-100 text-zinc-900">
                  {(invite.click_count ?? 0).toLocaleString()}
                </span>
                <span className="text-xs dark:text-zinc-600 text-zinc-500 ml-1">
                  {(invite.click_count ?? 0) === 1 ? 'view' : 'views'}
                </span>
              </div>

              {/* Admin reset */}
              {isAdmin && (
                <button
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                  className={cn(
                    'flex items-center gap-1.5 h-8 px-3 rounded-md',
                    'text-xs font-medium transition-all duration-150',
                    'disabled:opacity-40 disabled:pointer-events-none',
                    'active:scale-[0.97]',
                    // Dark — neutral resting, red on hover
                    'dark:bg-zinc-900 dark:ring-1 dark:ring-white/6 dark:text-zinc-400',
                    'dark:hover:ring-red-500/20 dark:hover:text-red-400 dark:hover:bg-red-500/6',
                    // Light
                    'bg-white ring-1 ring-zinc-200 text-zinc-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                    'hover:ring-red-200 hover:text-red-500 hover:bg-red-50',
                  )}
                >
                  <RefreshCw
                    className={cn(
                      'h-3 w-3',
                      regenerateMutation.isPending && 'animate-spin',
                    )}
                    strokeWidth={2.5}
                  />
                  Reset link
                </button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
