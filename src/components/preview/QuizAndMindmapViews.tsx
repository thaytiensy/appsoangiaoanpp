import React from 'react';
import { SlideTheme } from '@/types/template';
import { HelpCircle, Lightbulb, Trash2 } from 'lucide-react';

interface LayoutViewProps {
  displayTitle: string;
  displayBullets: string[];
  theme: SlideTheme;
  onTitleChange: (val: string) => void;
  onBulletChange: (idx: number, val: string) => void;
  onDeleteBullet: (idx: number) => void;
}

export function InteractiveQuizView({
  displayTitle,
  displayBullets,
  theme,
  onTitleChange,
  onBulletChange,
  onDeleteBullet,
}: LayoutViewProps) {
  const choiceLetters = ['A', 'B', 'C', 'D', 'E'];
  return (
    <div className="space-y-3 h-full flex flex-col justify-center">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-300 shrink-0">
          <HelpCircle className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-base sm:text-xl font-bold bg-transparent text-white border-b border-white/10 hover:border-white/40 focus:border-indigo-400 focus:outline-hidden"
          placeholder="Nhập câu hỏi tương tác / trắc nghiệm..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {displayBullets.map((bullet, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg backdrop-blur-xs flex items-start gap-2.5 group ${theme.unifiedCardClass}`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {choiceLetters[idx] || (idx + 1)}
            </span>
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

export function SummaryMindmapView({
  displayTitle,
  displayBullets,
  theme,
  onTitleChange,
  onBulletChange,
  onDeleteBullet,
}: LayoutViewProps) {
  return (
    <div className="space-y-3 h-full flex flex-col justify-center">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-base sm:text-xl font-bold bg-transparent text-white border-b border-white/10 hover:border-white/40 focus:border-indigo-400 focus:outline-hidden"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {displayBullets.map((bullet, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg backdrop-blur-xs flex items-start gap-2 group ${theme.unifiedCardClass}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
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
