'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, BookOpen, Layers, Award } from 'lucide-react';

interface StepLoadingOverlayProps {
  isGenerating: boolean;
  topic?: string;
  subject?: string;
}

interface StepItem {
  id: number;
  title: string;
  desc: string;
  icon: typeof BookOpen;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Phân tích chuẩn Bộ GD & Thang đo Bloom',
    desc: 'Đối chiếu mục tiêu Kiến thức, Kỹ năng, Phẩm chất cốt lõi GDPT 2018...',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Thiết kế tiến trình 4 hoạt động sư phạm',
    desc: 'Khởi động (5p) → Khám phá (20p) → Luyện tập (12p) → Vận dụng (8p)...',
    icon: Layers,
  },
  {
    id: 3,
    title: 'Hoàn thiện nội dung chi tiết & Dàn Slide 16:9',
    desc: 'Sinh kịch bản sư phạm, gợi ý hình ảnh và kết xuất tài liệu Word/PPTX...',
    icon: Award,
  },
];

export function StepLoadingOverlay({ isGenerating, topic, subject }: StepLoadingOverlayProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isGenerating) {
      setActiveStep(1);
      setProgress(15);
      return;
    }

    const timer1 = setTimeout(() => {
      setActiveStep(2);
      setProgress(55);
    }, 600);

    const timer2 = setTimeout(() => {
      setActiveStep(3);
      setProgress(90);
    }, 1300);

    const timer3 = setTimeout(() => {
      setProgress(100);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">AI Đang Khởi Tạo Kế Hoạch Bài Dạy</h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {subject ? `${subject} • ` : ''}{topic || 'Bài học chuẩn sư phạm'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            {progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const isDone = activeStep > step.id;
            const isCurrent = activeStep === step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-400'
                    : isDone
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : 'bg-white border-slate-100 opacity-50'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${isCurrent ? 'text-indigo-900' : 'text-slate-800'}`}>
                      Bước {step.id}: {step.title}
                    </p>
                    {isDone && <span className="text-[10px] font-bold text-emerald-600">Đã xong</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-1">
          <p className="text-[11px] text-slate-400 italic">
            Hệ thống đang áp dụng thuật toán tối ưu hóa năng lực sư phạm 2026...
          </p>
        </div>
      </div>
    </div>
  );
}
