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
        <DialogContent className="max-w-md">
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#059669]/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-[#059669]" />
            </div>
            <div>
              <h3 className="text-xl mb-2">Cash Out Successful!</h3>
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
      <DialogContent className="max-w-md max-h-[97vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>Cash Out</DialogTitle>
          <DialogDescription>
            Withdraw funds to your registered mobile money account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Available Balance */}
          <div className="bg-linear-to-br from-[#DC2626] to-[#B91C1C] text-white rounded-lg p-4">
            <div className="text-sm opacity-90 mb-1">Available Balance</div>
            <div className="text-3xl">₵{availableBalance.toFixed(2)}</div>
          </div>

          {/* Payout Account Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Payout Account</div>
            <div>
              <div className="text-sm">{payoutAccount.provider}</div>
              <div className="text-sm">{payoutAccount.number}</div>
              <div className="text-sm">{payoutAccount.name}</div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Cash Out (₵)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 text-lg"
                max={availableBalance}
              />
            </div>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setAmount((availableBalance / 2).toFixed(2))}
                className="text-[#DC2626] hover:underline"
              >
                Half
              </button>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                className="text-[#DC2626] hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          {/* Fee Breakdown */}
          {numericAmount > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cash Out Amount</span>
                <span>₵{numericAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Service Fee ({serviceFeePercent}%)
                </span>
                <span className="text-[#DC2626]">
                  -₵{serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span>You&apos;ll Receive</span>
                <span className="text-xl text-[#059669]">
                  ₵{amountAfterFee.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="mb-1">Please note:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Processing time: 5-30 minutes</li>
                <li>• Service fee is non-refundable</li>
                <li>• Ensure your mobile money account is active</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
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
              className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C]"
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
