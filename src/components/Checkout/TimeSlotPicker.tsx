/**
 * components/Checkout/TimeSlotPicker.tsx
 *
 * Professional 2-column grid of pickup time-slot buttons for CanteenCrowd.
 * Capacity indicators via color-coded spots remaining. Selected state uses
 * indigo ring system. Fully accessible with focus states.
 */

import type { TimeSlot } from '../../types';
import { Skeleton } from '../ui';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  isLoading: boolean;
  selectedSlotId: string | null;
  onSelect: (id: string) => void;
}

function getSlotBaseStyle(spots: number, selected: boolean, disabled: boolean) {
  if (disabled) {
    return 'border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60';
  }

  const selectedRing = selected
    ? 'ring-2 ring-indigo-500 ring-offset-1 border-indigo-500'
    : '';

  if (selected) return `bg-indigo-50 ${selectedRing}`;

  if (spots >= 5) return 'border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50';
  if (spots >= 2) return 'border border-amber-200 bg-amber-50/60 hover:bg-amber-50';
  return 'border border-red-200 bg-red-50/60 hover:bg-red-50';
}

function getSpotsIndicator(spots: number): { color: string; dot: string } {
  if (spots >= 5) return { color: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (spots >= 2) return { color: 'text-amber-700', dot: 'bg-amber-500' };
  if (spots >= 1) return { color: 'text-red-700', dot: 'bg-red-500' };
  return { color: 'text-slate-400', dot: 'bg-slate-300' };
}

export function TimeSlotPicker({
  slots,
  isLoading,
  selectedSlotId,
  onSelect,
}: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-500">No slots available</p>
        <p className="mt-1 text-xs text-slate-400">Check back soon for new pickup windows</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId;
        const disabled = !slot.available;
        const spots = getSpotsIndicator(slot.spotsRemaining);

        return (
          <button
            key={slot.id}
            disabled={disabled}
            onClick={() => onSelect(slot.id)}
            aria-pressed={isSelected}
            className={`relative flex flex-col items-center rounded-xl px-3 py-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${getSlotBaseStyle(
              slot.spotsRemaining,
              isSelected,
              disabled,
            )}`}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            )}

            <span className={`text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>
              {slot.startTime}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              to {slot.endTime}
            </span>

            {/* Spots remaining with dot */}
            {!disabled && (
              <span className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold ${spots.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${spots.dot}`} />
                {slot.spotsRemaining === 0
                  ? 'Full'
                  : `${slot.spotsRemaining} spot${slot.spotsRemaining > 1 ? 's' : ''}`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}