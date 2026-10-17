import React from 'react';
import { SlideTheme } from '@/types/template';
import { ArrowRight, Split, Trash2 } from 'lucide-react';

interface LayoutViewProps {
  displayTitle: string;
  displayBullets: string[];
  theme: SlideTheme;
  onTitleChange: (val: string) => void;
  onBulletChange: (idx: number, val: string) => void;
  onDeleteBullet: (idx: number) => void;
}

export function TimelineProcessView({
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
        <div className="w-1.5 h-6 bg-sky-500 rounded-full shrink-0" />
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-base sm:text-xl font-bold bg-transparent text-white border-b border-white/10 hover:border-white/40 focus:border-indigo-400 focus:outline-hidden"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pt-2">
        {displayBullets.map((bullet, idx) => (
          <React.Fragment key={idx}>
            <div className={`flex-1 min-w-[130px] p-3 rounded-lg backdrop-blur-xs group ${theme.unifiedCardClass} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                  Bước {idx + 1}
                </span>
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
              <textarea
                rows={2}
                value={bullet}
                onChange={(e) => onBulletChange(idx, e.target.value)}
                className="w-full text-xs font-medium bg-transparent border-b border-transparent hover:border-white/30 focus:border-indigo-400 focus:outline-hidden resize-none"
              />
            </div>
            {idx < displayBullets.length - 1 && (
              <ArrowRight className="w-4 h-4 text-sky-400 shrink-0 hidden sm:block" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function ComparisonTableView({
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
        <div className="p-1 rounded-md bg-purple-500/20 text-purple-300 shrink-0">
          <Split className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-base sm:text-xl font-bold bg-transparent text-white border-b border-white/10 hover:border-white/40 focus:border-indigo-400 focus:outline-hidden"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {displayBullets.map((bullet, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg backdrop-blur-xs flex items-start gap-2 group border-l-2 ${
              idx % 2 === 0 ? 'border-sky-500' : 'border-indigo-500'
            } ${theme.unifiedCardClass}`}
          >
            <span className="text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
              {idx % 2 === 0 ? 'Vế A' : 'Vế B'}
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
