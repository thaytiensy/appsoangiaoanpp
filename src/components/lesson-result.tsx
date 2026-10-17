'use client';

import { useState } from 'react';
import { FileText, Presentation, Copy, Check, Printer, ArrowLeft } from 'lucide-react';
import type { LessonPlanOutput } from '../contracts/app.schema';
import { LessonPlanDocument } from './lesson-plan-document';
import { SlidePreview } from './slide-preview';

interface LessonResultProps {
  readonly plan: LessonPlanOutput;
  readonly onReset: () => void;
}

export function LessonResult({ plan, onReset }: LessonResultProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'khbd' | 'slides'>('khbd');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    try {
      const textToCopy = `KẾ HOẠCH BÀI DẠY: ${plan.metadata.topic}\nMôn: ${plan.metadata.subject} - Lớp ${plan.metadata.grade} (${plan.metadata.textbook})\n\nI. MỤC TIÊU:\n- Kiến thức: ${plan.objectives.knowledge}\n- Năng lực: ${plan.objectives.coreCompetencies}; ${plan.objectives.specificCompetencies}\n- Phẩm chất: ${plan.objectives.qualities}\n\nII. THIẾT BỊ DẠY HỌC:\n- GV: ${plan.materials.teacherPreparation}\n- HS: ${plan.materials.studentPreparation}\n\nIII. TIẾN TRÌNH DẠY HỌC:\n` +
        plan.activities.map((a) => `${a.stepName} (${a.duration}):\n+ Mục tiêu: ${a.objective}\n+ Nội dung: ${a.content}\n+ Sản phẩm: ${a.product}`).join('\n\n');
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Thanh công cụ điều hướng & thao tác */}
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
              <span>Kế hoạch bài dạy (KHBD)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('slides')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'slides' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Slide PowerPoint (16:9)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>In / Lưu PDF chuẩn A4</span>
          </button>
        </div>
      </div>

      {/* Nội dung Tab */}
      {activeTab === 'khbd' ? (
        <LessonPlanDocument plan={plan} />
      ) : (
        <SlidePreview slides={plan.slides} />
      )}
    </div>
  );
}
