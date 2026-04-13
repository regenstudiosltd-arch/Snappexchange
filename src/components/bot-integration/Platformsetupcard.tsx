// src/components/bot-integration/Platformsetupcard.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Smartphone,
  MessageCircle,
  Clock,
  Link2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  AdminGroup,
  BotPlatform,
  ConnectionStatus,
  GenerateCodeResponse,
} from './bot.types';
import { cn } from '@/src/components/ui/utils';

interface PlatformSetupCardProps {
  platform: BotPlatform;
  platformLabel: string;
  adminGroups: AdminGroup[];
  adminGroupsLoading: boolean;
  selectedGroup: AdminGroup | null;
  onSelectGroup: (g: AdminGroup | null) => void;
  generatedCode: GenerateCodeResponse | null;
  codeGenerating: boolean;
  onGenerateCode: () => void;
  onCopyCode: () => void;
  codeCopied: boolean;
  linkCode: string;
  connectionStatus: ConnectionStatus;
  onLinkCodeChange: (v: string) => void;
  onLinkGroup: () => void;
  linkError?: string | null;
}

const PLATFORM_META = {
  whatsapp: {
    icon: Smartphone,
    botHandle: '0500581423',
    addInstruction:
      'Save this number as a contact, then add it to your WhatsApp group as a participant.',
    activateCmd: '!join',
  },
  telegram: {
    icon: MessageCircle,
    botHandle: '@snappx_bot',
    addInstruction:
      'Search for @snappx_bot on Telegram and add it to your group, then make it an admin.',
    activateCmd: '/start',
  },
} as const;

