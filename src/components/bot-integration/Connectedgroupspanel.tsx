// src/components/bot-integration/Connectedgroupspanel.tsx

'use client';

import { useState } from 'react';
import {
  Smartphone,
  MessageCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  RefreshCw,
  Clock,
  Users,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Hourglass,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ConnectedGroup, UnlinkPayload } from './bot.types';
import { cn } from '@/src/components/ui/utils';

interface ConnectedGroupsPanelProps {
  groups: ConnectedGroup[];
  isLoading: boolean;
  onUnlink: (payload: UnlinkPayload) => void;
  onRefresh: () => void;
  unlinkTarget: UnlinkPayload | null;
  onSetUnlinkTarget: (target: UnlinkPayload | null) => void;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ConnectedGroupsPanel({
  groups,
  isLoading,
  onUnlink,
  onRefresh,
  unlinkTarget,
  onSetUnlinkTarget,
}: ConnectedGroupsPanelProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const waCount = groups.filter((g) => g.platform === 'whatsapp').length;
  const tgCount = groups.filter((g) => g.platform === 'telegram').length;

  const isUnlinkTarget = (g: ConnectedGroup) =>
    unlinkTarget?.group_id === String(g.group_id) &&
    unlinkTarget?.platform === g.platform;

  return (
    <div className="connected-panel">
      <div className="connected-panel__header">
        <div>
          <h2 className="connected-panel__title">Connected Groups</h2>
          <p className="connected-panel__subtitle">
            {groups.length} group{groups.length !== 1 ? 's' : ''} linked
            {groups.length > 0 && (
              <>
                {' '}
                — {waCount > 0 && `${waCount} WhatsApp`}
                {waCount > 0 && tgCount > 0 && ', '}
                {tgCount > 0 && `${tgCount} Telegram`}
              </>
            )}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={cn(
            'connected-panel__refresh',
            isLoading && 'connected-panel__refresh--spinning',
          )}
          aria-label="Refresh"
          disabled={isLoading}
          type="button"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <div className="connected-panel__skeleton-wrap">
          {[1, 2].map((i) => (
            <div key={i} className="connected-panel__skeleton" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && groups.length === 0 && (
        <div className="connected-panel__empty">
          <div className="connected-panel__empty-icon">
            <Wifi size={28} />
          </div>
          <p className="connected-panel__empty-title">
            No groups connected yet
          </p>
          <p className="connected-panel__empty-body">
            Follow the setup steps above to generate a link code and connect
            your first savings group.
          </p>
        </div>
      )}

      {/* ── Group list ── */}
      {!isLoading && groups.length > 0 && (
        <ul className="connected-panel__list">
          {groups.map((group) => {
            const isWA = group.platform === 'whatsapp';
            // is_pending comes from the backend when telegram_chat_id is null
            const isPending = (
              group as ConnectedGroup & { is_pending?: boolean }
            ).is_pending;
            const isUnlinking = isUnlinkTarget(group);
            const menuId = group.id;

            return (
              <li key={group.id} className="connected-panel__item">
                {/* Platform icon */}
                <div
                  className={cn(
                    'connected-panel__plat-icon',
                    isWA
                      ? 'connected-panel__plat-icon--wa'
                      : 'connected-panel__plat-icon--tg',
                  )}
                >
                  {isWA ? (
                    <Smartphone size={18} />
                  ) : (
                    <MessageCircle size={18} />
                  )}
                  {group.is_active && !isPending && (
                    <span className="connected-panel__pulse" />
                  )}
                </div>

                {/* Info */}
                <div className="connected-panel__item-info">
                  <div className="connected-panel__item-name-row">
                    <p className="connected-panel__item-name">
                      {group.group_name}
                    </p>
                    {group.is_admin && (
                      <span className="connected-panel__admin-badge">
                        <ShieldCheck size={11} />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="connected-panel__item-meta">
                    <span>
                      <Users size={11} />
                      {group.member_count} member
                      {group.member_count !== 1 ? 's' : ''}
                    </span>
                    <span>
                      <Clock size={11} />
                      Linked {timeAgo(group.linked_at)}
                    </span>
                    {group.last_activity && (
                      <span>Active {timeAgo(group.last_activity)}</span>
                    )}
                    <span
                      className={cn(
                        'connected-panel__item-badge',
                        isWA
                          ? 'connected-panel__item-badge--wa'
                          : 'connected-panel__item-badge--tg',
                      )}
                    >
                      {isWA ? 'WhatsApp' : 'Telegram'}
                    </span>
                  </div>

                  {/* Pending activation notice */}
                  {isPending && (
                    <div className="connected-panel__pending-notice">
                      <Hourglass size={11} />
                      Waiting for activation — add the bot to your group and
                      send <strong>/start</strong>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="connected-panel__item-status">
                  {isPending ? (
                    <span className="connected-panel__status-pending">
                      <Hourglass size={11} />
                      Pending
                    </span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          'connected-panel__dot',
                          group.is_active && 'connected-panel__dot--active',
                        )}
                      />
                      {group.is_active ? 'Active' : 'Inactive'}
                    </>
                  )}
                </div>

                {/* Actions — always show menu, unlink only for admins */}
                <div className="connected-panel__item-actions">
                  {isUnlinking ? (
                    <div className="connected-panel__confirm">
                      <AlertTriangle
                        size={13}
                        className="connected-panel__confirm-icon"
                      />
                      <span className="connected-panel__confirm-text">
                        Unlink?
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="connected-panel__confirm-yes"
                        onClick={() =>
                          onUnlink({
                            group_id: String(group.group_id),
                            platform: group.platform,
                          })
                        }
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="connected-panel__confirm-no"
                        onClick={() => onSetUnlinkTarget(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="connected-panel__menu-wrap">
                      <button
                        className="connected-panel__menu-btn"
                        onClick={() =>
                          setMenuOpen(menuOpen === menuId ? null : menuId)
                        }
                        type="button"
                        aria-label="More options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuOpen === menuId && (
                        <div className="connected-panel__dropdown">
                          {/* ── View Group — navigates to the group detail page ── */}
                          <a
                            href={`/groups/${group.public_id}`}
                            className="connected-panel__dropdown-item"
                            onClick={() => setMenuOpen(null)}
                          >
                            <ExternalLink size={13} />
                            View Group
                          </a>

                          {/* ── Unlink Bot — only admins can unlink ── */}
                          {group.is_admin ? (
                            <button
                              className="connected-panel__dropdown-item connected-panel__dropdown-item--danger"
                              onClick={() => {
                                onSetUnlinkTarget({
                                  group_id: String(group.group_id),
                                  platform: group.platform,
                                });
                                setMenuOpen(null);
                              }}
                              type="button"
                            >
                              <Trash2 size={13} />
                              Unlink Bot
                            </button>
                          ) : (
                            <div className="connected-panel__dropdown-item connected-panel__dropdown-item--disabled">
                              <Trash2 size={13} />
                              Only admin can unlink
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// // src/components/bot-integration/Connectedgroupspanel.tsx

// 'use client';

// import { useState } from 'react';
// import {
//   Smartphone,
//   MessageCircle,
//   MoreVertical,
//   Trash2,
//   ExternalLink,
//   RefreshCw,
//   Clock,
//   Users,
//   Wifi,
//   ShieldCheck,
//   AlertTriangle,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { ConnectedGroup, UnlinkPayload } from './bot.types';
// import { cn } from '@/src/components/ui/utils';

// interface ConnectedGroupsPanelProps {
//   groups: ConnectedGroup[];
//   isLoading: boolean;
//   onUnlink: (payload: UnlinkPayload) => void;
//   onRefresh: () => void;
//   unlinkTarget: UnlinkPayload | null;
//   onSetUnlinkTarget: (target: UnlinkPayload | null) => void;
// }

// function timeAgo(isoString: string): string {
//   const diff = Date.now() - new Date(isoString).getTime();
//   const mins = Math.floor(diff / 60_000);
//   if (mins < 1) return 'just now';
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// }

// export function ConnectedGroupsPanel({
//   groups,
//   isLoading,
//   onUnlink,
//   onRefresh,
//   unlinkTarget,
//   onSetUnlinkTarget,
// }: ConnectedGroupsPanelProps) {
//   const [menuOpen, setMenuOpen] = useState<string | null>(null);

//   const waCount = groups.filter((g) => g.platform === 'whatsapp').length;
//   const tgCount = groups.filter((g) => g.platform === 'telegram').length;

//   const isUnlinkTarget = (g: ConnectedGroup) =>
//     unlinkTarget?.group_id === String(g.group_id) &&
//     unlinkTarget?.platform === g.platform;

//   return (
//     <div className="connected-panel">
//       <div className="connected-panel__header">
//         <div>
//           <h2 className="connected-panel__title">Connected Groups</h2>
//           <p className="connected-panel__subtitle">
//             {groups.length} group{groups.length !== 1 ? 's' : ''} linked
//             {groups.length > 0 && (
//               <>
//                 {' '}
//                 — {waCount > 0 && `${waCount} WhatsApp`}
//                 {waCount > 0 && tgCount > 0 && ', '}
//                 {tgCount > 0 && `${tgCount} Telegram`}
//               </>
//             )}
//           </p>
//         </div>
//         <button
//           onClick={onRefresh}
//           className={cn(
//             'connected-panel__refresh',
//             isLoading && 'connected-panel__refresh--spinning',
//           )}
//           aria-label="Refresh"
//           disabled={isLoading}
//         >
//           <RefreshCw size={15} />
//         </button>
//       </div>

//       {/* ── Loading skeletons ── */}
//       {isLoading && (
//         <div className="connected-panel__skeleton-wrap">
//           {[1, 2].map((i) => (
//             <div key={i} className="connected-panel__skeleton" />
//           ))}
//         </div>
//       )}

//       {/* ── Empty state ── */}
//       {!isLoading && groups.length === 0 && (
//         <div className="connected-panel__empty">
//           <div className="connected-panel__empty-icon">
//             <Wifi size={28} />
//           </div>
//           <p className="connected-panel__empty-title">
//             No groups connected yet
//           </p>
//           <p className="connected-panel__empty-body">
//             Follow the setup steps above to generate a link code and connect
//             your first savings group.
//           </p>
//         </div>
//       )}

//       {/* ── Group list ── */}
//       {!isLoading && groups.length > 0 && (
//         <ul className="connected-panel__list">
//           {groups.map((group) => {
//             const isWA = group.platform === 'whatsapp';
//             const isUnlinking = isUnlinkTarget(group);
//             const menuId = group.id;

//             return (
//               <li key={group.id} className="connected-panel__item">
//                 {/* Platform icon */}
//                 <div
//                   className={cn(
//                     'connected-panel__plat-icon',
//                     isWA
//                       ? 'connected-panel__plat-icon--wa'
//                       : 'connected-panel__plat-icon--tg',
//                   )}
//                 >
//                   {isWA ? (
//                     <Smartphone size={18} />
//                   ) : (
//                     <MessageCircle size={18} />
//                   )}
//                   {group.is_active && (
//                     <span className="connected-panel__pulse" />
//                   )}
//                 </div>

//                 {/* Info */}
//                 <div className="connected-panel__item-info">
//                   <div className="connected-panel__item-name-row">
//                     <p className="connected-panel__item-name">
//                       {group.group_name}
//                     </p>
//                     {group.is_admin && (
//                       <span className="connected-panel__admin-badge">
//                         <ShieldCheck size={11} />
//                         Admin
//                       </span>
//                     )}
//                   </div>
//                   <div className="connected-panel__item-meta">
//                     <span>
//                       <Users size={11} />
//                       {group.member_count} member
//                       {group.member_count !== 1 ? 's' : ''}
//                     </span>
//                     <span>
//                       <Clock size={11} />
//                       Linked {timeAgo(group.linked_at)}
//                     </span>
//                     {group.last_activity && (
//                       <span>Active {timeAgo(group.last_activity)}</span>
//                     )}
//                     <span
//                       className={cn(
//                         'connected-panel__item-badge',
//                         isWA
//                           ? 'connected-panel__item-badge--wa'
//                           : 'connected-panel__item-badge--tg',
//                       )}
//                     >
//                       {isWA ? 'WhatsApp' : 'Telegram'}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Status dot */}
//                 <div className="connected-panel__item-status">
//                   <span
//                     className={cn(
//                       'connected-panel__dot',
//                       group.is_active && 'connected-panel__dot--active',
//                     )}
//                   />
//                   {group.is_active ? 'Active' : 'Inactive'}
//                 </div>

//                 {/* Actions */}
//                 <div className="connected-panel__item-actions">
//                   {isUnlinking ? (
//                     <div className="connected-panel__confirm">
//                       <AlertTriangle
//                         size={13}
//                         className="connected-panel__confirm-icon"
//                       />
//                       <span className="connected-panel__confirm-text">
//                         Unlink?
//                       </span>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         className="connected-panel__confirm-yes"
//                         onClick={() =>
//                           onUnlink({
//                             group_id: String(group.group_id),
//                             platform: group.platform,
//                           })
//                         }
//                       >
//                         Yes
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="connected-panel__confirm-no"
//                         onClick={() => onSetUnlinkTarget(null)}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="connected-panel__menu-wrap">
//                       <button
//                         className="connected-panel__menu-btn"
//                         onClick={() =>
//                           setMenuOpen(menuOpen === menuId ? null : menuId)
//                         }
//                       >
//                         <MoreVertical size={16} />
//                       </button>

//                       {menuOpen === menuId && (
//                         <div className="connected-panel__dropdown">
//                           <a
//                             href={`/dashboard?page=Groups&group=${group.public_id}`}
//                             className="connected-panel__dropdown-item"
//                             onClick={() => setMenuOpen(null)}
//                           >
//                             <ExternalLink size={13} />
//                             View Group
//                           </a>
//                           {/* Only admins can unlink */}
//                           {group.is_admin && (
//                             <button
//                               className="connected-panel__dropdown-item connected-panel__dropdown-item--danger"
//                               onClick={() => {
//                                 onSetUnlinkTarget({
//                                   group_id: String(group.group_id),
//                                   platform: group.platform,
//                                 });
//                                 setMenuOpen(null);
//                               }}
//                             >
//                               <Trash2 size={13} />
//                               Unlink Bot
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// }

// // src/components/bot-integration/Connectedgroupspanel.tsx

// 'use client';

// import { useState } from 'react';
// import {
//   Smartphone,
//   MessageCircle,
//   MoreVertical,
//   Trash2,
//   ExternalLink,
//   RefreshCw,
//   Clock,
//   Users,
//   Wifi,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { ConnectedGroup } from './bot.types';
// import { cn } from '@/src/components/ui/utils';

// interface ConnectedGroupsPanelProps {
//   groups: ConnectedGroup[];
//   isLoading: boolean;
//   onUnlink: (groupId: string) => void;
//   onRefresh: () => void;
//   unlinkTarget: string | null;
//   onSetUnlinkTarget: (id: string | null) => void;
// }

// function timeAgo(isoString: string): string {
//   const diff = Date.now() - new Date(isoString).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return 'just now';
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// }

// export function ConnectedGroupsPanel({
//   groups,
//   isLoading,
//   onUnlink,
//   onRefresh,
//   unlinkTarget,
//   onSetUnlinkTarget,
// }: ConnectedGroupsPanelProps) {
//   const [menuOpen, setMenuOpen] = useState<string | null>(null);

//   const whatsappCount = groups.filter((g) => g.platform === 'whatsapp').length;
//   const telegramCount = groups.filter((g) => g.platform === 'telegram').length;

//   return (
//     <div className="connected-panel">
//       <div className="connected-panel__header">
//         <div>
//           <h2 className="connected-panel__title">Connected Groups</h2>
//           <p className="connected-panel__subtitle">
//             {groups.length} group{groups.length !== 1 ? 's' : ''} linked —{' '}
//             {whatsappCount} WhatsApp, {telegramCount} Telegram
//           </p>
//         </div>
//         <button
//           onClick={onRefresh}
//           className={cn(
//             'connected-panel__refresh',
//             isLoading && 'connected-panel__refresh--spinning',
//           )}
//           aria-label="Refresh"
//         >
//           <RefreshCw size={15} />
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="connected-panel__skeleton-wrap">
//           {[1, 2].map((i) => (
//             <div key={i} className="connected-panel__skeleton" />
//           ))}
//         </div>
//       ) : groups.length === 0 ? (
//         <div className="connected-panel__empty">
//           <div className="connected-panel__empty-icon">
//             <Wifi size={28} />
//           </div>
//           <p className="connected-panel__empty-title">
//             No groups connected yet
//           </p>
//           <p className="connected-panel__empty-body">
//             Follow the setup steps above and enter your group link code to get
//             started.
//           </p>
//         </div>
//       ) : (
//         <ul className="connected-panel__list">
//           {groups.map((group) => {
//             const isWA = group.platform === 'whatsapp';
//             const isUnlinking = unlinkTarget === group.id;

//             return (
//               <li key={group.id} className="connected-panel__item">
//                 {/* Platform icon */}
//                 <div
//                   className={cn(
//                     'connected-panel__plat-icon',
//                     isWA
//                       ? 'connected-panel__plat-icon--wa'
//                       : 'connected-panel__plat-icon--tg',
//                   )}
//                 >
//                   {isWA ? (
//                     <Smartphone size={18} />
//                   ) : (
//                     <MessageCircle size={18} />
//                   )}
//                   {/* Animated active pulse */}
//                   {group.isActive && (
//                     <span className="connected-panel__pulse" />
//                   )}
//                 </div>

//                 {/* Info */}
//                 <div className="connected-panel__item-info">
//                   <p className="connected-panel__item-name">
//                     {group.groupName}
//                   </p>
//                   <div className="connected-panel__item-meta">
//                     <span>
//                       <Users size={11} />
//                       {group.memberCount} members
//                     </span>
//                     {group.lastActivity && (
//                       <span>
//                         <Clock size={11} />
//                         {timeAgo(group.lastActivity)}
//                       </span>
//                     )}
//                     <span
//                       className={cn(
//                         'connected-panel__item-badge',
//                         isWA
//                           ? 'connected-panel__item-badge--wa'
//                           : 'connected-panel__item-badge--tg',
//                       )}
//                     >
//                       {isWA ? 'WhatsApp' : 'Telegram'}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Status indicator */}
//                 <div className="connected-panel__item-status">
//                   <span
//                     className={cn(
//                       'connected-panel__dot',
//                       group.isActive && 'connected-panel__dot--active',
//                     )}
//                   />
//                   {group.isActive ? 'Active' : 'Inactive'}
//                 </div>

//                 {/* Actions */}
//                 <div className="connected-panel__item-actions">
//                   {isUnlinking ? (
//                     <div className="connected-panel__confirm">
//                       <span className="connected-panel__confirm-text">
//                         Unlink?
//                       </span>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         className="connected-panel__confirm-yes"
//                         onClick={() => onUnlink(group.id)}
//                       >
//                         Yes
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="connected-panel__confirm-no"
//                         onClick={() => onSetUnlinkTarget(null)}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="connected-panel__menu-wrap">
//                       <button
//                         className="connected-panel__menu-btn"
//                         onClick={() =>
//                           setMenuOpen(menuOpen === group.id ? null : group.id)
//                         }
//                       >
//                         <MoreVertical size={16} />
//                       </button>
//                       {menuOpen === group.id && (
//                         <div className="connected-panel__dropdown">
//                           {group.groupPublicId && (
//                             <a
//                               href={`/dashboard?page=Groups&group=${group.groupPublicId}`}
//                               className="connected-panel__dropdown-item"
//                               onClick={() => setMenuOpen(null)}
//                             >
//                               <ExternalLink size={13} />
//                               View Group
//                             </a>
//                           )}
//                           <button
//                             className="connected-panel__dropdown-item connected-panel__dropdown-item--danger"
//                             onClick={() => {
//                               onSetUnlinkTarget(group.id);
//                               setMenuOpen(null);
//                             }}
//                           >
//                             <Trash2 size={13} />
//                             Unlink Bot
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// }
