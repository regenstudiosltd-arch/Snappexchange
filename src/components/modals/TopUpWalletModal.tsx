// src/components/modals/TopUpWalletModal.tsx

'use client';

import { useState } from 'react';
import {
  Wallet,
  CreditCard,
  Smartphone,
  Check,
  ArrowRight,
  AlertCircle,
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
interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (amount: number, method: string) => void;
  currentBalance: number;
}

export function TopUpWalletModal({
  isOpen,
  onClose,
  onComplete,
}: TopUpWalletModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      icon: Smartphone,
      color: 'bg-yellow-500 dark:bg-yellow-600',
      description: 'Pay with MTN MoMo',
    },
    {
      id: 'vodafone',
      name: 'Vodafone Cash',
      icon: Smartphone,
      color: 'bg-red-500 dark:bg-red-600',
      description: 'Pay with Vodafone Cash',
    },
    {
      id: 'airteltigo',
      name: 'AirtelTigo Money',
      icon: Smartphone,
      color: 'bg-blue-500 dark:bg-blue-600',
      description: 'Pay with AirtelTigo',
    },
    {
      id: 'visa',
      name: 'Visa Card',
      icon: CreditCard,
      color: 'bg-blue-600 dark:bg-blue-700',
      description: 'Pay with Visa',
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      icon: CreditCard,
      color: 'bg-orange-500 dark:bg-orange-600',
      description: 'Pay with Mastercard',
    },
  ];

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep(2);
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const amountNum = parseFloat(amount);
    onComplete(amountNum, selectedMethod);

    // Reset and close
    setIsProcessing(false);
    setStep(3);

    setTimeout(() => {
      setStep(1);
      setAmount('');
      setSelectedMethod('');
      setPhoneNumber('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setSelectedMethod('');
    setPhoneNumber('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    onClose();
  };

  const isMobileMoney =
    selectedMethod === 'mtn' ||
    selectedMethod === 'vodafone' ||
    selectedMethod === 'airteltigo';
  const isCard = selectedMethod === 'visa' || selectedMethod === 'mastercard';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[97vh] overflow-y-auto no-scrollbar bg-card border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-foreground">
            <Wallet className="h-6 w-6 text-primary" />
            {step === 1
              ? 'Top Up Wallet'
              : step === 2
                ? 'Enter Payment Details'
                : 'Payment Successful'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1 && 'Choose your preferred payment method'}
            {step === 2 && 'Complete your payment to add funds'}
            {step === 3 && 'Your wallet has been topped up successfully'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Amount & Payment Method Selection */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-4">
              <Label htmlFor="amount" className="text-foreground">
                Enter Amount (GHS)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl text-center bg-background h-14"
              />

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    className={cn(
                      'text-sm font-medium',
                      amount === amt.toString() &&
                        'border-primary bg-primary/5',
                    )}
                  >
                    {amt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <Label className="text-foreground">Select Payment Method</Label>
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method.id)}
                      disabled={!amount || parseFloat(amount) <= 0}
                      className={cn(
                        'flex items-center gap-4 p-4 border rounded-xl transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed',
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border',
                      )}
                    >
                      <div
                        className={cn(
                          'h-12 w-12 rounded-full flex items-center justify-center text-white',
                          method.color,
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-foreground">
                          {method.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Amount to Pay
                </span>
                <span className="text-xl font-bold text-foreground">
                  GHS {parseFloat(amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">
                  {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>

            {/* Mobile Money Details */}
            {isMobileMoney && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="momo-number" className="text-foreground">
                    Mobile Money Number
                  </Label>
                  <Input
                    id="momo-number"
                    type="tel"
                    placeholder="024XXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-primary/90">
                    <p className="font-medium mb-2">Payment Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs">
                      <li>You&apos;ll receive a prompt on your phone</li>
                      <li>Enter your Mobile Money PIN to confirm</li>
                      <li>Wait for confirmation message</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Card Details */}
            {isCard && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number" className="text-foreground">
                    Card Number
                  </Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="text-foreground">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-foreground">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-primary/90">
                    Your card information is encrypted and secure. We never
                    store your full card details.
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-5">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button
                onClick={handleProcessPayment}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={
                  isProcessing ||
                  (isMobileMoney && !phoneNumber) ||
                  (isCard && (!cardNumber || !expiryDate || !cvv))
                }
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay GHS ${parseFloat(amount).toFixed(2)}`}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-10 space-y-6">
            <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Payment Successful!
            </h3>
            <p className="text-lg text-muted-foreground">
              GHS {parseFloat(amount).toFixed(2)} has been added to your wallet
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm text-primary/90">
              Your wallet balance has been updated and is ready for automatic
              deductions.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
