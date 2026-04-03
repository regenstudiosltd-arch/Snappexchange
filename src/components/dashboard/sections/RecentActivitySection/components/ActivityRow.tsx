// src/components/dashboard/sections/RecentActivitySection/components/ActivityRow.tsx

import { ExternalLink } from 'lucide-react';

import { cn } from '@/src/components/ui/utils';
import { TX_CONFIG, formatAmount, timeAgo, formatTime } from '../utils';
import type { ActivityItem, RecentActivityProps } from '@/src/types/dashboard';

interface ActivityRowProps {
  item: ActivityItem;
  onNavigate?: RecentActivityProps['onNavigate'];
}

export function ActivityRow({ item, onNavigate }: ActivityRowProps) {
  // Fall back to contribution config if an unknown type arrives from the API
  const cfg = TX_CONFIG[item.type] ?? TX_CONFIG.contribution;
  const Icon = cfg.icon;
  const isCredit = item.direction === 'credit';
  const isClickable = !!(item.related_group_public_id || item.related_goal_id);
  const primaryLabel =
    item.related_group_name || item.related_goal_name || cfg.label;

  function handleClick() {
    if (!onNavigate) return;
    if (item.related_group_public_id) {
      onNavigate('Groups', { group: item.related_group_public_id });
    } else if (item.related_goal_id) {
      onNavigate('Goals');
    }
  }

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => isClickable && e.key === 'Enter' && handleClick()}
      className={cn(
        'group relative flex items-center gap-3.5 px-5 py-3.5',
        'transition-colors duration-150',
        isClickable
          ? 'cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30'
          : 'cursor-default',
      )}
    >
      {/* Type icon */}
      <div
        className={cn(
          'relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
          'transition-transform duration-150',
          cfg.iconBg,
          isClickable && 'group-hover:scale-105',
        )}
      >
        <Icon className={cn('h-4 w-4', cfg.iconColor)} />
        {/* Credit / debit indicator dot */}
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-[1.5px] ring-card',
            isCredit ? 'bg-emerald-500' : 'bg-rose-400',
          )}
        />
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[13px] font-medium text-foreground truncate leading-snug">
            {primaryLabel}
          </span>
          {isClickable && (
            <ExternalLink className="h-3 w-3 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Type chip */}
          <span
            className={cn(
              'text-[10px] font-semibold px-1.5 py-px rounded-md',
              cfg.iconBg,
              cfg.iconColor,
            )}
          >
            {cfg.shortLabel}
          </span>
          <span className="text-[11px] text-muted-foreground/70">
            {timeAgo(item.created_at)}
          </span>
        </div>
      </div>

      {/* Amount + time */}
      <div className="text-right shrink-0 pl-2">
        <div
          className={cn(
            'text-[13px] font-bold tabular-nums tracking-tight',
            isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-foreground',
          )}
        >
          {formatAmount(item.amount, item.direction)}
        </div>
        <div className="text-[11px] text-muted-foreground/60 mt-0.5 tabular-nums">
          {formatTime(item.created_at)}
        </div>
      </div>
    </div>
  );
}
