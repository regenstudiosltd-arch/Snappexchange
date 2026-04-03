// src/components/dashboard/sections/RecentActivitySection/components/FilterBar.tsx

import { cn } from '@/src/components/ui/utils';
import { FILTER_OPTIONS } from '../utils';
import type { FilterType } from '@/src/types/dashboard';

interface FilterBarProps {
  active: FilterType;
  onChange: (filter: FilterType) => void;
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1 px-1 py-1 bg-muted/50 dark:bg-muted/30 rounded-xl ring-1 ring-border/40 overflow-x-auto no-scrollbar">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap',
            active === opt.value
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
