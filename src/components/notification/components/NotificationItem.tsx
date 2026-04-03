// src/components/notification/components/NotificationItem.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Users, Target } from 'lucide-react';

import { cn } from '@/src/components/ui/utils';
import { getConfig } from '../utils';
import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (page: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const {
    icon: Icon,
    gradient,
    iconColor,
    accentColor,
  } = getConfig(notification.notification_type);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleClick() {
    if (!notification.is_read) onMarkAsRead(notification.id);
    if (notification.action_url) onNavigate(notification.action_url);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setIsDeleting(true);
    // Small delay for exit animation
    setTimeout(() => onDelete(notification.id), 200);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{
        opacity: isDeleting ? 0 : 1,
        x: 0,
        scale: isDeleting ? 0.95 : 1,
      }}
      exit={{
        opacity: 0,
        x: -20,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={handleClick}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-4 cursor-pointer',
        'border-l-2 transition-all duration-200',
        !notification.is_read
          ? `${accentColor} bg-linear-to-r ${gradient}`
          : 'border-l-transparent',
        'hover:bg-muted/40 dark:hover:bg-white/3',
      )}
    >
      {/* Unread pulse indicator */}
      <AnimatePresence>
        {!notification.is_read && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-3 top-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon container */}
      <div
        className={cn(
          'mt-0.5 shrink-0 rounded-xl p-2.5 transition-transform duration-200',
          `bg-linear-to-br ${gradient}`,
          'group-hover:scale-110',
          'ring-1 ring-white/10 dark:ring-white/5',
        )}
      >
        <Icon className={cn('h-4 w-4', iconColor)} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-6">
        <p
          className={cn(
            'text-sm leading-snug',
            !notification.is_read
              ? 'font-semibold text-foreground'
              : 'font-medium text-muted-foreground',
          )}
        >
          {notification.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-muted-foreground/60 tabular-nums">
            {notification.time_ago}
          </span>
          {notification.related_group_name && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/70 max-w-35 truncate">
              <Users className="h-2.5 w-2.5 shrink-0" />
              {notification.related_group_name}
            </span>
          )}
          {notification.related_goal_name && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/70 max-w-35 truncate">
              <Target className="h-2.5 w-2.5 shrink-0" />
              {notification.related_goal_name}
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleDelete}
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          'p-1.5 rounded-lg',
          'opacity-0 group-hover:opacity-100',
          'transition-all duration-150',
          'hover:bg-rose-100 dark:hover:bg-rose-900/30',
          'text-muted-foreground/40 hover:text-rose-500',
          'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50',
        )}
        aria-label="Delete notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}
