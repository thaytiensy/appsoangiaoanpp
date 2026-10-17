'use client';

import React from 'react';
import { Zap, BookOpen, Atom, Calculator, Globe, Compass, Sparkles } from 'lucide-react';

export interface QuickLessonTemplate {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  badge: string;
  themeId: string;
}

export const POPULAR_TEMPLATES: QuickLessonTemplate[] = [
  {
    id: 'math-10',
    title: 'Phương trình bậc hai & Ứng dụng thực tế',
    subject: 'Toán học',
    grade: 'Lớp 10',
    duration: 45,
    badge: 'Toán 10',
    themeId: 'TECH_DARK',
  },
  {
    id: 'literature-11',
    title: 'Nghệ thuật xây dựng nhân vật và diễn biến tâm lý',
    subject: 'Ngữ văn',
    grade: 'Lớp 11',
    duration: 45,
    badge: 'Ngữ văn 11',
    themeId: 'CLASSIC_CREAM',
  },
  {
    id: 'physics-10',
    title: 'Định luật bảo toàn và chuyển hóa năng lượng',
    subject: 'Vật lí',
    grade: 'Lớp 10',
    duration: 45,
    badge: 'Vật lí 10',
    themeId: 'MODERN_BLUE',
  },
  {
    id: 'chemistry-11',
    title: 'Cân bằng hóa học & Các yếu tố chuyển dịch',
    subject: 'Hóa học',
    grade: 'Lớp 11',
    duration: 45,
    badge: 'Hóa học 11',
    themeId: 'EMERALD_NATURE',
  },
  {
    id: 'history-8',
    title: 'Các cuộc phát kiến địa lí thế kỷ XV - XVI',
    subject: 'Lịch sử và Địa lí',
    grade: 'Lớp 8',
    duration: 45,
    badge: 'Lịch sử 8',
    themeId: 'SUNSET_WARM',
  },
  {
    id: 'english-12',
    title: 'Artificial Intelligence & Future Career Skills',
    subject: 'Tiếng Anh',
    grade: 'Lớp 12',
    duration: 45,
    badge: 'Tiếng Anh 12',
    themeId: 'PURPLE_ELEGANCE',
  },
];

interface QuickTemplatesBarProps {
  onSelect: (template: QuickLessonTemplate) => void;
  selectedId?: string;
}

export function QuickTemplatesBar({ onSelect, selectedId }: QuickTemplatesBarProps) {
  const getSubjectIcon = (sub: string) => {
    if (sub.includes('Toán')) return <Calculator className="w-3.5 h-3.5 text-blue-600" />;
    if (sub.includes('Văn')) return <BookOpen className="w-3.5 h-3.5 text-amber-600" />;
    if (sub.includes('Vật lí') || sub.includes('Hóa')) return <Atom className="w-3.5 h-3.5 text-cyan-600" />;
    if (sub.includes('Địa') || sub.includes('Lịch')) return <Compass className="w-3.5 h-3.5 text-orange-600" />;
    return <Globe className="w-3.5 h-3.5 text-purple-600" />;
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-purple-50/90 rounded-xl p-3.5 border border-indigo-100 shadow-xs space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
          <div className="p-1 bg-amber-400 text-slate-900 rounded-md shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>Gợi Ý Nhanh (Quick Templates) • 1 Chạm Điền Xong Form</span>
        </div>
        <span className="text-[10px] font-semibold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Chuẩn GDPT 2018
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {POPULAR_TEMPLATES.map((tmpl) => {
          const isSelected = selectedId === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelect(tmpl)}
              className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-indigo-50/80 border-slate-200 hover:border-indigo-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tmpl.badge}
                </span>
                <span className={isSelected ? 'text-white' : ''}>
                  {getSubjectIcon(tmpl.subject)}
                </span>
              </div>
              <p className={`text-[11px] font-semibold line-clamp-2 leading-tight ${
                isSelected ? 'text-indigo-50' : 'text-slate-700'
              }`}>
                {tmpl.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
