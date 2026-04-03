// src/components/notification/components/DateGroupHeader.tsx

interface DateGroupHeaderProps {
  label: string;
}

export function DateGroupHeader({ label }: DateGroupHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 backdrop-blur-xl bg-background/80 border-b border-border/30">
      <div className="h-px flex-1 bg-border/40" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}
