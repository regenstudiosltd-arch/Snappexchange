'use client';

import { cn } from '@/src/components/ui/utils';
import { CreateStep } from './types';
// import { CreateStep, STEP_META } from './types';
import { Check } from 'lucide-react';

// Re-export STEP_META from types so the component is self-contained for consumers
// export { STEP_META };

interface StepIndicatorProps {
  currentStep: CreateStep;
}

const STEPS: CreateStep[] = [1, 2, 3];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mt-5 space-y-3">
      {/* Step labels */}
      <div className="flex items-center justify-between">
        {STEPS.map((s) => {
          const done = currentStep > s;
          const active = currentStep === s;
          return (
            <div
              key={s}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                active
                  ? 'text-primary'
                  : done
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/40',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : done
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground/40',
                )}
              >
                {done ? <Check className="h-3 w-3" /> : s}
              </span>
              {/* <span className="hidden sm:inline">{STEP_META[s].title}</span> */}
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="flex gap-1.5">
        {STEPS.map((s) => (
          <div
            key={s}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              currentStep >= s ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    </div>
  );
}
