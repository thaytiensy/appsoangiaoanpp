import React from 'react';
import { SlideTheme } from '@/types/template';
import { CheckSquare, Trash2 } from 'lucide-react';
import { TimelineProcessView, ComparisonTableView } from './ProcessAndComparisonViews';
import { InteractiveQuizView, SummaryMindmapView } from './QuizAndMindmapViews';

interface SlideLayoutRendererProps {
  layout: string;
  displayTitle: string;
  displayBullets: string[];
  theme: SlideTheme;
  onTitleChange: (val: string) => void;
  onBulletChange: (idx: number, val: string) => void;
  onDeleteBullet: (idx: number) => void;
}

export function SlideLayoutRenderer({
  layout,
  displayTitle,
  displayBullets,
  theme,
  onTitleChange,
  onBulletChange,
  onDeleteBullet,
}: SlideLayoutRendererProps) {
  if (layout === 'TITLE_HERO') {
    return (
      <div className="space-y-3 max-w-2xl">
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => onTitleChange(e.target.value)}
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
                onChange={(e) => onBulletChange(idx, e.target.value)}
                className="flex-1 text-xs sm:text-sm bg-transparent text-slate-200 border-b border-transparent hover:border-white/20 focus:border-indigo-400 focus:outline-hidden"
              />
              {displayBullets.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteBullet(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  title="Xóa ý"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'INTERACTIVE_QUIZ') {
    return (
      <InteractiveQuizView
        displayTitle={displayTitle}
        displayBullets={displayBullets}
        theme={theme}
        onTitleChange={onTitleChange}
        onBulletChange={onBulletChange}
        onDeleteBullet={onDeleteBullet}
      />
    );
  }

  if (layout === 'TIMELINE_PROCESS') {
    return (
      <TimelineProcessView
        displayTitle={displayTitle}
        displayBullets={displayBullets}
        theme={theme}
        onTitleChange={onTitleChange}
        onBulletChange={onBulletChange}
        onDeleteBullet={onDeleteBullet}
      />
    );
  }

  if (layout === 'COMPARISON_TABLE') {
    return (
      <ComparisonTableView
        displayTitle={displayTitle}
        displayBullets={displayBullets}
        theme={theme}
        onTitleChange={onTitleChange}
        onBulletChange={onBulletChange}
        onDeleteBullet={onDeleteBullet}
      />
    );
  }

  if (layout === 'SUMMARY_MINDMAP') {
    return (
      <SummaryMindmapView
        displayTitle={displayTitle}
        displayBullets={displayBullets}
        theme={theme}
        onTitleChange={onTitleChange}
        onBulletChange={onBulletChange}
        onDeleteBullet={onDeleteBullet}
      />
    );
  }

  // DEFAULT / CONCEPT_BREAKDOWN
  return (
    <div className="space-y-3 h-full flex flex-col justify-center">
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => onTitleChange(e.target.value)}
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
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={bullet}
              onChange={(e) => onBulletChange(idx, e.target.value)}
              className="flex-1 text-xs font-medium bg-transparent border-b border-transparent hover:border-white/30 focus:border-indigo-400 focus:outline-hidden"
            />
            {displayBullets.length > 1 && (
              <button
                type="button"
                onClick={() => onDeleteBullet(idx)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                title="Xóa ý"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
