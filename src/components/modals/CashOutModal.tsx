'use client';

import { useState } from 'react';
import { DollarSign, AlertCircle, Check } from 'lucide-react';
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

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  payoutAccount: {
    provider: string;
    number: string;
    name: string;
  };
}

export function CashOutModal({
  isOpen,
  onClose,
  availableBalance,
  payoutAccount,
}: CashOutModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const serviceFeePercent = 8;
  const numericAmount = parseFloat(amount) || 0;
  const serviceFee = numericAmount * (serviceFeePercent / 100);
  const amountAfterFee = numericAmount - serviceFee;

  const handleCashOut = async () => {
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update user balance in localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.totalSavings =
      (currentUser.totalSavings || availableBalance) - numericAmount;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    setIsProcessing(false);
    setIsSuccess(true);

    // Close after showing success
    setTimeout(() => {
      setIsSuccess(false);
      setAmount('');
      onClose();
    }, 2000);
  };

  const isValidAmount = numericAmount > 0 && numericAmount <= availableBalance;

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-card border-border">
          <div className="text-center py-10 space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Cash Out Successful!
              </h3>
              <p className="text-muted-foreground">
                ₵{amountAfterFee.toFixed(2)} has been sent to your{' '}
                {payoutAccount.provider} account
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <div className="bg-linear-to-br  from-cyan-600 to-teal-500  text-white rounded-xl p-5 shadow-sm">
            <div className="text-sm opacity-90 mb-1">Available Balance</div>
            <div className="text-3xl md:text-4xl font-bold">
              ₵{availableBalance.toFixed(2)}
            </div>
          </div>

          {/* Payout Account Info */}
          <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-3">
            <div className="text-sm text-muted-foreground">Payout Account</div>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-foreground">
                {payoutAccount.provider}
              </div>
              <div className="text-muted-foreground">
                {payoutAccount.number}
              </div>
              <div className="text-muted-foreground">{payoutAccount.name}</div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-foreground">
              Amount to Cash Out (₵)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 text-lg bg-background h-12"
                max={availableBalance}
              />
            </div>
            <div className="flex justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => setAmount((availableBalance / 2).toFixed(2))}
                className="text-primary hover:underline font-medium"
              >
                Half
              </button>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                className="text-primary hover:underline font-medium"
              >
                Max
              </button>
            </div>
          </div>

          {/* Fee Breakdown */}
          {numericAmount > 0 && (
            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cash Out Amount</span>
                <span className="font-medium text-foreground">
                  ₵{numericAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Service Fee ({serviceFeePercent}%)
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

          {/* Warning */}
          <div className="bg-amber-500/10 dark:bg-amber-900/20 border border-amber-500/30 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-100 space-y-1">
              <p className="font-medium">Please note:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Processing time: 5-30 minutes</li>
                <li>Service fee is non-refundable</li>
                <li>Ensure your mobile money account is active</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
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
              {isProcessing ? 'Processing...' : 'Confirm Cash Out'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
