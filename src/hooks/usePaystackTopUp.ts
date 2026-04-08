// src/hooks/usePaystackTopUp.ts

'use client';

import { useCallback, useRef, useState } from 'react';
import { paymentService } from '@/src/services/payment.service';

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v2/inline.js';
const SCRIPT_ID = 'paystack-inline-js';

// How many times to poll for confirmation after Popup closes
const MAX_POLLS = 8;
const POLL_INTERVAL_MS = 2500;

export type TopUpStatus =
  | 'idle'
  | 'initializing'
  | 'loading_script'
  | 'open'
  | 'verifying'
  | 'success'
  | 'pending'
  | 'cancelled'
  | 'error';

export interface UsePaystackTopUpOptions {
  onSuccess?: (amountGhs: number) => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
  onPending?: () => void;
}

export function usePaystackTopUp(options: UsePaystackTopUpOptions = {}) {
  const { onSuccess, onCancel, onError, onPending } = options;

  const [status, setStatus] = useState<TopUpStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store the reference so we can poll it after Popup closes
  const referenceRef = useRef<string | null>(null);
  const amountRef = useRef<number>(0);

  // ── Script loader
  const ensureScriptLoaded = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (typeof window !== 'undefined' && window.PaystackPop) {
        resolve();
        return;
      }

      // Script tag already in DOM (loading in progress)
      if (document.getElementById(SCRIPT_ID)) {
        const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () =>
          reject(new Error('Failed to load Paystack script')),
        );
        return;
      }

      // Inject fresh script tag
      setStatus('loading_script');
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = PAYSTACK_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load Paystack payment script'));
      document.head.appendChild(script);
    });
  }, []);

  // ── Status poller
  const pollForConfirmation = useCallback(
    async (reference: string, amount: number) => {
      setStatus('verifying');

      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        try {
          const result = await paymentService.getStatus(reference);

          if (result.status === 'success') {
            setStatus('success');
            onSuccess?.(amount);
            return;
          }

          if (result.status === 'failed') {
            const msg = 'Payment was not successful. Please try again.';
            setStatus('error');
            setErrorMessage(msg);
            onError?.(msg);
            return;
          }
        } catch {
          // Network blip — keep trying until MAX_POLLS
        }
      }
      setStatus('pending');
      onPending?.();
    },
    [onSuccess, onPending, onError],
  );

  // ── Main trigger
  const initiateTopUp = useCallback(
    async (amountGhs: number) => {
      if (status === 'initializing' || status === 'open') return;

      setStatus('initializing');
      setErrorMessage(null);
      amountRef.current = amountGhs;

      try {
        // 1. Backend initializes transaction, returns access_code
        const { access_code, reference } =
          await paymentService.initializeTopUp(amountGhs);

        referenceRef.current = reference;

        // 2. Ensure Paystack Popup JS is loaded
        await ensureScriptLoaded();

        if (!window.PaystackPop) {
          throw new Error('Paystack Popup JS failed to initialize');
        }

        // 3. Open Paystack Popup
        setStatus('open');
        const popup = new window.PaystackPop();

        popup.resumeTransaction(access_code);

        // Paystack V2 Popup fires these events on the window
        // We listen here because resumeTransaction doesn't accept callbacks
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== 'https://checkout.paystack.com') return;

          const { type } = event.data || {};

          if (type === 'PAYSTACK_CLOSE' || type === 'CANCEL') {
            window.removeEventListener('message', handleMessage);
            setStatus('cancelled');
            onCancel?.();
          }

          if (type === 'SUCCESS' || type === 'PAYSTACK_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            pollForConfirmation(reference, amountGhs);
          }
        };

        window.addEventListener('message', handleMessage);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Payment initialization failed. Please try again.';
        setStatus('error');
        setErrorMessage(msg);
        onError?.(msg);
      }
    },
    [status, ensureScriptLoaded, pollForConfirmation, onCancel, onError],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    referenceRef.current = null;
    amountRef.current = 0;
  }, []);

  return {
    initiateTopUp,
    reset,
    status,
    errorMessage,
    isLoading:
      status === 'initializing' ||
      status === 'loading_script' ||
      status === 'verifying',
    isOpen: status === 'open',
    isSuccess: status === 'success',
    isPending: status === 'pending',
    isCancelled: status === 'cancelled',
    isError: status === 'error',
  };
}
