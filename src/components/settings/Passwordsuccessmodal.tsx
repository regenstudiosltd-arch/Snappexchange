// src/components/settings/Passwordsuccessmodal.tsx

'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { PASSWORD_CHANGE_COUNTDOWN_SEC } from './Shared';
import { useCountdown } from '@/src/hooks/useSettings';

interface PasswordSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: () => void;
  onComplete: () => void;
}

const CIRCUMFERENCE = 282.74;

export function PasswordSuccessModal({
  open,
  onOpenChange,
  onSkip,
  onComplete,
}: PasswordSuccessModalProps) {
  const countdown = useCountdown(
    open,
    PASSWORD_CHANGE_COUNTDOWN_SEC,
    onComplete,
  );
  const strokeDashoffset =
    CIRCUMFERENCE * (1 - countdown / PASSWORD_CHANGE_COUNTDOWN_SEC);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="flex flex-col items-center text-center p-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Pulsing success ring */}
          <div className="relative flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-ping opacity-60" />
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle
                className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
            </div>
          </div>

          <DialogHeader className="flex flex-col items-center space-y-2 mb-8">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Password Updated
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your security details have been saved. We&apos;re routing you back
              to login.
            </DialogDescription>
          </DialogHeader>

          {/* Circular countdown */}
          <div className="relative flex items-center justify-center mb-8">
            <svg
              className="w-20 h-20 -rotate-90"
              viewBox="0 0 100 100"
              aria-label={`Redirecting in ${countdown} seconds`}
              role="timer"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                className="fill-none stroke-muted"
                strokeWidth="5"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="fill-none stroke-emerald-500 transition-all duration-1000 ease-linear"
                strokeWidth="5"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground tabular-nums"
              aria-hidden
            >
              {countdown}
            </span>
          </div>

          <Button
            onClick={onSkip}
            variant="outline"
            className="w-full h-11 rounded-xl text-sm font-medium border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
          >
            Login Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
