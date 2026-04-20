/**
 * components/Checkout/TimeSlotPicker.tsx
 *
 * 2-column grid of pickup time-slot buttons.  Each button is colored
 * by the number of spots remaining (emerald / amber / red / disabled).
 * The selected slot gets an orange border ring and a checkmark badge.
 *
 * Props:
 *   slots          — array of available TimeSlots
 *   isLoading      — show skeleton grid
 *   selectedSlotId — currently selected slot id (or null)
 *   onSelect       — callback when a slot is tapped
 */

import type { TimeSlot } from '../../types';
import { Skeleton } from '../ui';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  isLoading: boolean;
  selectedSlotId: string | null;
  onSelect: (id: string) => void;
}

function getSlotStyle(spots: number, selected: boolean) {
  if (spots === 0) {
    return 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50';
  }
  const base = selected
    ? 'border-2 border-brand-500 bg-brand-50 ring-2 ring-brand-500 ring-offset-1'
    : '';
  if (spots >= 5) return `${base || 'border border-emerald-200 bg-emerald-50'}`;
  if (spots >= 2) return `${base || 'border border-amber-200 bg-amber-50'}`;
  return `${base || 'border border-red-200 bg-red-50'}`;
}

function getSpotsColor(spots: number): string {
  if (spots >= 5) return 'text-emerald-600';
  if (spots >= 2) return 'text-amber-600';
  if (spots >= 1) return 'text-red-600';
  return 'text-slate-400';
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
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId;
        const disabled = !slot.available;

        return (
          <button
            key={slot.id}
            disabled={disabled}
            onClick={() => onSelect(slot.id)}
            className={`relative flex flex-col items-center rounded-2xl px-3 py-3 transition-all duration-150 active:scale-[0.98] ${getSlotStyle(
              slot.spotsRemaining,
              isSelected,
            )}`}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                ✓
              </span>
            )}

            <span className="text-sm font-extrabold text-slate-800">
              {slot.startTime}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              to {slot.endTime}
            </span>
            <span
              className={`mt-1 text-[10px] font-bold ${getSpotsColor(slot.spotsRemaining)}`}
            >
              {slot.spotsRemaining === 0
                ? 'Full'
                : `${slot.spotsRemaining} spot${slot.spotsRemaining > 1 ? 's' : ''} left`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
