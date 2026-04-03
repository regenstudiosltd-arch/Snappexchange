// src/components/notification/components/TabBar.tsx

import { motion } from 'framer-motion';

import { cn } from '@/src/components/ui/utils';
import { TABS } from '../constants';
import type { TabId, TabCounts } from '../types';

interface TabBarProps {
  activeTab: TabId;
  tabCounts: TabCounts;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, tabCounts, onTabChange }: TabBarProps) {
  return (
    <div className="flex px-2 gap-0.5 border-b border-border/40">
      {TABS.map((tab) => {
        const count = tabCounts[tab.id];
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative pb-3 pt-2 px-3 text-xs font-semibold transition-all duration-200 rounded-t-lg',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground/60 hover:text-muted-foreground',
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'inline-flex items-center justify-center rounded-full text-[9px] font-bold min-w-4 h-4 px-1',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground/70',
                    tab.id === 'unread' && count > 0 && !isActive
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                      : '',
                  )}
                >
                  {count > 99 ? '99+' : count}
                </motion.span>
              )}
            </span>

            {isActive && (
              <motion.div
                layoutId="notif-tab-indicator"
                className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
