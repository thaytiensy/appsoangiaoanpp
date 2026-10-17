'use client';

import { useState } from 'react';
import { FileText, Presentation, ArrowLeft } from 'lucide-react';
import type { LessonPlanOutput } from '../contracts/app.schema';
import { EditableKhbd } from './lesson/editable-khbd';
import { EditableSlides } from './lesson/editable-slides';

interface LessonResultProps {
  readonly plan: LessonPlanOutput;
  readonly onReset: () => void;
  readonly onUpdatePlan: (updated: LessonPlanOutput) => void;
}

export function LessonResult({ plan, onReset, onUpdatePlan }: LessonResultProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'khbd' | 'slides'>('khbd');

  return (
    <div className="space-y-6">
      {/* Thanh công cụ điều hướng & chuyển Tab */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Soạn bài khác</span>
          </button>
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('khbd')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'khbd' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Kế hoạch bài dạy (4 Hoạt động)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('slides')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'slides' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Dàn ý Slide PowerPoint (16:9)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung Tab hiển thị và chỉnh sửa trực tiếp */}
      {activeTab === 'khbd' ? (
        <EditableKhbd plan={plan} onUpdatePlan={onUpdatePlan} />
      ) : (
        <EditableSlides slides={plan.slides} />
      )}
    </div>
  );
}
