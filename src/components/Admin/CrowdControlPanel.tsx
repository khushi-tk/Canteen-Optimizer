/**
 * components/Admin/CrowdControlPanel.tsx
 */

import { useState } from 'react';
import type { CrowdLevel } from '../../types';
import { useCrowdData } from '../../hooks/useCrowdData';
import { SectionHeader, Spinner } from '../ui';

interface LevelOption {
  value: CrowdLevel;
  label: string;
  color: string;
  bg: string;
  desc: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  { value: 'low', label: 'Low Crowd', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', desc: 'Minimal wait, plenty of seating' },
  { value: 'medium', label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', desc: 'Some queue, seating available' },
  { value: 'high', label: 'Very Busy', color: 'text-red-700', bg: 'bg-red-50 border-red-200', desc: 'Long queues, limited seating' },
];

export function CrowdControlPanel() {
  const { data, updateCrowdLevel, updateStats, clearOverride, refresh } = useCrowdData();
  const [level, setLevel] = useState<CrowdLevel>(data.currentLevel);
  const [waitMinutes, setWaitMinutes] = useState<number>(data.estimatedWaitMinutes);
  const [capacity, setCapacity] = useState<number>(data.capacityPercentage);
  const [preparing, setPreparing] = useState<number>(data.preparingOrderCount);
  const [staff, setStaff] = useState<number>(data.staffOnDuty);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r: (value: unknown) => void) => setTimeout(r, 400));
    updateCrowdLevel(level, waitMinutes, capacity);
    updateStats(preparing, staff);
    setIsSaving(false);
  };

  const hasChanges =
    level !== data.currentLevel ||
    waitMinutes !== data.estimatedWaitMinutes ||
    capacity !== data.capacityPercentage ||
    preparing !== data.preparingOrderCount ||
    staff !== data.staffOnDuty;

  return (
    <div className="max-w-lg">
      <SectionHeader
        title="Crowd Control"
        subtitle="Update live canteen status for students"
        action={
          <button
            onClick={refresh}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            aria-label="Refresh"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        }
      />

      <div className="mb-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500 mb-2">Current Student View</p>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${
            data.currentLevel === 'low' ? 'bg-emerald-500' : data.currentLevel === 'medium' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-semibold text-slate-900">
            {LEVEL_OPTIONS.find((l: LevelOption) => l.value === data.currentLevel)?.label}
          </span>
          <span className="text-xs text-slate-500">
            {data.capacityPercentage}% capacity · {data.estimatedWaitMinutes}m wait
          </span>
        </div>
        {data.manualOverride && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs">
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-medium text-indigo-700">Manual override active</span>
            <button
              onClick={clearOverride}
              className="ml-auto text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Crowd Level</label>
        <div className="grid grid-cols-3 gap-3">
          {LEVEL_OPTIONS.map((opt: LevelOption) => (
            <button
              key={opt.value}
              onClick={() => setLevel(opt.value)}
              className={`rounded-xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                level === opt.value
                  ? `${opt.bg} ring-2 ring-indigo-500 ring-offset-1`
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className={`text-sm font-semibold ${opt.color}`}>{opt.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Est. Wait (min)</label>
          <input
            type="number"
            min={0}
            max={120}
            value={waitMinutes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWaitMinutes(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Capacity %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={capacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Preparing Orders</label>
          <input
            type="number"
            min={0}
            value={preparing}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreparing(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Staff On Duty</label>
          <input
            type="number"
            min={0}
            value={staff}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaff(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
          hasChanges
            ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isSaving ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" variant="neutral" />
            Updating…
          </span>
        ) : (
          'Update Crowd Status'
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        Changes reflect immediately on all student devices
      </p>
    </div>
  );
}