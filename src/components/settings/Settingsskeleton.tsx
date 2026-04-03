'use client';

import { Skeleton } from '../ui/skeleton';

// ── Section skeleton — mirrors SectionShell + SectionHeader + SectionBody + SectionFooter
function SkeletonSection({
  rows = 3,
  hasFooter = true,
  rowHeights = [],
}: {
  rows?: number;
  hasFooter?: boolean;
  /** Override height per row. Falls back to h-10 if not specified. */
  rowHeights?: ('h-10' | 'h-24' | 'h-16' | 'h-12')[];
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
      {/* SectionHeader */}
      <div className="px-6 py-5 border-b border-border/60 flex items-start gap-4">
        <Skeleton className="h-8 w-8 rounded-xl shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
        </div>
      </div>

      {/* SectionBody */}
      <div className="px-6 py-6 space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton
              className={`${rowHeights[i] ?? 'h-10'} w-full rounded-lg`}
            />
          </div>
        ))}
      </div>

      {/* SectionFooter */}
      {hasFooter && (
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      )}
    </div>
  );
}

// ── Sidebar avatar card skeleton
function SkeletonAvatarCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        {/* Online dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-muted border-2 border-card" />
      </div>
      {/* Name + email + badge */}
      <div className="w-full flex flex-col items-center gap-2">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3 w-36 rounded" />
        <Skeleton className="h-5 w-16 rounded-full mt-0.5" />
      </div>
    </div>
  );
}

// ── Sidebar nav skeleton
function SkeletonSidebarNav() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
      {/* "Navigation" label */}
      <div className="px-4 pt-3 pb-1.5">
        <Skeleton className="h-2.5 w-20 rounded" />
      </div>
      {/* Nav items */}
      <ul className="pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="px-3 py-1">
            <div className="flex items-center gap-3 px-1 py-2">
              <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
              <Skeleton
                className={`h-3.5 rounded ${i === 5 ? 'w-24' : 'w-20'}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Mobile pill nav skeleton
function SkeletonPillNav() {
  const widths = ['w-20', 'w-16', 'w-28', 'w-20', 'w-24', 'w-24'];
  return (
    <div className="lg:hidden sticky top-0 z-20 -mx-4 px-0 mb-5 bg-background/90 border-b border-border/40">
      <div className="flex gap-2 overflow-x-hidden px-4 py-2.5">
        {widths.map((w, i) => (
          <Skeleton key={i} className={`h-7 ${w} rounded-full shrink-0`} />
        ))}
      </div>
    </div>
  );
}

// ── Public export
export function SettingsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Page heading */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* Mobile pill nav */}
      <SkeletonPillNav />

      {/* Two-column layout */}
      <div className="flex gap-6 xl:gap-8 items-start">
        {/* ── Sidebar (lg+) ── */}
        <aside className="hidden lg:flex flex-col gap-3 w-52 shrink-0">
          <SkeletonAvatarCard />
          <SkeletonSidebarNav />
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Profile — 2 columns of inputs + single full-width inputs */}
          <SkeletonSection
            rows={4}
            rowHeights={['h-10', 'h-10', 'h-10', 'h-10']}
          />
          {/* Payout — provider select + 2 inputs */}
          <SkeletonSection rows={3} />
          {/* Notifications — switches */}
          <SkeletonSection rows={3} rowHeights={['h-12', 'h-12', 'h-12']} />
          {/* Security */}
          <SkeletonSection rows={2} rowHeights={['h-12', 'h-24']} />
          {/* Appearance */}
          <SkeletonSection rows={2} rowHeights={['h-16', 'h-10']} />
          {/* Danger zone */}
          <SkeletonSection rows={1} rowHeights={['h-12']} hasFooter={false} />
        </div>
      </div>
    </div>
  );
}

// // src/components/settings/Settingsskeleton.tsx

// 'use client';

// import { Skeleton } from '../ui/skeleton';

// function SkeletonSection({
//   rows = 3,
//   hasFooter = true,
// }: {
//   rows?: number;
//   hasFooter?: boolean;
// }) {
//   return (
//     <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-5 border-b border-border/60 flex items-start gap-4">
//         <Skeleton className="h-8 w-8 rounded-xl shrink-0 mt-0.5" />
//         <div className="space-y-2 flex-1">
//           <Skeleton className="h-4 w-40 rounded" />
//           <Skeleton className="h-3 w-60 rounded" />
//         </div>
//       </div>

//       {/* Body */}
//       <div className="px-6 py-6 space-y-5">
//         {Array.from({ length: rows }).map((_, i) => (
//           <div key={i} className="space-y-1.5">
//             <Skeleton className="h-3 w-24 rounded" />
//             <Skeleton className="h-10 w-full rounded-lg" />
//           </div>
//         ))}
//       </div>

//       {/* Footer */}
//       {hasFooter && (
//         <div className="px-6 py-4 border-t border-border/40 bg-muted/30">
//           <Skeleton className="h-9 w-28 rounded-lg" />
//         </div>
//       )}
//     </div>
//   );
// }

// export function SettingsSkeleton() {
//   return (
//     <div className="animate-pulse space-y-6">
//       {/* Heading */}
//       <div className="space-y-2">
//         <Skeleton className="h-8 w-32 rounded" />
//         <Skeleton className="h-4 w-72 rounded" />
//       </div>

//       {/* Content */}
//       <div className="space-y-6">
//         <SkeletonSection rows={4} />
//         <SkeletonSection rows={3} />
//         <SkeletonSection rows={3} />
//         <SkeletonSection rows={4} />
//         <SkeletonSection rows={2} />
//         <SkeletonSection rows={1} hasFooter={false} />
//       </div>
//     </div>
//   );
// }
