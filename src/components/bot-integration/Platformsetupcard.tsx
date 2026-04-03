// src/components/bot-integration/Platformsetupcard.tsx

'use client';

import { useState } from 'react';
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { BotPlatform, ConnectionStatus } from './bot.types';
import { cn } from '@/src/components/ui/utils';

interface Step {
  num: number;
  title: string;
  body: React.ReactNode;
}

interface PlatformSetupCardProps {
  platform: BotPlatform;
  contactValue: string; // bot number or username
  contactLabel: string;
  steps: Step[];
  accentColor: string; // tailwind color key e.g. 'green' | 'sky'
  icon: React.ReactNode;
  platformLabel: string;
  linkCode: string;
  connectionStatus: ConnectionStatus;
  copied: boolean;
  onCopy: () => void;
  onLinkCodeChange: (v: string) => void;
  onLinkGroup: () => void;
  linkError?: string | null;
}

export function PlatformSetupCard({
  platform,
  contactValue,
  contactLabel,
  steps,
  accentColor,
  icon,
  platformLabel,
  linkCode,
  connectionStatus,
  copied,
  onCopy,
  onLinkCodeChange,
  onLinkGroup,
  linkError,
}: PlatformSetupCardProps) {
  const [stepsExpanded, setStepsExpanded] = useState(true);

  const isGreen = accentColor === 'green';
  const isPending = connectionStatus === 'pending';
  const isConnected = connectionStatus === 'connected';
  const isError = connectionStatus === 'error';

  return (
    <div className={cn('platform-card', `platform-card--${platform}`)}>
      {/* Header */}
      <div className="platform-card__header">
        <div className="platform-card__icon-wrap">{icon}</div>
        <div>
          <h2 className="platform-card__title">{platformLabel} Setup</h2>
          <p className="platform-card__subtitle">
            Connect SnappX Bot to your {platformLabel} group
          </p>
        </div>
        <div className="platform-card__status-pill">
          <span
            className={cn(
              'platform-card__status-dot',
              isGreen
                ? 'platform-card__status-dot--green'
                : 'platform-card__status-dot--blue',
            )}
          />
          Active
        </div>
      </div>

      {/* Contact info */}
      <div className="platform-card__contact">
        <span className="platform-card__contact-label">{contactLabel}</span>
        <div className="platform-card__contact-row">
          <code className="platform-card__contact-value">{contactValue}</code>
          <button
            className={cn(
              'platform-card__copy-btn',
              copied && 'platform-card__copy-btn--copied',
            )}
            onClick={onCopy}
            aria-label="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Expandable Steps */}
      <div className="platform-card__steps-section">
        <button
          className="platform-card__steps-toggle"
          onClick={() => setStepsExpanded((p) => !p)}
        >
          <span>Setup Instructions</span>
          {stepsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {stepsExpanded && (
          <ol className="platform-card__steps">
            {steps.map((step) => (
              <li key={step.num} className="platform-card__step">
                <span
                  className={cn(
                    'platform-card__step-num',
                    `platform-card__step-num--${platform}`,
                  )}
                >
                  {step.num}
                </span>
                <div>
                  <p className="platform-card__step-title">{step.title}</p>
                  <div className="platform-card__step-body">{step.body}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Link Group */}
      <div className="platform-card__link-section">
        <p className="platform-card__link-label">
          Enter the link code sent by the bot:
        </p>
        <div className="platform-card__link-row">
          <Input
            value={linkCode}
            onChange={(e) => onLinkCodeChange(e.target.value.toUpperCase())}
            placeholder="e.g. SNPX-1234-5678"
            className={cn(
              'platform-card__link-input',
              isError && 'platform-card__link-input--error',
            )}
            onKeyDown={(e) => e.key === 'Enter' && onLinkGroup()}
            disabled={isPending || isConnected}
            maxLength={14}
          />
          <Button
            onClick={onLinkGroup}
            disabled={!linkCode.trim() || isPending || isConnected}
            className={cn(
              'platform-card__link-btn',
              `platform-card__link-btn--${platform}`,
              isConnected && 'platform-card__link-btn--success',
            )}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Linking…
              </>
            ) : isConnected ? (
              <>
                <CheckCircle2 size={15} /> Linked!
              </>
            ) : (
              'Link Group'
            )}
          </Button>
        </div>
        {isError && linkError && (
          <p className="platform-card__link-error">
            <AlertCircle size={13} />
            {linkError}
          </p>
        )}
        {isConnected && (
          <p className="platform-card__link-success">
            <CheckCircle2 size={13} />
            Group successfully connected!
          </p>
        )}
      </div>
    </div>
  );
}
