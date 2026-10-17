'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS: readonly string[] = [
  'Đang kết nối Gemini 3.0 Flash & phân tích mục tiêu bài học (Công văn 5512)...',
  'Đang thiết kế 4 hoạt động sư phạm: Khởi động, Khám phá, Luyện tập, Vận dụng...',
  'Đang xây dựng cấu trúc Slide 16:9, gợi ý hình ảnh minh họa & lời giảng...',
  'Đang hoàn tất Kế hoạch bài dạy chuẩn Bộ Giáo dục & Đào tạo...',
];

export function GenerationProgress(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [percent, setPercent] = useState<number>(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
      setPercent((prev) => (prev < 90 ? prev + 25 : prev));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg text-center max-w-xl mx-auto my-8">
      <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-4 animate-bounce">
        <Sparkles className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">
        AI Đang Soạn Giáo Án & Thiết Kế Slide PowerPoint...
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Áp dụng mô hình chuẩn GDPT 2018 theo Công văn 5512 & Bộ sách Kết nối tri thức với cuộc sống
      </p>

      {/* Thanh tiến trình */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Trạng thái chi tiết */}
      <div className="space-y-2 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 text-xs transition-colors ${
                isDone
                  ? 'text-emerald-700 font-medium'
                  : isCurrent
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
