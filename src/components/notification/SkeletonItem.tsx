// src/components/NotificationPanel/skeletons/SkeletonItem.tsx

import { motion } from 'framer-motion';

interface SkeletonItemProps {
  index: number;
}

export function SkeletonItem({ index }: SkeletonItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 px-4 py-4 border-l-2 border-l-transparent"
    >
      <div className="mt-0.5 h-9 w-9 rounded-xl bg-muted/60 animate-pulse" />
      <div className="flex-1 space-y-2.5 pt-0.5">
        <div
          className="h-3.5 rounded-lg bg-muted/60 animate-pulse"
          style={{ width: `${55 + (index % 3) * 15}%` }}
        />
        <div
          className="h-3 rounded-lg bg-muted/40 animate-pulse"
          style={{ width: `${70 + (index % 2) * 10}%` }}
        />
        <div className="h-2.5 w-16 rounded-lg bg-muted/30 animate-pulse" />
      </div>
    </motion.div>
  );
}
