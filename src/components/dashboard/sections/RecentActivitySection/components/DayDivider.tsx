// src/components/dashboard/sections/RecentActivitySection/components/DayDivider.tsx

interface DayDividerProps {
  label: string;
}

export function DayDivider({ label }: DayDividerProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-2 sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}
