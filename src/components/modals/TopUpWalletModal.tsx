"use client";

import { useState } from "react";
import { Wallet, CreditCard, Smartphone, Check, ArrowRight, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (amount: number, method: string) => void;
  currentBalance: number;
}

export function TopUpWalletModal({ isOpen, onClose, onComplete }: TopUpWalletModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "mtn",
      name: "MTN Mobile Money",
      icon: Smartphone,
      color: "bg-yellow-500",
      description: "Pay with MTN MoMo",
    },
    {
      id: "vodafone",
      name: "Vodafone Cash",
      icon: Smartphone,
      color: "bg-red-500",
      description: "Pay with Vodafone Cash",
    },
    {
      id: "airteltigo",
      name: "AirtelTigo Money",
      icon: Smartphone,
      color: "bg-blue-500",
      description: "Pay with AirtelTigo",
    },
    {
      id: "visa",
      name: "Visa Card",
      icon: CreditCard,
      color: "bg-blue-600",
      description: "Pay with Visa",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      icon: CreditCard,
      color: "bg-orange-500",
      description: "Pay with Mastercard",
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const amountNum = parseFloat(amount);
    onComplete(amountNum, selectedMethod);
    
    // Reset and close
    setIsProcessing(false);
    setStep(3);
    
    setTimeout(() => {
      setStep(1);
      setAmount("");
      setSelectedMethod("");
      setPhoneNumber("");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setAmount("");
    setSelectedMethod("");
    setPhoneNumber("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    onClose();
  };

  const isMobileMoney = selectedMethod === "mtn" || selectedMethod === "vodafone" || selectedMethod === "airteltigo";
  const isCard = selectedMethod === "visa" || selectedMethod === "mastercard";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-cyan-600" />
            {step === 1 ? "Top Up Wallet" : step === 2 ? "Enter Payment Details" : "Payment Successful"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Choose your preferred payment method"}
            {step === 2 && "Complete your payment to add funds"}
            {step === 3 && "Your wallet has been topped up successfully"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Amount & Payment Method Selection */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-3">
              <Label htmlFor="amount">Enter Amount (GHS)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xl text-center"
              />
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    className="text-xs"
                  >
                    {amt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method.id)}
                      disabled={!amount || parseFloat(amount) <= 0}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all hover:border-cyan-500 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedMethod === method.id ? "border-cyan-500 bg-cyan-50" : "border-gray-200"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full ${method.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Amount to Pay</span>
                <span className="text-xl">GHS {parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>

            {/* Mobile Money Details */}
            {isMobileMoney && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="momo-number">Mobile Money Number</Label>
                  <Input
                    id="momo-number"
                    type="tel"
                    placeholder="024XXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Payment Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>You'll receive a prompt on your phone</li>
                      <li>Enter your Mobile Money PIN to confirm</li>
                      <li>Wait for confirmation message</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Card Details */}
            {isCard && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    Your card information is encrypted and secure. We never store your full card details.
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                disabled={
                  isProcessing ||
                  (isMobileMoney && !phoneNumber) ||
                  (isCard && (!cardNumber || !expiryDate || !cvv))
                }
              >
                {isProcessing ? "Processing..." : `Pay GHS ${parseFloat(amount).toFixed(2)}`}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              GHS {parseFloat(amount).toFixed(2)} has been added to your wallet
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
              Your wallet balance has been updated and is ready for automatic deductions.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
