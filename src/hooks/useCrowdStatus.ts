/**
 * hooks/useCrowdStatus.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type { CrowdStatus, CrowdData } from '../types';

const CROWD_STORAGE_KEY = 'canteen_crowd_data';

function loadCrowdData(): CrowdData | null {
  const stored = localStorage.getItem(CROWD_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CrowdData;
  } catch {
    return null;
  }
}

export function useCrowdStatus() {
  const [data, setData] = useState<CrowdStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r: (value: unknown) => void) => setTimeout(r, 500));

    const crowdData = loadCrowdData();

    if (crowdData) {
      setData({
        level: crowdData.currentLevel,
        estimatedWaitMinutes: crowdData.estimatedWaitMinutes,
        preparingOrderCount: crowdData.preparingOrderCount,
        staffOnDuty: crowdData.staffOnDuty,
        lastUpdatedAt: crowdData.lastUpdatedAt,
        manualOverride: crowdData.manualOverride,
      });
    } else {
      setData({
        level: 'low',
        estimatedWaitMinutes: 5,
        preparingOrderCount: 2,
        staffOnDuty: 3,
        lastUpdatedAt: new Date().toISOString(),
        manualOverride: false,
      });
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CROWD_STORAGE_KEY && e.newValue) {
        refresh();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    isLoading,
    refresh,
  };
}