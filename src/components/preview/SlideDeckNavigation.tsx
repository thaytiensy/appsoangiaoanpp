'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { SlideItem } from '@/types/lesson-plan';

interface SlideDeckNavigationProps {
  slides: SlideItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
}

export function SlideDeckNavigation({
  slides,
  currentIndex,
  onSelect,
  onAddSlide,
  onDeleteSlide,
}: SlideDeckNavigationProps) {
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < slides.length - 1;

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => onSelect(currentIndex - 1)}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Slide trước"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <span className="text-xs font-semibold text-slate-600 px-1">
            {currentIndex + 1} / {slides.length}
          </span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onSelect(currentIndex + 1)}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Slide kế tiếp"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {slides.length > 4 && (
            <button
              type="button"
              onClick={() => onDeleteSlide(currentIndex)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
              title="Xóa slide hiện tại"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Slide</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAddSlide}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Slide</span>
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((item, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flex-shrink-0 w-28 p-2 rounded-lg border text-left transition ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500">#{item.slideNumber}</span>
                <span className="text-[9px] font-semibold text-indigo-600 uppercase">
                  {item.layout.slice(0, 5)}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-tight">
                {item.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
