/**
 * hooks/useCrowdData.ts
 */

import { useState, useCallback, useEffect } from 'react';
import type { CrowdData, CrowdLevel } from '../types';

const STORAGE_KEY = 'canteen_crowd_data';

const DEFAULT_CROWD: CrowdData = {
  currentLevel: 'low',
  estimatedWaitMinutes: 5,
  preparingOrderCount: 3,
  staffOnDuty: 4,
  capacityPercentage: 25,
  lastUpdatedAt: new Date().toISOString(),
  manualOverride: false,
};

function loadFromStorage(): CrowdData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_CROWD, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_CROWD;
    }
  }
  return DEFAULT_CROWD;
}

function saveToStorage(data: CrowdData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useCrowdData() {
  const [data, setData] = useState<CrowdData>(loadFromStorage);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setData({ ...DEFAULT_CROWD, ...JSON.parse(e.newValue) });
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r: (value: unknown) => void) => setTimeout(r, 500));
    setData(loadFromStorage());
    setIsLoading(false);
  }, []);

  const updateCrowdLevel = useCallback((level: CrowdLevel, waitMinutes: number, capacity: number) => {
    setData((prev: CrowdData) => {
      const updated: CrowdData = {
        ...prev,
        currentLevel: level,
        estimatedWaitMinutes: waitMinutes,
        capacityPercentage: capacity,
        lastUpdatedAt: new Date().toISOString(),
        manualOverride: true,
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateStats = useCallback((preparing: number, staff: number) => {
    setData((prev: CrowdData) => {
      const updated: CrowdData = {
        ...prev,
        preparingOrderCount: preparing,
        staffOnDuty: staff,
        lastUpdatedAt: new Date().toISOString(),
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearOverride = useCallback(() => {
    setData((prev: CrowdData) => {
      const updated: CrowdData = {
        ...prev,
        manualOverride: false,
        lastUpdatedAt: new Date().toISOString(),
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  return {
    data,
    isLoading,
    refresh,
    updateCrowdLevel,
    updateStats,
    clearOverride,
  };
}