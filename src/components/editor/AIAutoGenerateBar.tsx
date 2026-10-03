'use client';

import React from 'react';
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';

interface AIAutoGenerateBarProps {
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function AIAutoGenerateBar({ onGenerate, isGenerating = false }: AIAutoGenerateBarProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-300">
          <Wand2 className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            AI Lesson-to-Slide Generator
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-sm bg-indigo-500 text-white">
              2026 Engine
            </span>
          </h4>
          <p className="text-xs text-indigo-200">
            Tự động phân rã 4 hoạt động sư phạm thành dàn Slide tương tác 16:9
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300 hover:to-amber-400 transition shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Đang tổng hợp Slide...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-900" />
            Đồng Bộ Sang Slide 16:9
          </>
        )}
      </button>
    </div>
  );
}
