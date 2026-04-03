// src/components/bot-integration/BotCapabilities.tsx

'use client';

import { Bell, TrendingUp, Users, Clock, Shield, Zap } from 'lucide-react';
import { cn } from '@/src/components/ui/utils';

const CAPABILITIES = [
  {
    icon: Bell,
    title: 'Smart Reminders',
    description:
      'Auto-sends contribution reminders 48h, 24h, and 1h before deadlines — so no one misses a cycle.',
    badge: 'Automated',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Updates',
    description:
      'Instant notifications the moment a payment is received, verified, or a payout is processed.',
    badge: 'Live',
    color: 'teal',
  },
  {
    icon: Users,
    title: 'Payout Announcements',
    description:
      "Public announcements in your group when it's a member's turn to collect — transparent & exciting.",
    badge: 'Social',
    color: 'violet',
  },
  {
    icon: Clock,
    title: 'Activity Feed',
    description:
      "Daily digest of group activity: who contributed, who's pending, and cycle completion status.",
    badge: 'Daily',
    color: 'sky',
  },
  {
    icon: Shield,
    title: 'Fraud Alerts',
    description:
      'Suspicious activity detected by SnappX is immediately flagged to the group admin.',
    badge: 'Security',
    color: 'red',
  },
  {
    icon: Zap,
    title: 'Quick Commands',
    description:
      'Members can check their balance, upcoming dates, and group status with simple bot commands.',
    badge: 'Interactive',
    color: 'green',
  },
];

export function BotCapabilities() {
  return (
    <div className="capabilities">
      <div className="capabilities__header">
        <h2 className="capabilities__title">What the Bot Does</h2>
        <p className="capabilities__subtitle">
          Six automated superpowers for your susu circle
        </p>
      </div>
      <div className="capabilities__grid">
        {CAPABILITIES.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.title}
              className={cn('cap-card', `cap-card--${cap.color}`)}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="cap-card__top">
                <div
                  className={cn(
                    'cap-card__icon',
                    `cap-card__icon--${cap.color}`,
                  )}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={cn(
                    'cap-card__badge',
                    `cap-card__badge--${cap.color}`,
                  )}
                >
                  {cap.badge}
                </span>
              </div>
              <h3 className="cap-card__title">{cap.title}</h3>
              <p className="cap-card__desc">{cap.description}</p>
              {/* Glow orb */}
              <div
                className={cn('cap-card__orb', `cap-card__orb--${cap.color}`)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
