// src/components/pages/InvitePreviewPage.tsx

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

// ─── Capacity bar ─────────────────────────────────────────────────────────────

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
              : 'bg-gradient-to-r from-cyan-500 to-teal-600',
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

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 px-4 py-3 rounded-xl',
        'dark:bg-zinc-900 dark:ring-1 dark:ring-white/6',
        'bg-zinc-50 ring-1 ring-zinc-200',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] dark:text-zinc-600 text-zinc-400">
        {label}
      </span>
      <span className="text-sm font-semibold dark:text-zinc-100 text-zinc-900 capitalize">
        {value}
      </span>
    </div>
  );
}

// ─── Skeleton / Loading ───────────────────────────────────────────────────────

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
        <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-600" />
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

// ─── Error state ──────────────────────────────────────────────────────────────

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
            'bg-gradient-to-r from-cyan-500 to-teal-600 text-white',
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

// ─── Main Component ───────────────────────────────────────────────────────────

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
        'dark:[background-image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)]',
        '[background-image:radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)]',
        '[background-size:24px_24px]',
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
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-600" />

          {/* ── PANEL A: Identity ─────────────────────────────────────── */}
          <div className="relative px-7 pt-6 pb-6 dark:bg-zinc-900 bg-white">
            {/* Admin eyebrow pill */}
            <div
              className={cn(
                'inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full',
                'dark:bg-zinc-800 dark:ring-1 dark:ring-white/8',
                'bg-zinc-100 ring-1 ring-zinc-200',
              )}
            >
              {/* Avatar with brand gradient */}
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
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

          {/* ── PANEL B: Details + Action ─────────────────────────────── */}
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
                {/* Primary — brand gradient */}
                <button
                  onClick={handleJoin}
                  className={cn(
                    'w-full h-12 rounded-xl flex items-center justify-center gap-2',
                    'text-sm font-semibold text-white transition-all duration-150',
                    'bg-gradient-to-r from-cyan-500 to-teal-600',
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

// // src/components/pages/InvitePreviewPage.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';
// import { decodeHtmlEntities } from '@/src/lib/html';
// import {
//   Users,
//   Shield,
//   ChevronRight,
//   AlertTriangle,
//   ArrowRight,
// } from 'lucide-react';
// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// interface InviteData {
//   valid: boolean;
//   group_id: number;
//   public_id: string;
//   group_name: string;
//   description: string;
//   contribution_amount: string;
//   frequency: string;
//   current_members: number;
//   expected_members: number;
//   admin_name: string;
//   admin_photo?: string;
//   status: string;
//   spots_remaining: number;
//   is_full: boolean;
// }

// // ─── Capacity bar ─────────────────────────────────────────────────────────────

// function CapacityBar({
//   current,
//   expected,
// }: {
//   current: number;
//   expected: number;
// }) {
//   const pct = Math.min(Math.round((current / expected) * 100), 100);
//   const remaining = expected - current;
//   const isCritical = pct >= 85;

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between">
//         <span className="text-xs font-medium dark:text-zinc-400 text-zinc-500">
//           {current} of {expected} members
//         </span>
//         <span
//           className={cn(
//             'text-xs font-semibold',
//             isCritical ? 'text-amber-500' : 'dark:text-zinc-400 text-zinc-500',
//           )}
//         >
//           {remaining === 0
//             ? 'Full'
//             : `${remaining} spot${remaining !== 1 ? 's' : ''} left`}
//         </span>
//       </div>

//       {/* Track */}
//       <div className="h-1.5 rounded-full dark:bg-zinc-800 bg-zinc-200 overflow-hidden">
//         <div
//           className={cn(
//             'h-full rounded-full transition-all duration-1000 ease-out',
//             isCritical ? 'bg-amber-500' : 'bg-emerald-500',
//           )}
//           style={{ width: `${pct}%` }}
//         />
//       </div>

//       {/* Dot grid */}
//       <div className="flex gap-1 flex-wrap pt-0.5">
//         {Array.from({ length: expected }).map((_, i) => (
//           <div
//             key={i}
//             className={cn(
//               'h-1.5 w-1.5 rounded-full transition-all duration-300',
//               i < current
//                 ? isCritical
//                   ? 'bg-amber-500'
//                   : 'bg-emerald-500'
//                 : 'dark:bg-zinc-800 bg-zinc-200',
//             )}
//             style={{ transitionDelay: `${i * 25}ms` }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Stat pill ────────────────────────────────────────────────────────────────

// function StatPill({ label, value }: { label: string; value: string }) {
//   return (
//     <div
//       className={cn(
//         'flex flex-col gap-0.5 px-4 py-3 rounded-xl',
//         'dark:bg-zinc-900 dark:ring-1 dark:ring-white/6',
//         'bg-zinc-50 ring-1 ring-zinc-200',
//       )}
//     >
//       <span className="text-[10px] font-semibold uppercase tracking-[0.1em] dark:text-zinc-600 text-zinc-400">
//         {label}
//       </span>
//       <span className="text-sm font-semibold dark:text-zinc-100 text-zinc-900 capitalize">
//         {value}
//       </span>
//     </div>
//   );
// }

// // ─── Skeleton / Loading ───────────────────────────────────────────────────────

// function Sk({ className }: { className?: string }) {
//   return (
//     <div
//       className={cn(
//         'animate-pulse rounded-lg dark:bg-zinc-800 bg-zinc-100',
//         className,
//       )}
//     />
//   );
// }

// function LoadingPreview() {
//   return (
//     <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-white p-4">
//       <div className="w-full max-w-md space-y-0 rounded-2xl overflow-hidden dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
//         {/* Hero panel skeleton */}
//         <div className="dark:bg-zinc-900 bg-zinc-50 p-7 space-y-5">
//           <div className="flex items-start gap-4">
//             <Sk className="h-14 w-14 rounded-2xl shrink-0" />
//             <div className="flex-1 space-y-2 pt-1">
//               <Sk className="h-5 w-3/4" />
//               <Sk className="h-3.5 w-1/2" />
//             </div>
//           </div>
//           <Sk className="h-3 w-full" />
//           <Sk className="h-3 w-4/5" />
//         </div>
//         {/* Action panel skeleton */}
//         <div className="dark:bg-zinc-950 bg-white p-7 space-y-5">
//           <div className="grid grid-cols-2 gap-2">
//             <Sk className="h-16 rounded-xl" />
//             <Sk className="h-16 rounded-xl" />
//             <Sk className="h-16 rounded-xl" />
//             <Sk className="h-16 rounded-xl" />
//           </div>
//           <Sk className="h-12 rounded-xl" />
//           <Sk className="h-10 rounded-xl" />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Error state ──────────────────────────────────────────────────────────────

// function InvalidLink() {
//   const router = useRouter();
//   return (
//     <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-white p-4">
//       <div className="w-full max-w-sm text-center space-y-6">
//         <div
//           className={cn(
//             'h-16 w-16 mx-auto rounded-2xl flex items-center justify-center',
//             'dark:bg-red-500/10 dark:ring-1 dark:ring-red-500/20',
//             'bg-red-50 ring-1 ring-red-200',
//           )}
//         >
//           <AlertTriangle className="h-7 w-7 text-red-500" />
//         </div>

//         <div className="space-y-2">
//           <h1 className="text-xl font-bold dark:text-zinc-50 text-zinc-900">
//             Invite link expired
//           </h1>
//           <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed max-w-xs mx-auto">
//             This link is no longer active. It may have been revoked by the group
//             admin or already used.
//           </p>
//         </div>

//         <button
//           onClick={() => router.push('/login')}
//           className={cn(
//             'inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all duration-150',
//             'bg-zinc-900 text-white hover:bg-zinc-800',
//             'dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100',
//             'shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
//           )}
//         >
//           Go to SnappX
//           <ArrowRight className="h-4 w-4" />
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function InvitePreviewPage({ token }: { token: string }) {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setMounted(true), 80);
//     return () => clearTimeout(t);
//   }, []);

//   const { data, isLoading, error } = useQuery<InviteData>({
//     queryKey: ['invite-preview', token],
//     queryFn: () => authService.getInvitePreview(token),
//     retry: false,
//   });

//   if (isLoading) return <LoadingPreview />;
//   if (error || !data?.valid) return <InvalidLink />;

//   const freq = data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1);
//   const amount = parseFloat(data.contribution_amount).toLocaleString();

//   const storeInvite = () => {
//     if (typeof window !== 'undefined') {
//       sessionStorage.setItem(
//         'pending_invite',
//         JSON.stringify({
//           token,
//           group_id: data.group_id,
//           public_id: data.public_id,
//           group_name: data.group_name,
//         }),
//       );
//     }
//   };

//   const handleJoin = () => {
//     storeInvite();
//     router.push(`/signup?invite=${token}`);
//   };

//   const handleLogin = () => {
//     storeInvite();
//     router.push(`/login?invite=${token}`);
//   };

//   const initials = data.admin_name
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <div
//       className={cn(
//         'min-h-screen flex flex-col items-center justify-center p-4 md:p-8',
//         'dark:bg-zinc-950 bg-[#f7f7f8]',
//         // Subtle dot grid
//         'dark:[background-image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)]',
//         '[background-image:radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)]',
//         '[background-size:24px_24px]',
//       )}
//     >
//       {/* Card */}
//       <div
//         className={cn(
//           'w-full max-w-md relative',
//           'transition-all duration-700 ease-out',
//           mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
//         )}
//       >
//         {/* Outer ring — the "frame" */}
//         <div
//           className={cn(
//             'rounded-2xl overflow-hidden',
//             'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_32px_80px_-16px_rgba(0,0,0,0.8)]',
//             'shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_24px_60px_-12px_rgba(0,0,0,0.12)]',
//           )}
//         >
//           {/* ── PANEL A: Identity ─────────────────────────────────────── */}
//           <div
//             className={cn(
//               'relative px-7 pt-7 pb-6',
//               'dark:bg-zinc-900 bg-white',
//             )}
//           >
//             {/* "Invited by" eyebrow */}
//             <div
//               className={cn(
//                 'inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full',
//                 'dark:bg-zinc-800 dark:ring-1 dark:ring-white/8',
//                 'bg-zinc-100 ring-1 ring-zinc-200',
//               )}
//             >
//               {/* Admin avatar */}
//               <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
//                 {initials}
//               </div>
//               <span className="text-xs font-medium dark:text-zinc-300 text-zinc-600">
//                 {data.admin_name} is inviting you
//               </span>
//             </div>

//             {/* Group name */}
//             <h1
//               className={cn(
//                 'text-2xl font-bold leading-tight tracking-tight mb-1.5',
//                 'dark:text-zinc-50 text-zinc-900',
//               )}
//             >
//               {data.group_name}
//             </h1>

//             {/* Description */}
//             {data.description ? (
//               <p className="text-sm leading-relaxed dark:text-zinc-500 text-zinc-500 mb-5">
//                 {decodeHtmlEntities(data.description)}
//               </p>
//             ) : (
//               <p className="text-sm dark:text-zinc-600 text-zinc-400 mb-5 italic">
//                 No description provided.
//               </p>
//             )}

//             {/* Divider */}
//             <div className="dark:border-t dark:border-white/5 border-t border-zinc-100" />
//           </div>

//           {/* ── PANEL B: Details + Action ─────────────────────────────── */}
//           <div
//             className={cn(
//               'px-7 pt-5 pb-7 space-y-5',
//               'dark:bg-zinc-950 bg-zinc-50',
//             )}
//           >
//             {/* Stats grid */}
//             <div className="grid grid-cols-2 gap-2">
//               <StatPill label="Contribution" value={`GH₵ ${amount}`} />
//               <StatPill label="Frequency" value={freq} />
//               <StatPill
//                 label="Members"
//                 value={`${data.current_members} / ${data.expected_members}`}
//               />
//               <StatPill
//                 label="Availability"
//                 value={data.is_full ? 'Full' : `${data.spots_remaining} open`}
//               />
//             </div>

//             {/* Capacity bar */}
//             <CapacityBar
//               current={data.current_members}
//               expected={data.expected_members}
//             />

//             {/* Trust line */}
//             <div className="flex items-center gap-2">
//               <Shield
//                 className="h-3.5 w-3.5 shrink-0 text-emerald-500"
//                 strokeWidth={2}
//               />
//               <p className="text-[11px] dark:text-zinc-600 text-zinc-400">
//                 Secured by SnappX — savings protected and verified
//               </p>
//             </div>

//             {/* Divider */}
//             <div className="dark:border-t dark:border-white/5 border-t border-zinc-200" />

//             {/* CTA */}
//             {data.is_full ? (
//               <div
//                 className={cn(
//                   'text-center py-4 px-5 rounded-xl text-sm',
//                   'dark:bg-zinc-900 dark:text-zinc-500 dark:ring-1 dark:ring-white/5',
//                   'bg-white text-zinc-400 ring-1 ring-zinc-200',
//                 )}
//               >
//                 This group is currently full. Check back later.
//               </div>
//             ) : (
//               <div className="space-y-2.5">
//                 {/* Primary CTA */}
//                 <button
//                   onClick={handleJoin}
//                   className={cn(
//                     'w-full h-12 rounded-xl flex items-center justify-center gap-2',
//                     'text-sm font-semibold transition-all duration-150',
//                     'bg-linear-to-br from-cyan-500 to-teal-600 text-white',
//                     'dark:bg-white dark:text-zinc-900',
//                     'hover:opacity-90 active:scale-[0.98]',
//                     'shadow-[0_2px_8px_rgba(0,0,0,0.14)]',
//                   )}
//                 >
//                   Create account & join
//                   <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
//                 </button>

//                 {/* Secondary CTA */}
//                 <button
//                   onClick={handleLogin}
//                   className={cn(
//                     'w-full h-11 rounded-xl flex items-center justify-center',
//                     'text-sm font-medium transition-all duration-150',
//                     'dark:bg-zinc-900 dark:ring-1 dark:ring-white/8 dark:text-zinc-300',
//                     'dark:hover:ring-white/14 dark:hover:text-white',
//                     'bg-white ring-1 ring-zinc-200 text-zinc-600',
//                     'hover:ring-zinc-300 hover:text-zinc-900',
//                     'active:scale-[0.98]',
//                   )}
//                 >
//                   I already have an account
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-[11px] dark:text-zinc-700 text-zinc-400 mt-5">
//           SnappX is Ghana&apos;s trusted digital susu platform.{' '}
//           <Link
//             href="/"
//             className="dark:text-zinc-500 text-zinc-500 underline underline-offset-2 dark:hover:text-zinc-300 hover:text-zinc-700 transition-colors"
//           >
//             Learn more
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// // src/components/pages/InvitePreviewPage.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';
// import { decodeHtmlEntities } from '@/src/lib/html';
// import {
//   Users,
//   Calendar,
//   TrendingUp,
//   Shield,
//   ChevronRight,
//   AlertTriangle,
//   Wallet,
//   Clock,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { Badge } from '@/src/components/ui/badge';
// import { authService } from '@/src/services/auth.service';
// import { cn } from '../ui/utils';

// interface InviteData {
//   valid: boolean;
//   group_id: number;
//   public_id: string;
//   group_name: string;
//   description: string;
//   contribution_amount: string;
//   frequency: string;
//   current_members: number;
//   expected_members: number;
//   admin_name: string;
//   admin_photo?: string;
//   status: string;
//   spots_remaining: number;
//   is_full: boolean;
// }

// // ─── Animated counter ───────────────────────────────────────────────────────
// // function AnimatedNumber({ value }: { value: number }) {
// //   const [display, setDisplay] = useState(0);

// //   useEffect(() => {
// //     const duration = 800;
// //     const start = performance.now();
// //     const raf = (now: number) => {
// //       const progress = Math.min((now - start) / duration, 1);
// //       const eased = 1 - Math.pow(1 - progress, 3);
// //       setDisplay(Math.round(eased * value));
// //       if (progress < 1) requestAnimationFrame(raf);
// //     };
// //     requestAnimationFrame(raf);
// //   }, [value]);

// //   return <>{display}</>;
// // }

// // ─── Member spots visualizer ─────────────────────────────────────────────────
// function SpotsBar({
//   current,
//   expected,
// }: {
//   current: number;
//   expected: number;
// }) {
//   const pct = Math.round((current / expected) * 100);
//   const remaining = expected - current;

//   return (
//     <div className="space-y-2.5">
//       <div className="flex justify-between text-xs text-muted-foreground">
//         <span>{current} joined</span>
//         <span>
//           {remaining} spot{remaining !== 1 ? 's' : ''} left
//         </span>
//       </div>
//       <div className="h-2 bg-muted rounded-full overflow-hidden">
//         <div
//           className={cn(
//             'h-full rounded-full transition-all duration-1000 delay-300',
//             pct >= 90
//               ? 'bg-linear-to-r from-orange-500 to-red-500'
//               : pct >= 60
//                 ? 'bg-linear-to-r from-cyan-500 to-teal-500'
//                 : 'bg-linear-to-r from-cyan-400 to-teal-400',
//           )}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//       <div className="flex gap-1 flex-wrap">
//         {Array.from({ length: expected }).map((_, i) => (
//           <div
//             key={i}
//             className={cn(
//               'h-2 w-2 rounded-full transition-all duration-300',
//               i < current ? 'bg-cyan-500' : 'bg-muted-foreground/20',
//             )}
//             style={{ transitionDelay: `${i * 30}ms` }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function StatItem({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: React.ElementType;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50">
//       <div className="h-9 w-9 rounded-lg bg-linear-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
//         <Icon
//           className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400"
//           style={{ width: '18px', height: '18px' }}
//         />
//       </div>
//       <div>
//         <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
//           {label}
//         </p>
//         <p className="text-sm font-semibold capitalize">{value}</p>
//       </div>
//     </div>
//   );
// }

// // ─── Error State ─────────────────────────────────────────────────────────────
// function InvalidLink() {
//   const router = useRouter();
//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-background">
//       <div className="max-w-sm w-full text-center space-y-5">
//         <div className="h-20 w-20 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
//           <AlertTriangle className="h-10 w-10 text-destructive" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold">Link Expired</h1>
//           <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
//             This invite link is no longer valid. It may have been revoked by the
//             group admin.
//           </p>
//         </div>
//         <Button
//           onClick={() => router.push('/login')}
//           className="bg-cyan-500 hover:bg-cyan-600 text-white"
//         >
//           Go to SnappX
//         </Button>
//       </div>
//     </div>
//   );
// }

// // ─── Loading State ────────────────────────────────────────────────────────────
// function LoadingPreview() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="flex flex-col items-center gap-4">
//         <div className="relative h-16 w-16">
//           <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
//           <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
//           <div className="absolute inset-2 rounded-full bg-linear-to-br from-cyan-500 to-teal-500 opacity-20" />
//         </div>
//         <p className="text-sm text-muted-foreground animate-pulse">
//           Loading group details…
//         </p>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export function InvitePreviewPage({ token }: { token: string }) {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setTimeout(() => setMounted(true), 100);
//   }, []);

//   const { data, isLoading, error } = useQuery<InviteData>({
//     queryKey: ['invite-preview', token],
//     queryFn: () => authService.getInvitePreview(token),
//     retry: false,
//   });

//   if (isLoading) return <LoadingPreview />;
//   if (error || !data?.valid) return <InvalidLink />;

//   const freq = data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1);
//   const amount = parseFloat(data.contribution_amount).toLocaleString();

//   const handleJoin = () => {
//     // Store token in sessionStorage so after login/signup we can redirect to the group
//     if (typeof window !== 'undefined') {
//       sessionStorage.setItem(
//         'pending_invite',
//         JSON.stringify({
//           token,
//           group_id: data.group_id,
//           public_id: data.public_id,
//           group_name: data.group_name,
//         }),
//       );
//     }
//     router.push(`/signup?invite=${token}`);
//   };

//   const handleLogin = () => {
//     if (typeof window !== 'undefined') {
//       sessionStorage.setItem(
//         'pending_invite',
//         JSON.stringify({
//           token,
//           group_id: data.group_id,
//           public_id: data.public_id,
//           group_name: data.group_name,
//         }),
//       );
//     }
//     router.push(`/login?invite=${token}`);
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       {/* ── Ambient background ── */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
//         <div className="absolute top-1/3 -right-20 h-64 w-64 rounded-full bg-teal-500/6 blur-3xl" />
//         <div className="absolute bottom-0 -left-20 h-48 w-48 rounded-full bg-cyan-400/6 blur-3xl" />
//       </div>

//       {/* ── Main content ── */}
//       <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
//         <div
//           className={cn(
//             'w-full max-w-md transition-all duration-700',
//             mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
//           )}
//         >
//           {/* ── Group Card ── */}
//           <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
//             {/* Colorful top strip */}
//             <div className="h-2 bg-linear-to-r from-cyan-500 via-teal-400 to-cyan-600" />

//             <div className="p-6 space-y-6">
//               {/* ── Group identity ── */}
//               <div className="flex items-start gap-4">
//                 <div className="h-14 w-14 shrink-0 rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md">
//                   <Users className="h-7 w-7 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <h1 className="text-xl font-bold leading-tight">
//                       {data.group_name}
//                     </h1>
//                     {data.is_full && (
//                       <Badge variant="secondary" className="text-[10px]">
//                         Full
//                       </Badge>
//                     )}
//                   </div>
//                   <p className="text-sm text-muted-foreground mt-0.5">
//                     Managed by{' '}
//                     <span className="font-medium text-foreground">
//                       {data.admin_name}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {/* ── Invitation tag line ── */}
//               <div className="px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
//                 <p className="text-sm text-center">
//                   <span className="font-semibold text-cyan-600 dark:text-cyan-400">
//                     {data.admin_name}
//                   </span>{' '}
//                   has invited you to join their savings circle 🎉
//                 </p>
//               </div>

//               {/* ── Description ── */}
//               {data.description && (
//                 <p className="text-sm text-muted-foreground leading-relaxed">
//                   {decodeHtmlEntities(data.description)}
//                 </p>
//               )}

//               {/* ── Stats ── */}
//               <div className="grid grid-cols-2 gap-2.5">
//                 <StatItem
//                   icon={Wallet}
//                   label="Contribution"
//                   value={`GH₵ ${amount}`}
//                 />
//                 <StatItem icon={Clock} label="Frequency" value={freq} />
//                 <StatItem
//                   icon={Calendar}
//                   label="Members"
//                   value={`${data.current_members} / ${data.expected_members}`}
//                 />
//                 <StatItem
//                   icon={TrendingUp}
//                   label="Spots left"
//                   value={
//                     data.is_full ? 'Full' : `${data.spots_remaining} remaining`
//                   }
//                 />
//               </div>

//               {/* ── Member progress ── */}
//               <div className="space-y-1.5">
//                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                   Group capacity
//                 </p>
//                 <SpotsBar
//                   current={data.current_members}
//                   expected={data.expected_members}
//                 />
//               </div>

//               {/* ── Trust badge ── */}
//               <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                 <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
//                 <span>
//                   Secured by SnappX — your savings are protected and verified
//                 </span>
//               </div>

//               {/* ── CTA ── */}
//               {data.is_full ? (
//                 <div className="text-center py-3 px-4 rounded-xl bg-muted text-muted-foreground text-sm">
//                   This group is currently full. Check back later for openings.
//                 </div>
//               ) : (
//                 <div className="space-y-2.5 pt-1">
//                   <Button
//                     onClick={handleJoin}
//                     className="w-full h-12 text-base font-semibold bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25 gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
//                   >
//                     Create account & Join
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     onClick={handleLogin}
//                     variant="outline"
//                     className="w-full h-11"
//                   >
//                     I already have an account
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ── Footer note ── */}
//           <p className="text-center text-xs text-muted-foreground mt-5">
//             SnappX is Ghana&apos;s trusted digital susu platform.{' '}
//             <Link
//               href="/"
//               className="underline underline-offset-2 hover:text-foreground transition-colors"
//             >
//               Learn more
//             </Link>
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }
