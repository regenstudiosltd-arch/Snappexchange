// src/components/notification/components/EmptyState.tsx

import { motion } from 'framer-motion';

import { cn } from '@/src/components/ui/utils';
import { EMPTY_STATES } from '../constants';
import type { TabId } from '../types';

interface EmptyStateProps {
  tab: TabId;
}

export function EmptyState({ tab }: EmptyStateProps) {
  const { icon: Icon, heading, sub, color } = EMPTY_STATES[tab];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-14 px-8 text-center"
    >
      <div className="relative mb-4">
        <div className="rounded-2xl bg-muted/50 p-5">
          <Icon className={cn('h-8 w-8', color)} />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -inset-1 rounded-3xl bg-muted/20 -z-10"
        />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1.5">{heading}</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-55">
        {sub}
      </p>
    </motion.div>
  );
}
