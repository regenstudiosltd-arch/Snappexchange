export interface TopUpInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface CashOutResponse {
  message: string;
  amount_requested: string | number;
  service_fee: string | number;
  amount_to_receive: string | number;
  reference: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  transaction_type: 'topup' | 'payout' | 'cashout';
  amount: string | number;
  created_at: string;
}

export type PaystackChannel =
  | 'card'
  | 'mobile_money'
  | 'bank'
  | 'ussd'
  | 'bank_transfer';

// Shape of the object Paystack Popup passes to onSuccess callback
export interface PaystackPopupSuccessResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  redirecturl?: string;
}

type PaystackBaseConfig = {
  key: string;
  channels?: PaystackChannel[];
  onSuccess?: (response: PaystackPopupSuccessResponse) => void;
  onCancel?: () => void;
  onLoad?: (response: { iframe: HTMLIFrameElement }) => void;
};

type PaystackAccessCodeConfig = PaystackBaseConfig & {
  access_code: string;
  email?: string;
  amount?: number;
  ref?: string;
  currency?: string;
};

type PaystackDirectConfig = PaystackBaseConfig & {
  access_code?: never;
  email: string;
  amount: number;
  ref?: string;
  currency?: string;
};

export type PaystackInlineConfig =
  | PaystackAccessCodeConfig
  | PaystackDirectConfig;

export interface PaystackPop {
  newTransaction: (config: PaystackInlineConfig) => void;
  resumeTransaction: (accessCode: string) => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      new (): PaystackPop;
    };
  }
}
