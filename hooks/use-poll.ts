'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PollOptions<T> {
  queryFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  baseDelay?: number;
  minDelay?: number;
  maxDelay?: number;
  retryCount?: number;
  adaptivePolling?: boolean;
  compareData?: (prev: T | null, next: T) => boolean;
}

export function usePoll<T>({
  queryFn,
  onSuccess,
  onError,
  enabled = true,
  baseDelay = 1000,
  minDelay = 500,
  maxDelay = 2000,
  retryCount = 3,
  adaptivePolling = true,
  compareData
}: PollOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);
  const currentDelayRef = useRef(baseDelay);
  const retryAttemptsRef = useRef(0);
  const lastSuccessRef = useRef<number>(Date.now());
  const previousDataRef = useRef<T | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!enabled || !mounted.current) return;
    cleanup();

    try {
      const result = await queryFn();
      
      if (!mounted.current) return;

      const now = Date.now();
      const timeSinceLastSuccess = now - lastSuccessRef.current;
      lastSuccessRef.current = now;

      // Check if data has changed using compareData function
      const hasChanged = !compareData || compareData(previousDataRef.current, result);
      previousDataRef.current = result;

      if (hasChanged) {
        if (adaptivePolling) {
          // Adjust polling interval based on data change frequency
          if (timeSinceLastSuccess < minDelay) {
            currentDelayRef.current = Math.max(minDelay, currentDelayRef.current * 0.8);
          } else {
            currentDelayRef.current = Math.min(maxDelay, currentDelayRef.current * 1.2);
          }
        }

        setData(result);
        setError(null);
        setIsLoading(false);
        retryAttemptsRef.current = 0;
        onSuccess?.(result);
      }

      timeoutRef.current = setTimeout(poll, currentDelayRef.current);
    } catch (err) {
      if (!mounted.current) return;

      const error = err instanceof Error ? err : new Error('Polling failed');
      setError(error);
      onError?.(error);

      if (retryAttemptsRef.current < retryCount) {
        retryAttemptsRef.current++;
        const backoffDelay = Math.min(
          baseDelay * Math.pow(2, retryAttemptsRef.current),
          maxDelay
        );
        timeoutRef.current = setTimeout(poll, backoffDelay);
      } else {
        setIsLoading(false);
      }
    }
  }, [queryFn, enabled, baseDelay, maxDelay, minDelay, onSuccess, onError, retryCount, adaptivePolling, cleanup, compareData]);

  useEffect(() => {
    mounted.current = true;
    poll();
    
    return () => {
      mounted.current = false;
      cleanup();
    };
  }, [poll, cleanup]);

  return { data, error, isLoading };
}