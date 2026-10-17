'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Copy, Check, RotateCcw, Edit, Sparkles } from 'lucide-react';
import { LessonPlanProject } from '@/types/lesson-plan';
import { formatLessonPlanToPlainText } from '@/utils/lessonPlanTextFormatter';
import { downloadLessonPlanDocx } from '@/utils/docxExport';

interface LessonPlanDocxCardProps {
  plan: LessonPlanProject;
}

export function LessonPlanDocxCard({ plan }: LessonPlanDocxCardProps) {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContent(formatLessonPlanToPlainText(plan));
  }, [plan.id, plan.lessonName]);

  const handleDownloadDocx = () => {
    downloadLessonPlanDocx(plan, content);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback nếu clipboard API bị hạn chế
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setContent(formatLessonPlanToPlainText(plan));
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* 2 Nút hành động lớn nổi bật */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDownloadDocx}
          className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <FileDown className="w-5 h-5" />
          <span>Tải Xuống File Word (.docx)</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={`w-full py-3.5 px-5 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-slate-300" />}
          <span>{copied ? 'Đã Sao Chép Toàn Bộ Giáo Án!' : 'Sao Chép Toàn Bộ Nội Dung'}</span>
        </button>
      </div>

      {/* Trình soạn thảo văn bản trực tiếp (Editable Area) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 text-blue-700 rounded-md">
              <Edit className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Trình Soạn Thảo Văn Bản Trực Tiếp (Editable Area)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500">
              {wordCount} từ • {charCount} ký tự
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="Khôi phục lại định dạng ban đầu"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 rounded bg-white border border-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục</span>
            </button>
          </div>
        </div>

        <div className="p-3">
          <textarea
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs sm:text-[13px] font-mono leading-relaxed text-slate-800 bg-white border border-slate-200 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-y"
            placeholder="Nội dung giáo án văn bản chuẩn 5512..."
          />
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 flex-wrap gap-1">
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mẹo: Mọi chỉnh sửa ở khung này sẽ được xuất chính xác sang file Word hoặc bộ nhớ tạm.
            </span>
            <span className="text-slate-400">Chuẩn Công văn 5512 / BGDĐT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
