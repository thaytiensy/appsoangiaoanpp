'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import type { LessonPlanOutput } from '../../contracts/app.schema';
import { parseDocxFile } from '../../services/word-parser';
import { buildPlanFromWord } from '../../services/word-to-plan';
import { auditAndDeduplicateLesson, type AuditReport } from '../../services/quality-audit';

interface WordUploadCardProps {
  readonly onApplyPlan: (plan: LessonPlanOutput) => void;
}

export function WordUploadCard({ onApplyPlan }: WordUploadCardProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanOutput | null>(null);

  const handleFile = async (file: File): Promise<void> => {
    if (!file.name.endsWith('.docx')) {
      setError('Vui lòng chọn file Microsoft Word định dạng .docx');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseDocxFile(buffer);
      const rawPlan = buildPlanFromWord(parsed);
      const report = auditAndDeduplicateLesson(rawPlan);

      const finalPlan: LessonPlanOutput = {
        ...rawPlan,
        slides: report.auditedSlides,
      };

      setAuditReport(report);
      setGeneratedPlan(finalPlan);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể đọc nội dung file Word.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">Tải File Giáo Án Word Mẫu (.docx) Tạo Slide</h2>
        </div>
        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Tự động lọc trùng lặp & tạo 8 Slide chi tiết
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".docx"
        className="hidden"
      />

      {!fileName ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-6 text-center bg-blue-50/30 hover:bg-blue-50/60 transition cursor-pointer"
        >
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800">Kéo thả hoặc bấm vào đây để chọn file Word (.docx) mẫu từ máy tính</p>
          <p className="text-[11px] text-slate-500 mt-1">Hệ thống tự động đọc Mục tiêu, Tiến trình 4 hoạt động và thiết kế Slide 16:9 kèm lời chào & cảm ơn</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">{fileName}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Bóc tách & lọc trùng lặp thành công</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFileName('');
                setGeneratedPlan(null);
                setAuditReport(null);
              }}
              className="text-xs text-slate-500 hover:text-red-600 cursor-pointer"
            >
              Đổi file khác
            </button>
          </div>

          {auditReport && generatedPlan && (
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đạt chuẩn {auditReport.score}/100 • 0 slide trùng • Bài: {generatedPlan.metadata.topic}</span>
              </div>
              <button
                type="button"
                onClick={() => onApplyPlan(generatedPlan)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <span>Xem & Trình Chiếu Slide Ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang phân tích cấu trúc giáo án Word và thiết kế Slide PowerPoint...</span>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
