'use client';

import React from 'react';
import { SlideItem } from '@/types/lesson-plan';
import { Layout, CheckSquare, Sparkles, HelpCircle } from 'lucide-react';

interface Slide16x9CanvasProps {
  slide: SlideItem;
  totalSlides: number;
}

export function Slide16x9Canvas({ slide, totalSlides }: Slide16x9CanvasProps) {
  const isHero = slide.layout === 'TITLE_HERO';

  return (
    <div className="w-full relative shadow-xl rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex flex-col justify-between select-none">
      {/* 16:9 Slide Top Header */}
      <div className={`p-4 flex items-center justify-between ${isHero ? 'bg-slate-900' : 'bg-white border-b border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            isHero ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            Slide {slide.slideNumber} / {totalSlides}
          </span>
          <span className={`text-xs font-semibold uppercase tracking-wider ${isHero ? 'text-slate-400' : 'text-slate-500'}`}>
            {slide.layout.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>GDPT 2026 16:9</span>
        </div>
      </div>

      {/* Slide Body Content */}
      <div className={`flex-1 p-6 sm:p-8 flex flex-col justify-center ${
        isHero ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        {isHero ? (
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {slide.title}
            </h1>
            <div className="w-16 h-1 bg-amber-400 rounded-full" />
            <div className="space-y-2 pt-2">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm sm:text-base text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-indigo-600 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {slide.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {slide.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-start gap-2.5"
                >
                  <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 mt-0.5">
                    {slide.layout === 'INTERACTIVE_QUIZ' ? (
                      <HelpCircle className="w-4 h-4" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide Footer */}
      <div className={`px-4 py-2 text-[11px] flex items-center justify-between ${
        isHero ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500 border-t border-slate-200'
      }`}>
        <span>Giáo Án Tích Hợp Số Chuẩn 2026</span>
        <span>Tỉ Lệ Màn Chiếu 16:9 HD</span>
      </div>
    </div>
  );
}
