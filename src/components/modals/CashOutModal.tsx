'use client';

import { useRef, useState } from 'react';
import { Banknote, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { paymentService } from '@/src/services/payment.service';

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  payoutAccount: {
    provider: string;
    number: string;
    name: string;
  };
  /** Called after backend confirms cashout was initiated */
  onComplete?: () => void;
}

const SERVICE_FEE_PERCENT = 8;
const MIN_CASHOUT = 5;

export function CashOutModal({
  isOpen,
  onClose,
  availableBalance,
  payoutAccount,
  onComplete,
}: CashOutModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronous lock — prevents double-submit from rapid clicks.
  const processingLockRef = useRef(false);

  // Capture the amount at submission time so the success screen shows
  // the correct value even if `amount` state is cleared on modal reset.
  const submittedAmountRef = useRef<number>(0);

  const numericAmount = parseFloat(amount) || 0;
  const serviceFee = numericAmount * (SERVICE_FEE_PERCENT / 100);
  const amountAfterFee = numericAmount - serviceFee;
  const isValidAmount =
    numericAmount >= MIN_CASHOUT && numericAmount <= availableBalance;

  const handleCashOut = async () => {
    if (!isValidAmount || processingLockRef.current) return;

    // Acquire lock synchronously before any await
    processingLockRef.current = true;
    setIsProcessing(true);
    setError(null);
    submittedAmountRef.current = numericAmount;

    try {
      await paymentService.cashOut(numericAmount);
      setIsSuccess(true);
      onComplete?.();

      // Auto-close after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        onClose();
      }, 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Cash out failed. Please try again.';
      setError(msg);
    } finally {
      processingLockRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setAmount('');
    setError(null);
    setIsSuccess(false);
    processingLockRef.current = false;
    onClose();
  };

  // ── Success Screen ───────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-card border-border">
          <div className="text-center py-10 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Cash Out Initiated!
              </h3>
              <p className="text-muted-foreground">
                ₵
                {(
                  submittedAmountRef.current -
                  (submittedAmountRef.current * SERVICE_FEE_PERCENT) / 100
                ).toFixed(2)}{' '}
                is on its way to your {payoutAccount.provider} account.
                You&apos;ll receive a notification once it arrives.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main Modal ───────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[97vh] overflow-y-auto no-scrollbar bg-card border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Cash Out
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Withdraw funds to your registered mobile money account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Available Balance */}
          <div className="bg-linear-to-br from-cyan-600 to-teal-500 text-white rounded-xl p-5 shadow-sm">
            <div className="text-sm opacity-90 mb-1">Available Balance</div>
            <div className="text-3xl md:text-4xl font-bold">
              ₵{availableBalance.toFixed(2)}
            </div>
          </div>

          {/* Payout Account Info */}
          <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-2">
            <div className="text-sm text-muted-foreground">Sending to</div>
            <div className="text-sm font-semibold text-foreground">
              {payoutAccount.provider}
            </div>
            <div className="text-sm text-muted-foreground">
              {payoutAccount.number}
            </div>
            <div className="text-sm text-muted-foreground">
              {payoutAccount.name}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="cashout-amount" className="text-foreground">
              Amount to Cash Out (₵)
            </Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="cashout-amount"
                type="number"
                step="0.01"
                min={MIN_CASHOUT}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className="pl-10 text-lg bg-background h-12"
                max={availableBalance}
                disabled={isProcessing}
              />
            </div>
            {numericAmount > 0 && numericAmount < MIN_CASHOUT && (
              <p className="text-xs text-destructive">
                Minimum cash out is ₵{MIN_CASHOUT}.
              </p>
            )}
            {numericAmount > availableBalance && (
              <p className="text-xs text-destructive">
                Amount exceeds your available balance.
              </p>
            )}
            <div className="flex justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => setAmount((availableBalance / 2).toFixed(2))}
                disabled={isProcessing}
                className="text-primary hover:underline font-medium disabled:opacity-50"
              >
                Half
              </button>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                disabled={isProcessing}
                className="text-primary hover:underline font-medium disabled:opacity-50"
              >
                Max
              </button>
            </div>
          </div>

          {/* Fee Breakdown */}
          {numericAmount >= MIN_CASHOUT && (
            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cash Out Amount</span>
                <span className="font-medium text-foreground">
                  ₵{numericAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Service Fee ({SERVICE_FEE_PERCENT}%)
                </span>
                <span className="text-destructive font-medium">
                  -₵{serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
                <span className="text-foreground">You&apos;ll Receive</span>
                <span className="text-xl text-primary">
                  ₵{amountAfterFee.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Warning Notice */}
          <div className="bg-amber-500/10 dark:bg-amber-900/20 border border-amber-500/30 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-100 space-y-1">
              <p className="font-medium">Please note:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Processing time: 5–30 minutes</li>
                <li>Service fee is non-refundable</li>
                <li>Ensure your mobile money account is active</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCashOut}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={!isValidAmount || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing…
                </>
              ) : (
                'Confirm Cash Out'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
