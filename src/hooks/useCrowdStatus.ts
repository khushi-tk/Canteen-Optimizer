/**
 * hooks/useCrowdStatus.ts
 *
 * Fetches the live canteen crowd status on mount and silently polls
 * every 30 seconds.  The first load shows a loading spinner; subsequent
 * polls update data in the background without resetting `isLoading`.
 *
 * Returns: { data, isLoading, error, refresh }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CrowdStatus } from '../types';
import { fetchCrowdStatus } from '../services/api';

interface UseCrowdStatusReturn {
  data: CrowdStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCrowdStatus(): UseCrowdStatusReturn {
  const [data, setData] = useState<CrowdStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setIsLoading(true);
    try {
      const res = await fetchCrowdStatus();
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crowd status');
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await load(true);
      if (cancelled) return;
      isFirstLoad.current = false;

      intervalRef.current = setInterval(() => {
        void load(false);
      }, 30_000);
    };

    void init();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  return { data, isLoading, error, refresh };
}
