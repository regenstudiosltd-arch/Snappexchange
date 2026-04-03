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
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ConnectedGroup } from './bot.types';
import { cn } from '@/src/components/ui/utils';

interface ConnectedGroupsPanelProps {
  groups: ConnectedGroup[];
  isLoading: boolean;
  onUnlink: (groupId: string) => void;
  onRefresh: () => void;
  unlinkTarget: string | null;
  onSetUnlinkTarget: (id: string | null) => void;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
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

  const whatsappCount = groups.filter((g) => g.platform === 'whatsapp').length;
  const telegramCount = groups.filter((g) => g.platform === 'telegram').length;

  return (
    <div className="connected-panel">
      <div className="connected-panel__header">
        <div>
          <h2 className="connected-panel__title">Connected Groups</h2>
          <p className="connected-panel__subtitle">
            {groups.length} group{groups.length !== 1 ? 's' : ''} linked —{' '}
            {whatsappCount} WhatsApp, {telegramCount} Telegram
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={cn(
            'connected-panel__refresh',
            isLoading && 'connected-panel__refresh--spinning',
          )}
          aria-label="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {isLoading ? (
        <div className="connected-panel__skeleton-wrap">
          {[1, 2].map((i) => (
            <div key={i} className="connected-panel__skeleton" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="connected-panel__empty">
          <div className="connected-panel__empty-icon">
            <Wifi size={28} />
          </div>
          <p className="connected-panel__empty-title">
            No groups connected yet
          </p>
          <p className="connected-panel__empty-body">
            Follow the setup steps above and enter your group link code to get
            started.
          </p>
        </div>
      ) : (
        <ul className="connected-panel__list">
          {groups.map((group) => {
            const isWA = group.platform === 'whatsapp';
            const isUnlinking = unlinkTarget === group.id;

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
                  {/* Animated active pulse */}
                  {group.isActive && (
                    <span className="connected-panel__pulse" />
                  )}
                </div>

                {/* Info */}
                <div className="connected-panel__item-info">
                  <p className="connected-panel__item-name">
                    {group.groupName}
                  </p>
                  <div className="connected-panel__item-meta">
                    <span>
                      <Users size={11} />
                      {group.memberCount} members
                    </span>
                    {group.lastActivity && (
                      <span>
                        <Clock size={11} />
                        {timeAgo(group.lastActivity)}
                      </span>
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
                </div>

                {/* Status indicator */}
                <div className="connected-panel__item-status">
                  <span
                    className={cn(
                      'connected-panel__dot',
                      group.isActive && 'connected-panel__dot--active',
                    )}
                  />
                  {group.isActive ? 'Active' : 'Inactive'}
                </div>

                {/* Actions */}
                <div className="connected-panel__item-actions">
                  {isUnlinking ? (
                    <div className="connected-panel__confirm">
                      <span className="connected-panel__confirm-text">
                        Unlink?
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="connected-panel__confirm-yes"
                        onClick={() => onUnlink(group.id)}
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
                          setMenuOpen(menuOpen === group.id ? null : group.id)
                        }
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === group.id && (
                        <div className="connected-panel__dropdown">
                          {group.groupPublicId && (
                            <a
                              href={`/dashboard?page=Groups&group=${group.groupPublicId}`}
                              className="connected-panel__dropdown-item"
                              onClick={() => setMenuOpen(null)}
                            >
                              <ExternalLink size={13} />
                              View Group
                            </a>
                          )}
                          <button
                            className="connected-panel__dropdown-item connected-panel__dropdown-item--danger"
                            onClick={() => {
                              onSetUnlinkTarget(group.id);
                              setMenuOpen(null);
                            }}
                          >
                            <Trash2 size={13} />
                            Unlink Bot
                          </button>
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
