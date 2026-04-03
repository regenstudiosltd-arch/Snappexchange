// src/components/auth/PageShell.tsx

'use client';

import { useState } from 'react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { cn } from '@/src/components/ui/utils';

/* ─── Shell ──────────────────────────────────────────────────────────────── */

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-start md:items-center justify-center py-8 px-4 bg-[#F5F1EC] dark:bg-[#080B10] transition-colors duration-500">
      {/* ── Light-mode blobs ── */}
      <div
        aria-hidden
        className="dark:hidden pointer-events-none absolute -top-60 -left-52 w-175 h-175 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(220,38,38,0.14) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        aria-hidden
        className="dark:hidden pointer-events-none absolute -bottom-40 -right-40 w-[150 h-[150 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        aria-hidden
        className="dark:hidden pointer-events-none absolute top-1/3 right-1/4 w-100 h-100 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)',
          filter: 'blur(90px)',
        }}
      />

      {/* ── Dark-mode blobs ── */}
      <div
        aria-hidden
        className="hidden dark:block pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #DC2626 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden
        className="hidden dark:block pointer-events-none absolute -bottom-40 -right-40 w-125 h-125 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden
        className="hidden dark:block pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #F59E0B 0%, transparent 60%)',
          filter: 'blur(120px)',
        }}
      />

      {/* ── Grid — light ── */}
      <div
        aria-hidden
        className="dark:hidden pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      {/* ── Grid — dark ── */}
      <div
        aria-hidden
        className="hidden dark:block pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

/* ─── BrandMark ──────────────────────────────────────────────────────────── */

export function AuthBrandMark() {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-white text-[17px] tracking-tighter select-none shadow-lg"
        style={{
          background:
            'linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #059669 100%)',
        }}
      >
        SX
      </div>
      <span className="text-gray-400 dark:text-white/50 text-sm font-semibold tracking-[0.2em] uppercase">
        SnappX
      </span>
    </div>
  );
}

/* ─── AuthInput ──────────────────────────────────────────────────────────── */

export interface AuthInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  id: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  rightElement?: React.ReactNode;
  error?: string;
}

export function AuthInput({
  id,
  label,
  placeholder,
  type = 'text',
  icon: Icon,
  rightElement,
  error,
  className,
  onFocus: externalFocus,
  onBlur: externalBlur,
  ...props
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label
          htmlFor={id}
          className="block text-gray-500 dark:text-white/45 text-[10.5px] font-bold uppercase tracking-[0.15em]"
        >
          {label}
        </Label>
      )}

      <div
        className={cn(
          'relative rounded-xl border transition-all duration-200',
          'bg-white/70 dark:bg-white/4',
          focused
            ? 'border-amber-400/80 dark:border-amber-500/50 shadow-[0_0_0_3px_rgba(245,158,11,0.12)] dark:shadow-[0_0_0_3px_rgba(245,158,11,0.08)]'
            : error
              ? 'border-red-400/60 dark:border-red-500/40 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
              : 'border-gray-200/80 dark:border-white/8 hover:border-gray-300/80 dark:hover:border-white/[0.14]',
        )}
      >
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.75 w-3.75 text-gray-350 dark:text-white/22 pointer-events-none" />
        )}

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn(
            'border-0 bg-transparent h-12 text-gray-900 dark:text-white text-[15px]',
            'placeholder:text-gray-300/90 dark:placeholder:text-white/18',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            Icon ? 'pl-10' : 'pl-4',
            rightElement ? 'pr-11' : 'pr-4',
            className,
          )}
          onFocus={(e) => {
            setFocused(true);
            externalFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            externalBlur?.(e);
          }}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11.5px] text-red-500 dark:text-red-400 font-medium mt-0.5 leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── AuthSelectionGrid ──────────────────────────────────────────────────── */

interface AuthSelectionGridProps {
  label?: string;
  options: readonly string[];
  currentValue: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AuthSelectionGrid({
  label,
  options,
  currentValue,
  onChange,
  error,
}: AuthSelectionGridProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="block text-gray-500 dark:text-white/45 text-[10.5px] font-bold uppercase tracking-[0.15em]">
          {label}
        </Label>
      )}

      <div
        className={cn(
          'grid gap-2.5',
          options.length > 2 ? 'grid-cols-3' : 'grid-cols-2',
        )}
      >
        {options.map((option) => {
          const selected = currentValue === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                'h-12 rounded-xl border text-sm font-semibold capitalize transition-all duration-200',
                selected
                  ? [
                      'border-amber-400/70 dark:border-amber-500/50',
                      'bg-amber-50 dark:bg-amber-500/10',
                      'text-amber-700 dark:text-amber-400',
                      'shadow-[0_0_0_1px_rgba(245,158,11,0.25)] dark:shadow-none',
                    ].join(' ')
                  : [
                      'border-gray-200/80 dark:border-white/8',
                      'bg-white/60 dark:bg-white/3',
                      'text-gray-500 dark:text-white/35',
                      'hover:border-gray-300 dark:hover:border-white/15',
                      'hover:bg-gray-50 dark:hover:bg-white/6',
                      'hover:text-gray-700 dark:hover:text-white/55',
                    ].join(' '),
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-[11.5px] text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
