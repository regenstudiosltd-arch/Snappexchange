'use client';

import { useEffect, useState } from 'react';
import {
  Wallet,
  Smartphone,
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { usePaystackTopUp } from '@/src/hooks/usePaystackTopUp';

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after backend confirms wallet was credited */
  onComplete: (amount: number, method: string) => void;
  currentBalance: number;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 50000;

const DISPLAY_METHODS = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    icon: Smartphone,
    color: 'bg-yellow-500',
  },
  {
    id: 'telecel',
    name: 'Telecel Cash',
    icon: Smartphone,
    color: 'bg-red-500',
  },
  {
    id: 'airteltigo',
    name: 'AirtelTigo Money',
    icon: Smartphone,
    color: 'bg-blue-500',
  },
  {
    id: 'card',
    name: 'Debit / Credit Card',
    icon: CreditCard,
    color: 'bg-slate-600',
  },
];

export function TopUpWalletModal({
  isOpen,
  onClose,
  onComplete,
  currentBalance,
}: TopUpWalletModalProps) {
  const [amount, setAmount] = useState('');

  // Capture the submitted amount so success/pending screens always show
  // the right value even after `amount` state is cleared.
  const [submittedAmount, setSubmittedAmount] = useState<number>(0);

  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount =
    numericAmount >= MIN_AMOUNT && numericAmount <= MAX_AMOUNT;

  const {
    initiateTopUp,
    reset,
    status,
    errorMessage,
    isLoading,
    isSuccess,
    isPending,
  } = usePaystackTopUp({
    onSuccess: () => {
      // Intentionally empty — onComplete fires after the modal closes
      // so that router.refresh() runs after the dialog is unmounted.
    },
    onPending: () => {
      // Wallet not yet credited — the user will receive an in-app notification
      // once the Paystack webhook fires. We stay in 'pending' state so the
      // user sees the informational screen below.
    },
    onError: (msg) => {
      console.error('[TopUp] Payment error:', msg);
    },
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      console.error(
        '🚨 NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is missing in .env.local',
      );
    }
  }, []);

  // Auto-close 1.5 s after confirmed success, then fire onComplete so that
  // the parent's router.refresh() runs after the dialog is fully gone.
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setAmount('');
        reset();
        onClose();
        onComplete(submittedAmount, 'paystack');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose, reset, submittedAmount, onComplete]);

  const handlePay = () => {
    if (!isValidAmount || isLoading) return;
    setSubmittedAmount(numericAmount);
    initiateTopUp(numericAmount);
  };

  const handleClose = () => {
    // Block accidental close while payment is in-flight
    if (isLoading || status === 'open') return;
    setAmount('');
    reset();
    onClose();
  };

  // ── Dialog open logic ─────────────────────────────────────────────────────
  // Hide the Dialog backdrop while Paystack Popup is active so it doesn't
  // sit on top of the iframe.
  const isDialogOpen = isOpen && status !== 'open';

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  // ── Pending Screen ────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md bg-card border-border">
          <div className="text-center py-10 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Payment Processing
              </h3>
              <p className="text-sm text-muted-foreground">
                Your payment of <strong>₵{submittedAmount.toFixed(2)}</strong>{' '}
                was received by Paystack. Your wallet will be credited shortly —
                check your notifications.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      // Non-dismissible — auto-closes after 1.5 s
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-card border-border">
          <div className="text-center py-10 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Top-Up Successful!
              </h3>
              <p className="text-muted-foreground">
                ₵{submittedAmount.toFixed(2)} has been added to your SnappX
                wallet.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Closing in a moment…
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Verifying Screen ──────────────────────────────────────────────────────
  if (status === 'verifying') {
    return (
      // Non-dismissible while we wait for webhook confirmation
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-card border-border">
          <div className="text-center py-10 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Confirming Payment…
              </h3>
              <p className="text-sm text-muted-foreground">
                Waiting for your bank to confirm. This usually takes a few
                seconds.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main Modal ────────────────────────────────────────────────────────────
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[97vh] overflow-y-auto no-scrollbar bg-card border-border">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-foreground">
            <Wallet className="h-6 w-6 text-primary" />
            Top Up Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose an amount — Paystack will handle the rest securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Current Balance */}
          <div className="bg-muted/30 border border-border rounded-xl px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Current Balance
            </span>
            <span className="text-lg font-bold text-foreground">
              ₵{currentBalance.toFixed(2)}
            </span>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="topup-amount" className="text-foreground">
              Enter Amount (GHS)
            </Label>
            <Input
              id="topup-amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl text-center bg-background h-14"
              disabled={isLoading}
            />
            {numericAmount > MAX_AMOUNT && (
              <p className="text-xs text-destructive">
                Maximum top-up is ₵{MAX_AMOUNT.toLocaleString()}.
              </p>
            )}

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amt.toString())}
                  disabled={isLoading}
                  className={cn(
                    'text-sm font-medium',
                    amount === amt.toString() && 'border-primary bg-primary/5',
                  )}
                >
                  {amt}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Methods — display only; Paystack renders the channel picker */}
          <div className="space-y-3">
            <Label className="text-foreground text-sm">
              Available payment methods
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {DISPLAY_METHODS.map(({ id, name, icon: Icon, color }) => (
                <div
                  key={id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/20"
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0',
                      color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground leading-tight">
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Paystack securely handles the payment. You&apos;ll be prompted on
              your phone or shown a card form.
            </p>
          </div>

          {/* Error State */}
          {status === 'error' && errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Payment failed
                </p>
                <p className="text-xs text-destructive/80">{errorMessage}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try again
                </Button>
              </div>
            </div>
          )}

          {/* Cancelled Notice */}
          {status === 'cancelled' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/60 border border-border">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Payment was cancelled. Enter an amount and try again.
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
              disabled={!isValidAmount || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status === 'initializing' && 'Preparing…'}
                  {status === 'loading_script' && 'Loading…'}
                </>
              ) : (
                <>
                  Pay ₵{numericAmount > 0 ? numericAmount.toFixed(2) : '0.00'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
