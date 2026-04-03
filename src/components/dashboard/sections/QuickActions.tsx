// src/components/dashboard/sections/QuickActions.tsx

'use client';

import { useMemo } from 'react';
import { PlusCircle, Users, Lightbulb, Bot, LucideIcon } from 'lucide-react';

import { cn } from '@/src/components/ui/utils';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onNavigate: (page: string) => void;
  setIsCreateGroupOpen: (open: boolean) => void;
  setIsJoinGroupOpen: (open: boolean) => void;
}

export function QuickActions({
  onNavigate,
  setIsCreateGroupOpen,
  setIsJoinGroupOpen,
}: QuickActionsProps) {
  const actions = useMemo<QuickAction[]>(
    () => [
      {
        icon: PlusCircle,
        label: 'Create Group',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        onClick: () => setIsCreateGroupOpen(true),
      },
      {
        icon: Users,
        label: 'Join Group',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        onClick: () => setIsJoinGroupOpen(true),
      },
      {
        icon: Lightbulb,
        label: 'AI Tips',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        onClick: () => onNavigate('AI Assistant'),
      },
      {
        icon: Bot,
        label: 'Chat Bot',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        onClick: () => onNavigate('Bot Integration'),
      },
    ],
    [onNavigate, setIsCreateGroupOpen, setIsJoinGroupOpen],
  );

  return (
    <div>
      <h3 className="mb-4 text-xl md:text-2xl font-semibold text-foreground">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(({ icon: Icon, label, color, bgColor, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md group bg-card"
            aria-label={label}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
                bgColor,
              )}
            >
              <Icon className={cn('h-7 w-7', color)} />
            </div>
            <span className="text-sm text-center font-medium text-foreground">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
