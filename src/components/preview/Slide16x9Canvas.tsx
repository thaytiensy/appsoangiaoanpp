'use client';

import React from 'react';
import { SlideItem } from '@/types/lesson-plan';
import { CheckSquare, Sparkles, HelpCircle, Edit3, Plus, Trash2 } from 'lucide-react';
import { getThemeById } from '@/lib/slide-themes';
import { sanitizePptxText, sanitizePptxList } from '@/utils/sanitizePptxText';

interface Slide16x9CanvasProps {
  slide: SlideItem;
  totalSlides: number;
  themeId?: string;
  customBackgroundUrl?: string;
  onUpdateSlide?: (updated: Partial<SlideItem>) => void;
}

export function Slide16x9Canvas({
  slide,
  totalSlides,
  themeId,
  customBackgroundUrl,
  onUpdateSlide,
}: Slide16x9CanvasProps) {
  const isHero = slide.layout === 'TITLE_HERO';
  const theme = getThemeById(themeId);

  const displayTitle = sanitizePptxText(slide.title) || 'Tiêu Đề Bài Giảng';
  const rawCleanBullets = sanitizePptxList(slide.bullets);
  const displayBullets = rawCleanBullets.length > 0
    ? rawCleanBullets
    : ['Nội dung trọng tâm (bấm để sửa)'];

  const handleTitleChange = (val: string) => {
    if (onUpdateSlide) onUpdateSlide({ title: val });
  };

  const handleBulletChange = (idx: number, val: string) => {
    if (!onUpdateSlide) return;
    const newBullets = [...displayBullets];
    newBullets[idx] = val;
    onUpdateSlide({ bullets: newBullets });
  };

  const handleAddBullet = () => {
    if (!onUpdateSlide || displayBullets.length >= 5) return;
    onUpdateSlide({ bullets: [...displayBullets, 'Nội dung trọng tâm mới (bấm để sửa)'] });
  };

  const handleDeleteBullet = (idx: number) => {
    if (!onUpdateSlide || displayBullets.length <= 1) return;
    onUpdateSlide({ bullets: displayBullets.filter((_, i) => i !== idx) });
  };

  const bgStyle = customBackgroundUrl
    ? { backgroundImage: `url(${customBackgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <div
      style={bgStyle}
      className={`w-full relative shadow-xl rounded-xl overflow-hidden border border-slate-300 ${
        customBackgroundUrl ? 'bg-slate-900 text-white' : theme.unifiedBgClass
      } aspect-video flex flex-col justify-between select-none transition-colors duration-300`}
    >
      {/* 16:9 Header */}
      <div className={`p-3.5 flex items-center justify-between border-b border-white/10 ${theme.badgeBg}/60 backdrop-blur-xs`}>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
            Slide {slide.slideNumber} / {totalSlides}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {slide.layout.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <Edit3 className="w-3 h-3" /> Sửa trực tiếp
          </span>
          <span className="text-slate-500">•</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{theme.name}</span>
        </div>
      </div>

      {/* Slide Body Content */}
      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center overflow-y-auto">
        {isHero ? (
          <div className="space-y-3 max-w-2xl">
            <input
              type="text"
              value={displayTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-transparent text-white border-b border-white/20 hover:border-white/50 focus:border-indigo-400 focus:outline-hidden transition"
              title="Bấm để sửa tiêu đề trực tiếp"
            />
            <div className="w-16 h-1 bg-amber-400 rounded-full" />
            <div className="space-y-1.5 pt-1">
              {displayBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleBulletChange(idx, e.target.value)}
                    className="flex-1 text-xs sm:text-sm bg-transparent text-slate-200 border-b border-transparent hover:border-white/20 focus:border-indigo-400 focus:outline-hidden"
                  />
                  {displayBullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBullet(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 h-full flex flex-col justify-center">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              <input
                type="text"
                value={displayTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-base sm:text-xl font-bold bg-transparent text-white border-b border-white/10 hover:border-white/40 focus:border-indigo-400 focus:outline-hidden"
                title="Bấm để sửa tiêu đề trực tiếp"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {displayBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg backdrop-blur-xs flex items-start gap-2 group ${theme.unifiedCardClass}`}
                >
                  <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-300 mt-0.5 shrink-0">
                    {slide.layout === 'INTERACTIVE_QUIZ' ? (
                      <HelpCircle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckSquare className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleBulletChange(idx, e.target.value)}
                    className="flex-1 text-xs font-medium bg-transparent border-b border-transparent hover:border-white/30 focus:border-indigo-400 focus:outline-hidden"
                  />
                  {displayBullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBullet(idx)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-300 transition"
                      title="Xóa ý"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {displayBullets.length < 5 && (
              <button
                type="button"
                onClick={handleAddBullet}
                className="self-start text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-semibold pt-1"
              >
                <Plus className="w-3 h-3" /> Thêm điểm nhấn
              </button>
            )}
          </div>
        )}
      </div>

      {/* Slide Footer */}
      <div className={`px-4 py-1.5 text-[10px] flex items-center justify-between border-t border-white/10 ${theme.badgeBg}/80 text-slate-400`}>
        <span>Giáo Án Tích Hợp Số Chuẩn 2026</span>
        <span>Tỉ Lệ Màn Chiếu 16:9 HD</span>
      </div>
    </div>
  );
}
