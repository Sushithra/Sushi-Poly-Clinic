import React, { useState } from 'react';

export default function BookingStepper({ steps = [], initial = 0, onFinish }) {
  const [index, setIndex] = useState(initial);

  function next() {
    if (index < steps.length - 1) setIndex(index + 1);
    else onFinish && onFinish();
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-3 mb-4">
        {steps.map((s, i) => (
          <div key={s.title} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= index ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'}`}>{i+1}</div>
            <div className="hidden md:block">
              <div className={`text-sm ${i <= index ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}>{s.title}</div>
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px bg-neutral-200 mx-2 hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="min-h-[160px]">
        {steps[index] && steps[index].component}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={prev} disabled={index === 0} className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 disabled:opacity-50">Back</button>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-500">Step {index+1} / {steps.length}</div>
          <button onClick={next} className="px-4 py-2 rounded-lg bg-primary-500 text-white">{index === steps.length-1 ? 'Confirm' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
}
