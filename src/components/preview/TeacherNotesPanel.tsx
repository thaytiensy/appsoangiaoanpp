'use client';

import React from 'react';
import { Mic, Eye, Sliders, ListPlus, Trash2 } from 'lucide-react';
import { SlideItem, SlideLayout } from '@/types/lesson-plan';
import { sanitizePptxText, sanitizePptxList } from '@/utils/sanitizePptxText';

interface TeacherNotesPanelProps {
  slide: SlideItem;
  onChange: (updated: Partial<SlideItem>) => void;
}

const LAYOUT_OPTIONS: { value: SlideLayout; label: string }[] = [
  { value: 'TITLE_HERO', label: 'Title Hero (Trang bìa mở đầu)' },
  { value: 'CONCEPT_BREAKDOWN', label: 'Concept Breakdown (Phân tích khái niệm)' },
  { value: 'INTERACTIVE_QUIZ', label: 'Interactive Quiz (Đố vui tương tác)' },
  { value: 'TIMELINE_PROCESS', label: 'Timeline Process (Tiến trình từng bước)' },
  { value: 'COMPARISON_TABLE', label: 'Comparison Table (Bảng đối chiếu so sánh)' },
  { value: 'SUMMARY_MINDMAP', label: 'Summary Mindmap (Sơ đồ tổng kết)' },
];

export function TeacherNotesPanel({ slide, onChange }: TeacherNotesPanelProps) {
  const cleanBullets = sanitizePptxList(slide.bullets);
  const displayBullets = cleanBullets.length > 0 ? cleanBullets : ['Nội dung điểm nhấn (bấm để sửa)'];

  const handleBulletChange = (idx: number, val: string) => {
    const newBullets = [...displayBullets];
    newBullets[idx] = val;
    onChange({ bullets: newBullets });
  };

  const handleAddBullet = () => {
    if (displayBullets.length >= 5) return;
    onChange({ bullets: [...displayBullets, 'Nội dung điểm nhấn mới'] });
  };

  const handleDeleteBullet = (idx: number) => {
    if (displayBullets.length <= 1) return;
    onChange({ bullets: displayBullets.filter((_, i) => i !== idx) });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Cấu Hình Slide & Lời Giảng Sư Phạm</h4>
            <p className="text-[11px] text-slate-500">Tự động đồng bộ vào Speaker Notes khi xuất PowerPoint</p>
          </div>
        </div>
        <select
          value={slide.layout}
          onChange={(e) => onChange({ layout: e.target.value as SlideLayout })}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
        >
          {LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bullets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">Các Ý Trọng Tâm Trình Chiếu</label>
          {slide.bullets.length < 5 && (
            <button
              type="button"
              onClick={handleAddBullet}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <ListPlus className="w-3.5 h-3.5" />
              Thêm ý
            </button>
          )}
        </div>
        {displayBullets.map((b, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={b}
              onChange={(e) => handleBulletChange(idx, e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
            {displayBullets.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteBullet(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Speaker Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-indigo-600" />
          Lời Giảng Gợi Ý (Speaker Notes cho Giáo Viên)
        </label>
        <textarea
          rows={2}
          value={slide.teacherScript}
          onChange={(e) => onChange({ teacherScript: e.target.value })}
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
          placeholder="Thầy cô sẽ nói gì khi trình chiếu slide này..."
        />
      </div>

      {/* Visual Suggestion */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-amber-600" />
          Gợi Ý Thiết Kế Trực Quan / Hình Ảnh
        </label>
        <input
          type="text"
          value={slide.visualSuggestion}
          onChange={(e) => onChange({ visualSuggestion: e.target.value })}
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500"
          placeholder="Gợi ý hình ảnh, đồ họa hoặc bố cục..."
        />
      </div>
    </div>
  );
}
