// src/components/pages/GroupDetailPage/sections/MemberRosterSection.tsx

'use client';

import { Users, Crown } from 'lucide-react';
import { cn } from '@/src/components/ui/utils';
import { GroupDetail, GroupMember } from '../types';
import { MemberAvatar } from '../components/MemberAvatar';

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Appends " (You)" to a member's display name when their user_id matches
 * the logged-in user.  Returns the name unchanged when currentUserId is null
 * (e.g. session still loading) so there are no flicker effects.
 */
function displayName(
  name: string,
  userId: number,
  currentUserId: number | null,
): string {
  if (currentUserId !== null && userId === currentUserId) {
    return `${name} (You)`;
  }
  return name;
}

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: GroupMember;
  isNext: boolean;
  isPrevious: boolean;
  hasContributed: boolean;
  currentUserId: number | null;
}

function MemberCard({
  member,
  isNext,
  isPrevious,
  hasContributed,
  currentUserId,
}: MemberCardProps) {
  const isCurrentUser =
    currentUserId !== null && member.user_id === currentUserId;

  return (
    <div
      className={cn(
        'relative flex items-center gap-2.5 p-3 rounded-xl border transition-colors duration-150',
        isCurrentUser && !isNext && !isPrevious
          ? 'border-amber-400/30 bg-amber-500/5 dark:bg-amber-500/6'
          : isNext
            ? 'border-cyan-500/35 bg-cyan-500/5 dark:bg-cyan-500/8'
            : isPrevious
              ? 'border-violet-500/25 bg-violet-500/5 dark:bg-violet-500/6'
              : 'border-border/40 bg-muted/20 hover:bg-muted/40',
      )}
    >
      {/* Payout position badge */}
      {member.payout_position != null && (
        <span
          className={cn(
            'absolute -top-2 -left-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card z-10',
            isNext
              ? 'bg-cyan-500 text-white'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {member.payout_position}
        </span>
      )}

      {/* Avatar + contribution dot */}
      <div className="relative shrink-0">
        <MemberAvatar
          name={member.full_name}
          photoUrl={member.profile_picture}
          size="md"
          gradientVariant={
            isNext
              ? 'cyan'
              : isPrevious
                ? 'violet'
                : isCurrentUser
                  ? 'amber'
                  : 'neutral'
          }
        />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
            hasContributed ? 'bg-emerald-500' : 'bg-amber-400',
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate leading-tight',
              isCurrentUser
                ? 'text-foreground font-semibold'
                : 'text-foreground',
            )}
          >
            {displayName(member.full_name, member.user_id, currentUserId)}
          </p>
          {member.is_admin && (
            <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {isNext && (
            <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 rounded-full px-1.5 py-0.5 leading-tight">
              Next payout
            </span>
          )}
          {isPrevious && !isNext && (
            <span className="text-[10px] font-bold text-violet-700 dark:text-violet-400 bg-violet-500/10 rounded-full px-1.5 py-0.5 leading-tight">
              Previous
            </span>
          )}
          {member.is_admin && !isNext && !isPrevious && (
            <span className="text-[10px] text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 rounded-full px-1.5 py-0.5 leading-tight">
              Admin
            </span>
          )}
          {!member.is_admin && !isNext && !isPrevious && (
            <span className="text-[10px] text-muted-foreground">
              {hasContributed ? '✓ Contributed' : '⏳ Pending'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface MemberRosterSectionProps {
  group: GroupDetail;
  /** Numeric ID of the authenticated user. Null while session is loading. */
  currentUserId: number | null;
}

export function MemberRosterSection({
  group,
  currentUserId,
}: MemberRosterSectionProps) {
  const {
    members,
    next_payout_recipient,
    previous_payout_recipient,
    contributed_user_ids,
  } = group;

  const sorted = [...members].sort((a, b) => {
    // Admin first, then payout position, then join order
    if (a.is_admin && !b.is_admin) return -1;
    if (!a.is_admin && b.is_admin) return 1;
    if (a.payout_position != null && b.payout_position != null) {
      return a.payout_position - b.payout_position;
    }
    if (a.payout_position != null) return -1;
    if (b.payout_position != null) return 1;
    return 0;
  });

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <Users className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground text-sm">
            Member Roster
          </h2>
          <p className="text-xs text-muted-foreground">
            {members.length} member{members.length !== 1 ? 's' : ''} · sorted by
            payout order
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Contributed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Pending
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {members.length === 0 ? (
          <div className="py-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No members yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Share the invite link to bring people in
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sorted.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isNext={next_payout_recipient?.user_id === member.user_id}
                isPrevious={
                  previous_payout_recipient?.user_id === member.user_id
                }
                hasContributed={
                  contributed_user_ids?.includes(member.user_id) ?? false
                }
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// // src/components/pages/GroupDetailPage/sections/MemberRosterSection.tsx

// 'use client';

// import { Users, Crown } from 'lucide-react';
// import { cn } from '@/src/components/ui/utils';
// import { GroupDetail, GroupMember } from '../types';
// import { MemberAvatar } from '../components/MemberAvatar';

// interface MemberCardProps {
//   member: GroupMember;
//   isNext: boolean;
//   isPrevious: boolean;
//   hasContributed: boolean;
// }

// function MemberCard({
//   member,
//   isNext,
//   isPrevious,
//   hasContributed,
// }: MemberCardProps) {
//   return (
//     <div
//       className={cn(
//         'relative flex items-center gap-2.5 p-3 rounded-xl border transition-colors duration-150',
//         isNext
//           ? 'border-cyan-500/35 bg-cyan-500/5 dark:bg-cyan-500/8'
//           : isPrevious
//             ? 'border-violet-500/25 bg-violet-500/5 dark:bg-violet-500/6'
//             : 'border-border/40 bg-muted/20 hover:bg-muted/40',
//       )}
//     >
//       {/* Payout position badge */}
//       {member.payout_position != null && (
//         <span
//           className={cn(
//             'absolute -top-2 -left-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card z-10',
//             isNext
//               ? 'bg-cyan-500 text-white'
//               : 'bg-muted text-muted-foreground',
//           )}
//         >
//           {member.payout_position}
//         </span>
//       )}

//       {/* Avatar + contribution dot */}
//       <div className="relative shrink-0">
//         <MemberAvatar
//           name={member.full_name}
//           photoUrl={member.profile_picture}
//           size="md"
//           gradientVariant={isNext ? 'cyan' : isPrevious ? 'violet' : 'neutral'}
//         />
//         <span
//           className={cn(
//             'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
//             hasContributed ? 'bg-emerald-500' : 'bg-amber-400',
//           )}
//         />
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-1 min-w-0">
//           <p className="text-sm font-medium text-foreground truncate leading-tight">
//             {member.full_name}
//           </p>
//           {member.is_admin && (
//             <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
//           )}
//         </div>

//         <div className="flex items-center gap-1 mt-0.5 flex-wrap">
//           {isNext && (
//             <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 rounded-full px-1.5 py-0.5 leading-tight">
//               Next payout
//             </span>
//           )}
//           {isPrevious && !isNext && (
//             <span className="text-[10px] font-bold text-violet-700 dark:text-violet-400 bg-violet-500/10 rounded-full px-1.5 py-0.5 leading-tight">
//               Previous
//             </span>
//           )}
//           {member.is_admin && !isNext && !isPrevious && (
//             <span className="text-[10px] text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 rounded-full px-1.5 py-0.5 leading-tight">
//               Admin
//             </span>
//           )}
//           {!member.is_admin && !isNext && !isPrevious && (
//             <span className="text-[10px] text-muted-foreground">
//               {hasContributed ? '✓ Contributed' : '⏳ Pending'}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// interface MemberRosterSectionProps {
//   group: GroupDetail;
// }

// export function MemberRosterSection({ group }: MemberRosterSectionProps) {
//   const {
//     members,
//     next_payout_recipient,
//     previous_payout_recipient,
//     contributed_user_ids,
//   } = group;

//   const sorted = [...members].sort((a, b) => {
//     // Admins first, then by payout position, then by join date
//     if (a.is_admin && !b.is_admin) return -1;
//     if (!a.is_admin && b.is_admin) return 1;
//     if (a.payout_position != null && b.payout_position != null) {
//       return a.payout_position - b.payout_position;
//     }
//     if (a.payout_position != null) return -1;
//     if (b.payout_position != null) return 1;
//     return 0;
//   });

//   return (
//     <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
//       {/* Header */}
//       <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
//         <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
//           <Users className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
//         </div>
//         <div className="flex-1">
//           <h2 className="font-semibold text-foreground text-sm">
//             Member Roster
//           </h2>
//           <p className="text-xs text-muted-foreground">
//             {members.length} member{members.length !== 1 ? 's' : ''} · sorted by
//             payout order
//           </p>
//         </div>
//         {/* Legend */}
//         <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
//           <span className="flex items-center gap-1">
//             <span className="h-2 w-2 rounded-full bg-emerald-500" />
//             Contributed
//           </span>
//           <span className="flex items-center gap-1">
//             <span className="h-2 w-2 rounded-full bg-amber-400" />
//             Pending
//           </span>
//         </div>
//       </div>

//       {/* Grid */}
//       <div className="flex-1 p-4 overflow-y-auto">
//         {members.length === 0 ? (
//           <div className="py-10 text-center">
//             <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
//             <p className="text-sm text-muted-foreground">No members yet</p>
//             <p className="text-xs text-muted-foreground/60 mt-1">
//               Share the invite link to bring people in
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             {sorted.map((member) => (
//               <MemberCard
//                 key={member.id}
//                 member={member}
//                 isNext={next_payout_recipient?.user_id === member.user_id}
//                 isPrevious={
//                   previous_payout_recipient?.user_id === member.user_id
//                 }
//                 hasContributed={
//                   contributed_user_ids?.includes(member.user_id) ?? false
//                 }
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
