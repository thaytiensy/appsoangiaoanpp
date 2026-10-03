'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface LessonDurationPickerProps {
  duration: number;
  onChangeDuration: (val: number) => void;
}

const PRESET_DURATIONS = [
  { val: 35, label: '35 phút (Tiểu học)' },
  { val: 45, label: '45 phút (Chuẩn GDPT)' },
  { val: 90, label: '90 phút (Tiết đôi)' },
];

export function LessonDurationPicker({ duration, onChangeDuration }: LessonDurationPickerProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        Thời Gian 1 Tiết Dạy
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESET_DURATIONS.map((t) => (
          <button
            key={t.val}
            type="button"
            onClick={() => onChangeDuration(t.val)}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
              duration === t.val
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={15}
            max={180}
            value={duration}
            onChange={(e) => onChangeDuration(parseInt(e.target.value) || 45)}
            className="w-full text-xs font-semibold px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-center"
          />
          <span className="text-[11px] text-slate-500 font-medium">phút</span>
        </div>
      </div>
    </div>
  );
}
