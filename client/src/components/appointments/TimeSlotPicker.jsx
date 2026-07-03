import React from 'react';

export default function TimeSlotPicker({ slots = [], selected, onSelect }) {
  const now = new Date();

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h4 className="text-sm font-semibold text-neutral-800">Available Time Slots</h4>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {slots.length === 0 && <div className="text-sm text-neutral-500 col-span-3">No slots available</div>}
        {slots.map((s) => {
          const disabled = s.startsWith('Past') || false;
          const isSelected = selected === s;
          return (
            <button
              key={s}
              onClick={() => !disabled && onSelect(s)}
              className={`px-3 py-2 rounded-lg text-sm border ${isSelected ? 'bg-primary-500 text-white border-primary-500' : 'bg-neutral-100 text-neutral-800 border-transparent'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
