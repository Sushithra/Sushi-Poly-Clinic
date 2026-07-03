import React, { useState, useMemo } from 'react';

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix = [];
  let week = new Array(7).fill(null);
  let day = 1;

  // Fill first week
  for (let i = startDay; i < 7; i++) {
    week[i] = new Date(year, month, day++);
  }
  matrix.push(week);

  while (day <= daysInMonth) {
    week = new Array(7).fill(null);
    for (let i = 0; i < 7 && day <= daysInMonth; i++) {
      week[i] = new Date(year, month, day++);
    }
    matrix.push(week);
  }

  return matrix;
}

export default function Calendar({ value, onChange }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const matrix = useMemo(() => getMonthMatrix(current.year, current.month), [current]);

  function prevMonth() {
    const m = current.month - 1;
    if (m < 0) setCurrent({ year: current.year - 1, month: 11 });
    else setCurrent({ ...current, month: m });
  }

  function nextMonth() {
    const m = current.month + 1;
    if (m > 11) setCurrent({ year: current.year + 1, month: 0 });
    else setCurrent({ ...current, month: m });
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-neutral-700">{current.year} • {new Date(current.year, current.month).toLocaleString(undefined, { month: 'long' })}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-neutral-100">
            ‹
          </button>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-neutral-100">
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-neutral-500">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {matrix.map((week, wi) => (
          week.map((day, di) => {
            if (!day) return <div key={`${wi}-${di}`} className="h-10" />;
            const isToday = day.toDateString() === new Date().toDateString();
            const selected = value && day.toDateString() === new Date(value).toDateString();
            return (
              <button
                key={`${wi}-${di}`}
                onClick={() => onChange(day)}
                className={`h-10 flex items-center justify-center rounded-lg transition ${selected ? 'bg-primary-500 text-white' : 'hover:bg-neutral-100'} ${isToday && !selected ? 'ring-1 ring-primary-100' : ''}`}
              >
                {day.getDate()}
              </button>
            );
          })
        ))}
      </div>
    </div>
  );
}
