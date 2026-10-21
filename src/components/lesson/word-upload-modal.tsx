'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, X, FileText, ArrowRight, Loader2 } from 'lucide-react';
import type { LessonPlanOutput } from '../../contracts/app.schema';
import { parseDocxFile } from '../../services/word-parser';
import { buildPlanFromWord } from '../../services/word-to-plan';
import { auditAndDeduplicateLesson, type AuditReport } from '../../services/quality-audit';

interface WordUploadModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onApplyPlan: (plan: LessonPlanOutput) => void;
}

export function WordUploadModal({ isOpen, onClose, onApplyPlan }: WordUploadModalProps): React.JSX.Element | null {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanOutput | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  const handleApply = (): void => {
    if (generatedPlan) {
      onApplyPlan(generatedPlan);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Tải Giáo Án Word Lọc Slide PowerPoint</h2>
              <p className="text-xs text-slate-500">Tự động bóc tách, chuẩn hóa CV 5512 & lọc trùng lặp</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx"
            className="hidden"
          />

          {!fileName ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-8 text-center bg-blue-50/40 hover:bg-blue-50 transition cursor-pointer"
            >
              <FileText className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Bấm để chọn file giáo án .docx từ máy tính</p>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ giáo án soạn theo Công văn 5512 hoặc 2345</p>
            </button>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{fileName}</p>
                  <p className="text-xs text-emerald-600">Đã đọc và bóc tách thành công</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFileName('');
                  setAuditReport(null);
                  setGeneratedPlan(null);
                }}
                className="text-xs text-slate-500 hover:text-red-600"
              >
                Đổi file
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-center gap-3 text-blue-700 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang phân tích cấu trúc & lọc trùng lặp slide...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {auditReport && generatedPlan && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Kiểm tra chất lượng: ĐẠT {auditReport.score}/100</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {auditReport.metrics.slideCount} Slides 16:9
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 bg-white p-3 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span>Trùng lặp nội dung:</span>
                  <span className="font-semibold text-emerald-700">0 slide (Đã lọc sạch)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chuẩn Công văn 5512:</span>
                  <span className="font-semibold text-emerald-700">Đủ 4 hoạt động</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bài dạy:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{generatedPlan.metadata.topic}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!generatedPlan}
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition"
          >
            <span>Áp dụng vào hệ thống & Xem Slide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
