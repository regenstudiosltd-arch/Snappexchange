'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Feedback,
  FEEDBACK_CLEAR_DELAY_MS,
} from '../components/settings/Shared';

/**
 * Manages a single feedback message that auto-clears after a delay.
 */
export function useFeedback() {
  const [feedback, setFeedbackState] = useState<Feedback | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFeedback = useCallback((next: Feedback | null) => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setFeedbackState(next);
    if (next) {
      clearTimerRef.current = setTimeout(
        () => setFeedbackState(null),
        FEEDBACK_CLEAR_DELAY_MS,
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  return { feedback, setFeedback };
}

/**
 * Runs a countdown from `total` seconds to 0 when `active` is true,
 * calling `onComplete` when it reaches 0.
 *
 * onComplete is called in a separate useEffect (never inside a setState
 * updater) so it never triggers a parent state update during render.
 */
export function useCountdown(
  active: boolean,
  total: number,
  onComplete: () => void,
) {
  const [count, setCount] = useState(total);
  const onCompleteRef = useRef(onComplete);

  // Keep the ref current without adding it as a dependency elsewhere
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Tick the counter down while active
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setCount((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      setCount(total); // reset for next open
    };
  }, [active, total]);

  // Fire onComplete in its own effect — never inside a setState updater
  useEffect(() => {
    if (active && count === 0) {
      onCompleteRef.current();
    }
  }, [active, count]);

  return count;
}
