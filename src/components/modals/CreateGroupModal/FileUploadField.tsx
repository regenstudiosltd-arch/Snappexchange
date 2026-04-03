'use client';

import { CheckCircle2, Upload } from 'lucide-react';
import { cn } from '@/src/components/ui/utils';

interface FileUploadFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}

export function FileUploadField({
  label,
  file,
  onChange,
  accept = 'image/*',
}: FileUploadFieldProps) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-all duration-150',
        file
          ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          file
            ? 'bg-primary/15 text-primary'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
        )}
      >
        {file ? (
          <CheckCircle2 className="h-4.5 w-4.5" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            file ? 'text-primary' : 'text-foreground',
          )}
        >
          {file ? file.name : label}
        </p>
        {file && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(0)} KB · Click to replace
          </p>
        )}
      </div>

      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
