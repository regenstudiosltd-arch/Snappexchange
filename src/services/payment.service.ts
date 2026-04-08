import { apiClient } from '@/src/lib/axios';
import type {
  CashOutResponse,
  PaymentStatusResponse,
  TopUpInitializeResponse,
} from '@/src/types/payment';

export const paymentService = {
  /**
   * Step 1 of wallet top-up.
   * Calls the backend which calls Paystack /transaction/initialize.
   * Returns an access_code the frontend hands to Paystack Popup JS.
   */
  initializeTopUp: async (amount: number): Promise<TopUpInitializeResponse> => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post(
      '/accounts/payments/topup/initialize/',
      { amount: amount.toFixed(2) },
      { headers: { 'X-Idempotency-Key': idempotencyKey } },
    );
    return response.data;
  },

  /**
   * User-initiated cash-out to their registered MoMo account.
   * Backend debits wallet and initiates a Paystack Transfer immediately.
   * Final confirmation comes via webhook → notification.
   */
  cashOut: async (amount: number): Promise<CashOutResponse> => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post(
      '/accounts/payments/cashout/',
      { amount: amount.toFixed(2) },
      { headers: { 'X-Idempotency-Key': idempotencyKey } },
    );
    return response.data;
  },

  /**
   * Poll the status of a payment transaction by reference.
   * Use this as a fallback when you need to confirm status
   * before the webhook has been received.
   */
  getStatus: async (reference: string): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get(
      `/accounts/payments/status/${reference}/`,
    );
    return response.data;
  },
};
