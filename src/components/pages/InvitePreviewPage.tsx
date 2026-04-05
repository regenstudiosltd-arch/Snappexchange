'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { decodeHtmlEntities } from '@/src/lib/html';
import { Shield, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';

interface InviteData {
  valid: boolean;
  group_id: number;
  public_id: string;
  group_name: string;
  description: string;
  contribution_amount: string;
  frequency: string;
  current_members: number;
  expected_members: number;
  admin_name: string;
  admin_photo?: string;
  status: string;
  spots_remaining: number;
  is_full: boolean;
}

// Capacity bar

function CapacityBar({
  current,
  expected,
}: {
  current: number;
  expected: number;
}) {
  const pct = Math.min(Math.round((current / expected) * 100), 100);
  const remaining = expected - current;
  const isCritical = pct >= 85;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium dark:text-zinc-400 text-zinc-500">
          {current} of {expected} members
        </span>
        <span
          className={cn(
            'text-xs font-semibold',
            isCritical ? 'text-amber-500' : 'text-cyan-600 dark:text-cyan-400',
          )}
        >
          {remaining === 0
            ? 'Full'
            : `${remaining} spot${remaining !== 1 ? 's' : ''} left`}
        </span>
      </div>

      {/* Track */}
      <div className="h-1.5 rounded-full dark:bg-zinc-800 bg-zinc-200 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            isCritical
              ? 'bg-amber-500'
              : 'bg-linear-to-r from-cyan-500 to-teal-600',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Dot grid */}
      <div className="flex gap-1 flex-wrap pt-0.5">
        {Array.from({ length: expected }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-all duration-300',
              i < current
                ? isCritical
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
                : 'dark:bg-zinc-800 bg-zinc-200',
            )}
            style={{ transitionDelay: `${i * 25}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

//  Stat pill

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 px-4 py-3 rounded-xl',
        'dark:bg-zinc-900 dark:ring-1 dark:ring-white/6',
        'bg-zinc-50 ring-1 ring-zinc-200',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-zinc-600 text-zinc-400">
        {label}
      </span>
      <span className="text-sm font-semibold dark:text-zinc-100 text-zinc-900 capitalize">
        {value}
      </span>
    </div>
  );
}

// Skeleton / Loading

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg dark:bg-zinc-800 bg-zinc-100',
        className,
      )}
    />
  );
}

function LoadingPreview() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-[#f7f7f8] p-4">
      <div className="w-full max-w-md rounded-2xl overflow-hidden dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
        <div className="h-1 bg-linear-to-r from-cyan-500 to-teal-600" />
        <div className="dark:bg-zinc-900 bg-white p-7 space-y-5">
          <div className="flex items-start gap-4">
            <Sk className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Sk className="h-5 w-3/4" />
              <Sk className="h-3.5 w-1/2" />
            </div>
          </div>
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-4/5" />
        </div>
        <div className="dark:bg-zinc-950 bg-zinc-50 p-7 space-y-5">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Sk key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <Sk className="h-12 rounded-xl" />
          <Sk className="h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Error state

function InvalidLink() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-[#f7f7f8] p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div
          className={cn(
            'h-16 w-16 mx-auto rounded-2xl flex items-center justify-center',
            'dark:bg-red-500/10 dark:ring-1 dark:ring-red-500/20',
            'bg-red-50 ring-1 ring-red-200',
          )}
        >
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold dark:text-zinc-50 text-zinc-900">
            Invite link expired
          </h1>
          <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed max-w-xs mx-auto">
            This link is no longer active. It may have been revoked by the group
            admin or already used.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className={cn(
            'inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all duration-150',
            'bg-linear-to-r from-cyan-500 to-teal-600 text-white',
            'hover:opacity-90 active:scale-[0.98]',
            'shadow-[0_2px_12px_rgba(6,182,212,0.35)]',
          )}
        >
          Go to SnappX
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

//  Main Component

export function InvitePreviewPage({ token }: { token: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const { data, isLoading, error } = useQuery<InviteData>({
    queryKey: ['invite-preview', token],
    queryFn: () => authService.getInvitePreview(token),
    retry: false,
  });

  if (isLoading) return <LoadingPreview />;
  if (error || !data?.valid) return <InvalidLink />;

  const freq = data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1);
  const amount = parseFloat(data.contribution_amount).toLocaleString();

  const storeInvite = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'pending_invite',
        JSON.stringify({
          token,
          group_id: data.group_id,
          public_id: data.public_id,
          group_name: data.group_name,
        }),
      );
    }
  };

  const handleJoin = () => {
    storeInvite();
    router.push(`/signup?invite=${token}`);
  };
  const handleLogin = () => {
    storeInvite();
    router.push(`/login?invite=${token}`);
  };

  const initials = data.admin_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center p-4 md:p-8',
        'dark:bg-zinc-950 bg-[#f7f7f8]',
        'dark:[background-image:radial-linear(rgba(255,255,255,0.04)_1px,transparent_1px)]',
        '[background-image:radial-linear(rgba(0,0,0,0.06)_1px,transparent_1px)]',
        'bg-size-[24px_24px]',
      )}
    >
      <div
        className={cn(
          'w-full max-w-md relative',
          'transition-all duration-700 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        )}
      >
        {/* Card frame */}
        <div
          className={cn(
            'rounded-2xl overflow-hidden',
            'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_32px_80px_-16px_rgba(0,0,0,0.8)]',
            'shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_24px_60px_-12px_rgba(0,0,0,0.12)]',
          )}
        >
          {/* Brand accent strip */}
          <div className="h-1 bg-linear-to-r from-cyan-500 to-teal-600" />

          {/* ── PANEL A: Identity */}
          <div className="relative px-7 pt-6 pb-6 dark:bg-zinc-900 bg-white">
            {/* Admin eyebrow pill */}
            <div
              className={cn(
                'inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full',
                'dark:bg-zinc-800 dark:ring-1 dark:ring-white/8',
                'bg-zinc-100 ring-1 ring-zinc-200',
              )}
            >
              {/* Avatar with brand linear */}
              <div className="h-5 w-5 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                {initials}
              </div>
              <span className="text-xs font-medium dark:text-zinc-300 text-zinc-600">
                {data.admin_name} is inviting you
              </span>
            </div>

            {/* Group name */}
            <h1 className="text-2xl font-bold leading-tight tracking-tight mb-1.5 dark:text-zinc-50 text-zinc-900">
              {data.group_name}
            </h1>

            {/* Description */}
            {data.description ? (
              <p className="text-sm leading-relaxed dark:text-zinc-500 text-zinc-500 mb-5">
                {decodeHtmlEntities(data.description)}
              </p>
            ) : (
              <p className="text-sm dark:text-zinc-600 text-zinc-400 mb-5 italic">
                No description provided.
              </p>
            )}

            <div className="border-t dark:border-white/5 border-zinc-100" />
          </div>

          {/* ── PANEL B: Details + Action  */}
          <div className="px-7 pt-5 pb-7 space-y-5 dark:bg-zinc-950 bg-zinc-50">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <StatPill label="Contribution" value={`GH₵ ${amount}`} />
              <StatPill label="Frequency" value={freq} />
              <StatPill
                label="Members"
                value={`${data.current_members} / ${data.expected_members}`}
              />
              <StatPill
                label="Availability"
                value={data.is_full ? 'Full' : `${data.spots_remaining} open`}
              />
            </div>

            {/* Capacity bar — uses cyan/teal */}
            <CapacityBar
              current={data.current_members}
              expected={data.expected_members}
            />

            {/* Trust line — cyan shield */}
            <div className="flex items-center gap-2">
              <Shield
                className="h-3.5 w-3.5 shrink-0 text-cyan-500"
                strokeWidth={2}
              />
              <p className="text-[11px] dark:text-zinc-600 text-zinc-400">
                Secured by SnappX — savings protected and verified
              </p>
            </div>

            <div className="border-t dark:border-white/5 border-zinc-200" />

            {/* CTA */}
            {data.is_full ? (
              <div
                className={cn(
                  'text-center py-4 px-5 rounded-xl text-sm',
                  'dark:bg-zinc-900 dark:text-zinc-500 dark:ring-1 dark:ring-white/5',
                  'bg-white text-zinc-400 ring-1 ring-zinc-200',
                )}
              >
                This group is currently full. Check back later.
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Primary — brand linear */}
                <button
                  onClick={handleJoin}
                  className={cn(
                    'w-full h-12 rounded-xl flex items-center justify-center gap-2',
                    'text-sm font-semibold text-white transition-all duration-150',
                    'bg-linear-to-r from-cyan-500 to-teal-600',
                    'hover:opacity-90 active:scale-[0.98]',
                    'shadow-[0_2px_12px_rgba(6,182,212,0.4)]',
                  )}
                >
                  Create account &amp; join
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                </button>

                {/* Secondary — neutral ghost */}
                <button
                  onClick={handleLogin}
                  className={cn(
                    'w-full h-11 rounded-xl flex items-center justify-center',
                    'text-sm font-medium transition-all duration-150',
                    'dark:bg-zinc-900 dark:ring-1 dark:ring-white/8 dark:text-zinc-300',
                    'dark:hover:ring-cyan-500/30 dark:hover:text-cyan-400',
                    'bg-white ring-1 ring-zinc-200 text-zinc-600',
                    'hover:ring-cyan-400 hover:text-cyan-600',
                    'active:scale-[0.98]',
                  )}
                >
                  I already have an account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] dark:text-zinc-700 text-zinc-400 mt-5">
          SnappX is Ghana&apos;s trusted digital susu platform.{' '}
          <Link
            href="/"
            className="text-cyan-600 dark:text-cyan-500 underline underline-offset-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}