function useCountdown(initialSeconds: number | null) {
  const [remaining, setRemaining] = useState<number | null>(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (initialSeconds === null || initialSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initialSeconds]);

  const effectiveRemaining =
    remaining !== null && initialSeconds !== null ? remaining : initialSeconds;
  return effectiveRemaining;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

// Derive which step is currently "active" for visual highlighting
function getActiveStep(
  selectedGroup: AdminGroup | null,
  generatedCode: GenerateCodeResponse | null,
  isExpired: boolean,
  linkCode: string,
  connectionStatus: ConnectionStatus,
): number {
  if (connectionStatus === 'connected') return 5;
  if (linkCode.trim().length > 0) return 4;
  if (generatedCode && !isExpired) return 3;
  if (selectedGroup) return 2;
  return 1;
}

export function PlatformSetupCard({
  platform,
  platformLabel,
  adminGroups,
  adminGroupsLoading,
  selectedGroup,
  onSelectGroup,
  generatedCode,
  codeGenerating,
  onGenerateCode,
  onCopyCode,
  codeCopied,
  linkCode,
  connectionStatus,
  onLinkCodeChange,
  onLinkGroup,
  linkError,
}: PlatformSetupCardProps) {
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const meta = PLATFORM_META[platform];
  const Icon = meta.icon;
  const isPending = connectionStatus === 'pending';
  const isConnected = connectionStatus === 'connected';
  const isError = connectionStatus === 'error';

  const countdown = useCountdown(
    generatedCode ? generatedCode.expires_in_seconds : null,
  );
  const isExpired = countdown === 0;
  const activeStep = getActiveStep(
    selectedGroup,
    generatedCode,
    !!isExpired,
    linkCode,
    connectionStatus,
  );

  const availableGroups = adminGroups.filter(
    (g) => !g.linked_platforms.includes(platform),
  );
  const alreadyLinkedGroups = adminGroups.filter((g) =>
    g.linked_platforms.includes(platform),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setGroupDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isWA = platform === 'whatsapp';

  return (
    <div className={cn('psc', `psc--${platform}`)}>
      {/* ── Top stripe ── */}
      <div className={cn('psc__stripe', `psc__stripe--${platform}`)} />

      {/* ── Header ── */}
      <div className="psc__head">
        <div className={cn('psc__head-icon', `psc__head-icon--${platform}`)}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div className="psc__head-copy">
          <h3 className="psc__head-title">{platformLabel}</h3>
          <p className="psc__head-sub">
            {isConnected
              ? 'Group connected successfully'
              : 'Link your savings group in 4 steps'}
          </p>
        </div>
        {isConnected && (
          <span className="psc__connected-badge">
            <CheckCircle2 size={13} />
            Connected
          </span>
        )}
      </div>

      {/* ── Stepper ── */}
      <ol className="psc__stepper">
        {/* ─ Step 1: Select group ─ */}
        <li
          className={cn(
            'psc__step',
            activeStep >= 1 && 'psc__step--reachable',
            activeStep > 1 && 'psc__step--done',
            activeStep === 1 && 'psc__step--active',
          )}
        >
          <div className="psc__step-left">
            <div
              className={cn(
                'psc__step-bubble',
                `psc__step-bubble--${platform}`,
              )}
            >
              {activeStep > 1 ? (
                <Check size={12} strokeWidth={2.5} />
              ) : (
                <span>1</span>
              )}
            </div>
            <div className="psc__step-line" />
          </div>

          <div className="psc__step-body">
            <p className="psc__step-label">Select a group</p>

            {adminGroupsLoading ? (
              <div className="psc__step-loading">
                <Loader2 size={12} className="animate-spin" />
                Loading groups…
              </div>
            ) : adminGroups.length === 0 ? (
              <p className="psc__step-hint">
                You must be a group admin to connect.
              </p>
            ) : (
              <div className="psc__dropdown-wrap" ref={dropdownRef}>
                <button
                  className={cn(
                    'psc__dropdown-trigger',
                    groupDropdownOpen && 'psc__dropdown-trigger--open',
                    selectedGroup &&
                      `psc__dropdown-trigger--selected psc__dropdown-trigger--selected-${platform}`,
                  )}
                  onClick={() => setGroupDropdownOpen((p) => !p)}
                  type="button"
                >
                  <span className="psc__dropdown-label">
                    {selectedGroup ? (
                      <>
                        <span className="psc__dropdown-name">
                          {selectedGroup.group_name}
                        </span>
                        <span className="psc__dropdown-meta">
                          {selectedGroup.current_members}/
                          {selectedGroup.expected_members} members
                        </span>
                      </>
                    ) : (
                      <span className="psc__dropdown-placeholder">
                        Choose a group…
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    size={13}
                    className={cn(
                      'psc__dropdown-chevron',
                      groupDropdownOpen && 'psc__dropdown-chevron--up',
                    )}
                  />
                </button>

                {groupDropdownOpen && (
                  <div className="psc__dropdown-menu">
                    {availableGroups.length > 0 && (
                      <>
                        <p className="psc__dropdown-section">Available</p>
                        {availableGroups.map((g) => (
                          <button
                            key={g.id}
                            className={cn(
                              'psc__dropdown-option',
                              selectedGroup?.id === g.id &&
                                `psc__dropdown-option--active psc__dropdown-option--active-${platform}`,
                            )}
                            onClick={() => {
                              onSelectGroup(g);
                              setGroupDropdownOpen(false);
                            }}
                            type="button"
                          >
                            <span className="psc__dropdown-option-name">
                              {g.group_name}
                            </span>
                            <span className="psc__dropdown-option-meta">
                              {g.current_members}/{g.expected_members} ·{' '}
                              {g.status}
                            </span>
                            {selectedGroup?.id === g.id && (
                              <Check
                                size={11}
                                className={`psc__dropdown-option-check psc__dropdown-option-check--${platform}`}
                              />
                            )}
                          </button>
                        ))}
                      </>
                    )}
                    {alreadyLinkedGroups.length > 0 && (
                      <>
                        <p className="psc__dropdown-section psc__dropdown-section--muted">
                          Already linked
                        </p>
                        {alreadyLinkedGroups.map((g) => (
                          <div
                            key={g.id}
                            className="psc__dropdown-option psc__dropdown-option--linked"
                          >
                            <span className="psc__dropdown-option-name">
                              {g.group_name}
                            </span>
                            <CheckCircle2
                              size={11}
                              className="psc__dropdown-option-linked-icon"
                            />
                          </div>
                        ))}
                      </>
                    )}
                    {availableGroups.length === 0 &&
                      alreadyLinkedGroups.length > 0 && (
                        <p className="psc__dropdown-empty">
                          All your groups are linked on {platformLabel}.
                        </p>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </li>

        {/* ─ Step 2: Generate code ─ */}
        <li
          className={cn(
            'psc__step',
            activeStep >= 2 && 'psc__step--reachable',
            activeStep > 2 && 'psc__step--done',
            activeStep === 2 && 'psc__step--active',
          )}
        >
          <div className="psc__step-left">
            <div
              className={cn(
                'psc__step-bubble',
                `psc__step-bubble--${platform}`,
              )}
            >
              {activeStep > 2 ? (
                <Check size={12} strokeWidth={2.5} />
              ) : (
                <span>2</span>
              )}
            </div>
            <div className="psc__step-line" />
          </div>

          <div className="psc__step-body">
            <p className="psc__step-label">Generate a link code</p>

            {!selectedGroup ? (
              <p className="psc__step-hint">Complete step 1 first.</p>
            ) : generatedCode && !isExpired ? (
              <div
                className={cn(
                  'psc__code-block',
                  `psc__code-block--${platform}`,
                )}
              >
                <div className="psc__code-top">
                  <Sparkles
                    size={13}
                    className={`psc__code-sparkle psc__code-sparkle--${platform}`}
                  />
                  <span className="psc__code-label">Your link code</span>
                </div>
                <div className="psc__code-display">
                  <code className="psc__code-value">
                    {generatedCode.link_code}
                  </code>
                  <button
                    className={cn(
                      'psc__code-copy',
                      codeCopied &&
                        `psc__code-copy--done psc__code-copy--done-${platform}`,
                    )}
                    onClick={onCopyCode}
                    type="button"
                    aria-label="Copy code"
                  >
                    {codeCopied ? (
                      <>
                        <Check size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="psc__code-footer">
                  <span
                    className={cn(
                      'psc__code-timer',
                      countdown !== null &&
                        countdown <= 60 &&
                        'psc__code-timer--urgent',
                    )}
                  >
                    <Clock size={11} />
                    {countdown !== null ? formatCountdown(countdown) : '—'}
                  </span>
                  <button
                    className="psc__code-regen"
                    onClick={onGenerateCode}
                    disabled={codeGenerating}
                    type="button"
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                </div>
                {generatedCode.warning && (
                  <p className="psc__code-warning">
                    <AlertCircle size={11} />
                    {generatedCode.warning}
                  </p>
                )}
              </div>
            ) : (
              <>
                {isExpired && (
                  <p className="psc__step-hint psc__step-hint--warn">
                    Code expired — generate a new one.
                  </p>
                )}
                <button
                  onClick={onGenerateCode}
                  disabled={codeGenerating || !selectedGroup}
                  className={cn('psc__gen-btn', `psc__gen-btn--${platform}`)}
                  type="button"
                >
                  {codeGenerating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      Generate Code
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </li>

        {/* ─ Step 3: Add bot (collapsible) ─ */}
        <li
          className={cn(
            'psc__step',
            activeStep >= 3 && 'psc__step--reachable',
            activeStep > 3 && 'psc__step--done',
            activeStep === 3 && 'psc__step--active',
          )}
        >
          <div className="psc__step-left">
            <div
              className={cn(
                'psc__step-bubble',
                `psc__step-bubble--${platform}`,
              )}
            >
              {activeStep > 3 ? (
                <Check size={12} strokeWidth={2.5} />
              ) : (
                <span>3</span>
              )}
            </div>
            <div className="psc__step-line" />
          </div>

          <div className="psc__step-body">
            <button
              className="psc__step-toggle"
              onClick={() => setStepsExpanded((p) => !p)}
              type="button"
            >
              <p className="psc__step-label psc__step-label--btn">
                Add bot to your {platformLabel} group
              </p>
              {stepsExpanded ? (
                <ChevronUp size={13} className="psc__toggle-icon" />
              ) : (
                <ChevronDown size={13} className="psc__toggle-icon" />
              )}
            </button>

            {stepsExpanded && (
              <div className="psc__instructions">
                <div className="psc__instruction">
                  <ChevronRight
                    size={12}
                    className={`psc__instruction-arrow psc__instruction-arrow--${platform}`}
                  />
                  <div>
                    <p className="psc__instruction-title">
                      Add{' '}
                      <strong
                        className={`psc__handle psc__handle--${platform}`}
                      >
                        {meta.botHandle}
                      </strong>
                    </p>
                    <p className="psc__instruction-body">
                      {meta.addInstruction}
                    </p>
                  </div>
                </div>
                <div className="psc__instruction">
                  <ChevronRight
                    size={12}
                    className={`psc__instruction-arrow psc__instruction-arrow--${platform}`}
                  />
                  <div>
                    <p className="psc__instruction-title">Activate</p>
                    <p className="psc__instruction-body">
                      Send{' '}
                      <code className={`psc__cmd psc__cmd--${platform}`}>
                        {meta.activateCmd}
                      </code>{' '}
                      in the group chat.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </li>

        {/* ─ Step 4: Confirm and link ─ */}
        <li
          className={cn(
            'psc__step psc__step--last',
            activeStep >= 4 && 'psc__step--reachable',
            isConnected && 'psc__step--done',
            activeStep === 4 && 'psc__step--active',
          )}
        >
          <div className="psc__step-left">
            <div
              className={cn(
                'psc__step-bubble',
                `psc__step-bubble--${platform}`,
              )}
            >
              {isConnected ? (
                <Check size={12} strokeWidth={2.5} />
              ) : (
                <span>4</span>
              )}
            </div>
          </div>

          <div className="psc__step-body psc__step-body--last">
            <p className="psc__step-label">Confirm and link</p>

            <div className="psc__link-row">
              <Input
                value={linkCode}
                onChange={(e) => onLinkCodeChange(e.target.value.toUpperCase())}
                placeholder="SNPX-XXXX-XXXX"
                className={cn(
                  'psc__link-input',
                  isError && 'psc__link-input--error',
                )}
                onKeyDown={(e) => e.key === 'Enter' && onLinkGroup()}
                disabled={isPending || isConnected}
                maxLength={14}
              />
              <button
                onClick={onLinkGroup}
                disabled={!linkCode.trim() || isPending || isConnected}
                className={cn(
                  'psc__link-btn',
                  `psc__link-btn--${platform}`,
                  isConnected && 'psc__link-btn--done',
                  isPending && 'psc__link-btn--loading',
                )}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Linking…
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle2 size={13} />
                    Linked!
                  </>
                ) : (
                  <>
                    <Link2 size={13} />
                    Link Group
                  </>
                )}
              </button>
            </div>

            {isError && linkError && (
              <div className="psc__feedback psc__feedback--error">
                <AlertCircle size={12} />
                {linkError}
              </div>
            )}
            {isConnected && (
              <div
                className={cn(
                  'psc__feedback',
                  `psc__feedback--success-${platform}`,
                )}
              >
                <CheckCircle2 size={12} />
                Linked! Add the bot and send <strong>
                  {meta.activateCmd}
                </strong>{' '}
                to activate.
              </div>
            )}
          </div>
        </li>
      </ol>
    </div>
  );
}

// // src/components/bot-integration/Platformsetupcard.tsx

// 'use client';

// import { useState } from 'react';
// import {
//   Check,
//   Copy,
//   ChevronDown,
//   ChevronUp,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   Zap,
//   RefreshCw,
//   Smartphone,
//   MessageCircle,
//   ChevronRight,
//   Clock,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import {
//   AdminGroup,
//   BotPlatform,
//   ConnectionStatus,
//   GenerateCodeResponse,
// } from './bot.types';
// import { cn } from '@/src/components/ui/utils';

// interface PlatformSetupCardProps {
//   platform: BotPlatform;
//   platformLabel: string;

//   // Admin group selection
//   adminGroups: AdminGroup[];
//   adminGroupsLoading: boolean;
//   selectedGroup: AdminGroup | null;
//   onSelectGroup: (g: AdminGroup | null) => void;

//   // Code generation
//   generatedCode: GenerateCodeResponse | null;
//   codeGenerating: boolean;
//   onGenerateCode: () => void;
//   onCopyCode: () => void;
//   codeCopied: boolean;

//   // Link submission
//   linkCode: string;
//   connectionStatus: ConnectionStatus;
//   onLinkCodeChange: (v: string) => void;
//   onLinkGroup: () => void;
//   linkError?: string | null;
// }

// const PLATFORM_META = {
//   whatsapp: {
//     icon: Smartphone,
//     color: 'green',
//     botHandle: '0500581423',
//     botHandleLabel: 'Bot Number',
//     addInstruction:
//       'Add the number as a contact, then add it to your WhatsApp group.',
//     activateCmd: '!join',
//   },
//   telegram: {
//     icon: MessageCircle,
//     color: 'sky',
//     botHandle: '@SnappXBot',
//     botHandleLabel: 'Bot Username',
//     addInstruction:
//       'Search for @SnappXBot on Telegram and add it to your group.',
//     activateCmd: '/start',
//   },
// } as const;

// /** Format seconds remaining as "Xm Ys" */
// function formatExpiry(seconds: number): string {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return m > 0 ? `${m}m ${s}s` : `${s}s`;
// }

// export function PlatformSetupCard({
//   platform,
//   platformLabel,
//   adminGroups,
//   adminGroupsLoading,
//   selectedGroup,
//   onSelectGroup,
//   generatedCode,
//   codeGenerating,
//   onGenerateCode,
//   onCopyCode,
//   codeCopied,
//   linkCode,
//   connectionStatus,
//   onLinkCodeChange,
//   onLinkGroup,
//   linkError,
// }: PlatformSetupCardProps) {
//   const [stepsExpanded, setStepsExpanded] = useState(true);
//   const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);

//   const meta = PLATFORM_META[platform];
//   const Icon = meta.icon;
//   const isPending = connectionStatus === 'pending';
//   const isConnected = connectionStatus === 'connected';
//   const isError = connectionStatus === 'error';

//   // Groups that are not yet linked on this platform
//   const availableGroups = adminGroups.filter(
//     (g) => !g.linked_platforms.includes(platform),
//   );
//   const alreadyLinkedGroups = adminGroups.filter((g) =>
//     g.linked_platforms.includes(platform),
//   );

//   return (
//     <div className={cn('platform-card', `platform-card--${platform}`)}>
//       {/* ── Header ── */}
//       <div className="platform-card__header">
//         <div
//           className={cn(
//             'platform-card__icon-wrap',
//             `platform-card__icon-wrap--${meta.color}`,
//           )}
//         >
//           <Icon size={20} />
//         </div>
//         <div className="platform-card__header-text">
//           <h2 className="platform-card__title">{platformLabel} Setup</h2>
//           <p className="platform-card__subtitle">
//             Connect SnappX Bot to your {platformLabel} savings group
//           </p>
//         </div>
//         <div
//           className={cn(
//             'platform-card__status-pill',
//             `platform-card__status-pill--${meta.color}`,
//           )}
//         >
//           <span
//             className={cn(
//               'platform-card__status-dot',
//               `platform-card__status-dot--${meta.color}`,
//             )}
//           />
//           Ready
//         </div>
//       </div>

//       {/* ── Step 1: Select your group (admin only) ── */}
//       <div className="platform-card__section">
//         <div className="platform-card__section-label">
//           <span className="platform-card__step-badge">1</span>
//           Select a group to connect
//         </div>

//         {adminGroupsLoading ? (
//           <div className="platform-card__loading-row">
//             <Loader2 size={14} className="animate-spin" />
//             <span>Loading your groups…</span>
//           </div>
//         ) : adminGroups.length === 0 ? (
//           <p className="platform-card__hint">
//             You need to be the admin of at least one group to use this feature.
//           </p>
//         ) : (
//           <div className="platform-card__dropdown-wrap">
//             <button
//               className={cn(
//                 'platform-card__group-select',
//                 groupDropdownOpen && 'platform-card__group-select--open',
//               )}
//               onClick={() => setGroupDropdownOpen((p) => !p)}
//             >
//               {selectedGroup ? (
//                 <span className="platform-card__group-select-value">
//                   {selectedGroup.group_name}
//                   <span className="platform-card__group-select-meta">
//                     {selectedGroup.current_members}/
//                     {selectedGroup.expected_members} members
//                   </span>
//                 </span>
//               ) : (
//                 <span className="platform-card__group-select-placeholder">
//                   Choose a group…
//                 </span>
//               )}
//               <ChevronDown
//                 size={15}
//                 className={cn(
//                   'platform-card__chevron',
//                   groupDropdownOpen && 'platform-card__chevron--up',
//                 )}
//               />
//             </button>

//             {groupDropdownOpen && (
//               <div className="platform-card__group-menu">
//                 {availableGroups.length > 0 && (
//                   <>
//                     <p className="platform-card__group-menu-heading">
//                       Available to connect
//                     </p>
//                     {availableGroups.map((g) => (
//                       <button
//                         key={g.id}
//                         className={cn(
//                           'platform-card__group-option',
//                           selectedGroup?.id === g.id &&
//                             'platform-card__group-option--selected',
//                         )}
//                         onClick={() => {
//                           onSelectGroup(g);
//                           setGroupDropdownOpen(false);
//                         }}
//                       >
//                         <span>{g.group_name}</span>
//                         <span className="platform-card__group-option-meta">
//                           {g.current_members}/{g.expected_members} · {g.status}
//                         </span>
//                         {selectedGroup?.id === g.id && (
//                           <Check
//                             size={13}
//                             className="platform-card__group-option-check"
//                           />
//                         )}
//                       </button>
//                     ))}
//                   </>
//                 )}
//                 {alreadyLinkedGroups.length > 0 && (
//                   <>
//                     <p className="platform-card__group-menu-heading platform-card__group-menu-heading--muted">
//                       Already linked
//                     </p>
//                     {alreadyLinkedGroups.map((g) => (
//                       <div
//                         key={g.id}
//                         className="platform-card__group-option platform-card__group-option--disabled"
//                       >
//                         <span>{g.group_name}</span>
//                         <CheckCircle2
//                           size={13}
//                           className="platform-card__group-option-linked"
//                         />
//                       </div>
//                     ))}
//                   </>
//                 )}
//                 {availableGroups.length === 0 &&
//                   alreadyLinkedGroups.length > 0 && (
//                     <p className="platform-card__group-menu-empty">
//                       All your groups are already linked on {platformLabel}.
//                     </p>
//                   )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Step 2: Generate link code ── */}
//       <div className="platform-card__section">
//         <div className="platform-card__section-label">
//           <span className="platform-card__step-badge">2</span>
//           Generate your link code
//         </div>

//         {!selectedGroup ? (
//           <p className="platform-card__hint">Select a group above first.</p>
//         ) : (
//           <div className="platform-card__generate-wrap">
//             {generatedCode ? (
//               <div className="platform-card__code-display">
//                 <div className="platform-card__code-value">
//                   <code>{generatedCode.link_code}</code>
//                   <button
//                     className={cn(
//                       'platform-card__copy-btn',
//                       codeCopied && 'platform-card__copy-btn--copied',
//                     )}
//                     onClick={onCopyCode}
//                     aria-label="Copy code"
//                   >
//                     {codeCopied ? <Check size={13} /> : <Copy size={13} />}
//                     {codeCopied ? 'Copied!' : 'Copy'}
//                   </button>
//                 </div>
//                 <div className="platform-card__code-meta">
//                   <Clock size={12} />
//                   Expires in {formatExpiry(generatedCode.expires_in_seconds)}
//                   {generatedCode.warning && (
//                     <span className="platform-card__code-warning">
//                       <AlertCircle size={12} />
//                       {generatedCode.warning}
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   className="platform-card__regen-btn"
//                   onClick={onGenerateCode}
//                   disabled={codeGenerating}
//                 >
//                   <RefreshCw size={12} />
//                   Generate new code
//                 </button>
//               </div>
//             ) : (
//               <Button
//                 onClick={onGenerateCode}
//                 disabled={codeGenerating}
//                 className={cn(
//                   'platform-card__gen-btn',
//                   `platform-card__gen-btn--${platform}`,
//                 )}
//               >
//                 {codeGenerating ? (
//                   <>
//                     <Loader2 size={14} className="animate-spin" />
//                     Generating…
//                   </>
//                 ) : (
//                   <>
//                     <Zap size={14} />
//                     Generate Link Code
//                   </>
//                 )}
//               </Button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Step 3: Add bot to group + activate ── */}
//       <div className="platform-card__section">
//         <button
//           className="platform-card__steps-toggle"
//           onClick={() => setStepsExpanded((p) => !p)}
//         >
//           <span className="platform-card__section-label">
//             <span className="platform-card__step-badge">3</span>
//             Add the bot to your {platformLabel} group
//           </span>
//           {stepsExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
//         </button>

//         {stepsExpanded && (
//           <div className="platform-card__steps">
//             <div className="platform-card__step">
//               <ChevronRight size={13} className="platform-card__step-arrow" />
//               <div>
//                 <p className="platform-card__step-title">
//                   Add <strong>{meta.botHandle}</strong>
//                 </p>
//                 <p className="platform-card__step-body">
//                   {meta.addInstruction}
//                 </p>
//               </div>
//             </div>
//             <div className="platform-card__step">
//               <ChevronRight size={13} className="platform-card__step-arrow" />
//               <div>
//                 <p className="platform-card__step-title">
//                   Send the activate command
//                 </p>
//                 <p className="platform-card__step-body">
//                   In the group chat, type{' '}
//                   <code className="bot-code">{meta.activateCmd}</code>. The bot
//                   will reply and begin monitoring.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Step 4: Submit code to link ── */}
//       <div className="platform-card__section">
//         <div className="platform-card__section-label">
//           <span className="platform-card__step-badge">4</span>
//           Confirm and link
//         </div>
//         <div className="platform-card__link-row">
//           <Input
//             value={linkCode}
//             onChange={(e) => onLinkCodeChange(e.target.value.toUpperCase())}
//             placeholder="SNPX-XXXX-XXXX"
//             className={cn(
//               'platform-card__link-input',
//               isError && 'platform-card__link-input--error',
//             )}
//             onKeyDown={(e) => e.key === 'Enter' && onLinkGroup()}
//             disabled={isPending || isConnected}
//             maxLength={14}
//           />
//           <Button
//             onClick={onLinkGroup}
//             disabled={!linkCode.trim() || isPending || isConnected}
//             className={cn(
//               'platform-card__link-btn',
//               `platform-card__link-btn--${platform}`,
//               isConnected && 'platform-card__link-btn--success',
//             )}
//           >
//             {isPending ? (
//               <>
//                 <Loader2 size={14} className="animate-spin" />
//                 Linking…
//               </>
//             ) : isConnected ? (
//               <>
//                 <CheckCircle2 size={14} />
//                 Linked!
//               </>
//             ) : (
//               'Link Group'
//             )}
//           </Button>
//         </div>

//         {isError && linkError && (
//           <p className="platform-card__link-error">
//             <AlertCircle size={13} />
//             {linkError}
//           </p>
//         )}
//         {isConnected && (
//           <p className="platform-card__link-success">
//             <CheckCircle2 size={13} />
//             Group successfully connected to {platformLabel}!
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// // src/components/bot-integration/Platformsetupcard.tsx

// 'use client';

// import { useState } from 'react';
// import {
//   Check,
//   Copy,
//   ChevronDown,
//   ChevronUp,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { BotPlatform, ConnectionStatus } from './bot.types';
// import { cn } from '@/src/components/ui/utils';

// interface Step {
//   num: number;
//   title: string;
//   body: React.ReactNode;
// }

// interface PlatformSetupCardProps {
//   platform: BotPlatform;
//   contactValue: string; // bot number or username
//   contactLabel: string;
//   steps: Step[];
//   accentColor: string; // tailwind color key e.g. 'green' | 'sky'
//   icon: React.ReactNode;
//   platformLabel: string;
//   linkCode: string;
//   connectionStatus: ConnectionStatus;
//   copied: boolean;
//   onCopy: () => void;
//   onLinkCodeChange: (v: string) => void;
//   onLinkGroup: () => void;
//   linkError?: string | null;
// }

// export function PlatformSetupCard({
//   platform,
//   contactValue,
//   contactLabel,
//   steps,
//   accentColor,
//   icon,
//   platformLabel,
//   linkCode,
//   connectionStatus,
//   copied,
//   onCopy,
//   onLinkCodeChange,
//   onLinkGroup,
//   linkError,
// }: PlatformSetupCardProps) {
//   const [stepsExpanded, setStepsExpanded] = useState(true);

//   const isGreen = accentColor === 'green';
//   const isPending = connectionStatus === 'pending';
//   const isConnected = connectionStatus === 'connected';
//   const isError = connectionStatus === 'error';

//   return (
//     <div className={cn('platform-card', `platform-card--${platform}`)}>
//       {/* Header */}
//       <div className="platform-card__header">
//         <div className="platform-card__icon-wrap">{icon}</div>
//         <div>
//           <h2 className="platform-card__title">{platformLabel} Setup</h2>
//           <p className="platform-card__subtitle">
//             Connect SnappX Bot to your {platformLabel} group
//           </p>
//         </div>
//         <div className="platform-card__status-pill">
//           <span
//             className={cn(
//               'platform-card__status-dot',
//               isGreen
//                 ? 'platform-card__status-dot--green'
//                 : 'platform-card__status-dot--blue',
//             )}
//           />
//           Active
//         </div>
//       </div>

//       {/* Contact info */}
//       <div className="platform-card__contact">
//         <span className="platform-card__contact-label">{contactLabel}</span>
//         <div className="platform-card__contact-row">
//           <code className="platform-card__contact-value">{contactValue}</code>
//           <button
//             className={cn(
//               'platform-card__copy-btn',
//               copied && 'platform-card__copy-btn--copied',
//             )}
//             onClick={onCopy}
//             aria-label="Copy to clipboard"
//           >
//             {copied ? <Check size={14} /> : <Copy size={14} />}
//             {copied ? 'Copied!' : 'Copy'}
//           </button>
//         </div>
//       </div>

//       {/* Expandable Steps */}
//       <div className="platform-card__steps-section">
//         <button
//           className="platform-card__steps-toggle"
//           onClick={() => setStepsExpanded((p) => !p)}
//         >
//           <span>Setup Instructions</span>
//           {stepsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//         </button>
//         {stepsExpanded && (
//           <ol className="platform-card__steps">
//             {steps.map((step) => (
//               <li key={step.num} className="platform-card__step">
//                 <span
//                   className={cn(
//                     'platform-card__step-num',
//                     `platform-card__step-num--${platform}`,
//                   )}
//                 >
//                   {step.num}
//                 </span>
//                 <div>
//                   <p className="platform-card__step-title">{step.title}</p>
//                   <div className="platform-card__step-body">{step.body}</div>
//                 </div>
//               </li>
//             ))}
//           </ol>
//         )}
//       </div>

//       {/* Link Group */}
//       <div className="platform-card__link-section">
//         <p className="platform-card__link-label">
//           Enter the link code sent by the bot:
//         </p>
//         <div className="platform-card__link-row">
//           <Input
//             value={linkCode}
//             onChange={(e) => onLinkCodeChange(e.target.value.toUpperCase())}
//             placeholder="e.g. SNPX-1234-5678"
//             className={cn(
//               'platform-card__link-input',
//               isError && 'platform-card__link-input--error',
//             )}
//             onKeyDown={(e) => e.key === 'Enter' && onLinkGroup()}
//             disabled={isPending || isConnected}
//             maxLength={14}
//           />
//           <Button
//             onClick={onLinkGroup}
//             disabled={!linkCode.trim() || isPending || isConnected}
//             className={cn(
//               'platform-card__link-btn',
//               `platform-card__link-btn--${platform}`,
//               isConnected && 'platform-card__link-btn--success',
//             )}
//           >
//             {isPending ? (
//               <>
//                 <Loader2 size={15} className="animate-spin" /> Linking…
//               </>
//             ) : isConnected ? (
//               <>
//                 <CheckCircle2 size={15} /> Linked!
//               </>
//             ) : (
//               'Link Group'
//             )}
//           </Button>
//         </div>
//         {isError && linkError && (
//           <p className="platform-card__link-error">
//             <AlertCircle size={13} />
//             {linkError}
//           </p>
//         )}
//         {isConnected && (
//           <p className="platform-card__link-success">
//             <CheckCircle2 size={13} />
//             Group successfully connected!
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
