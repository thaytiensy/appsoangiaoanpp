'use client';

import React from 'react';
import { SlideItem } from '@/types/lesson-plan';
import { Sparkles, Edit3, Plus } from 'lucide-react';
import { getThemeById } from '@/lib/slide-themes';
import { sanitizePptxText, sanitizePptxList } from '@/utils/sanitizePptxText';
import { SlideLayoutRenderer } from './SlideLayoutRenderer';

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
  const theme = getThemeById(themeId);
  const layout = slide.layout;

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
            {layout.replace('_', ' ')}
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
        <SlideLayoutRenderer
          layout={layout}
          displayTitle={displayTitle}
          displayBullets={displayBullets}
          theme={theme}
          onTitleChange={handleTitleChange}
          onBulletChange={handleBulletChange}
          onDeleteBullet={handleDeleteBullet}
        />

        {/* Nút Thêm điểm nhấn (Áp dụng cho mọi layout trừ Title Hero nếu chưa đủ 5 ý) */}
        {layout !== 'TITLE_HERO' && displayBullets.length < 5 && (
          <button
            type="button"
            onClick={handleAddBullet}
            className="self-start text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-semibold pt-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Thêm điểm nhấn
          </button>
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
