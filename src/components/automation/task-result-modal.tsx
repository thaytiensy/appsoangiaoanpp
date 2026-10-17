"use client";

import React from "react";
import { X, CheckCircle, AlertTriangle, Clock, ExternalLink, Sparkles, Layers } from "lucide-react";
import { TaskExecutionResult } from "@/types/automation";

interface TaskResultModalProps {
  result: TaskExecutionResult | null;
  onClose: () => void;
}

export const TaskResultModal: React.FC<TaskResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            {result.success ? (
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kết Quả Thực Thi: {result.type}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Tác vụ ID: {result.taskId}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full font-bold ${result.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {result.success ? 'THÀNH CÔNG' : 'THẤT BẠI'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1 text-slate-600 font-mono">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> {result.durationMs}ms
              </span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">{new Date(result.executedAt).toLocaleTimeString()}</span>
          </div>

          {result.error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Lỗi thực thi
              </div>
              <p className="font-mono">{result.error}</p>
            </div>
          )}

          {result.screenshotUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Ảnh chụp màn hình thực tế (Playwright)</span>
                <a
                  href={result.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                <img
                  src={result.screenshotUrl}
                  alt="Playwright Capture"
                  className="w-full max-h-80 object-contain mx-auto"
                />
              </div>
            </div>
          )}

          {result.scrapedData && (
            <div className="space-y-3">
              {result.scrapedData.summary && (
                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="h-4 w-4 text-indigo-600" /> Tóm tắt từ Gemini AI
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {result.scrapedData.summary}
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 p-4 text-xs space-y-2">
                <div>
                  <span className="font-semibold text-slate-600">Tiêu đề trang: </span>
                  <span className="font-medium text-slate-900">{result.scrapedData.title}</span>
                </div>
                {result.scrapedData.description && (
                  <div>
                    <span className="font-semibold text-slate-600">Mô tả: </span>
                    <span className="text-slate-700">{result.scrapedData.description}</span>
                  </div>
                )}
                {result.scrapedData.headings.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-600 block mb-1">Mục chính đã trích xuất:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.scrapedData.headings.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.e2eReport && (
            <div className="rounded-xl border border-slate-200 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-600">Phản hồi HTTP:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {result.e2eReport.statusCode} OK
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>Nút bấm phát hiện: <strong>{result.e2eReport.buttonCount}</strong></div>
                <div>Trường nhập liệu: <strong>{result.e2eReport.inputCount}</strong></div>
              </div>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono text-[11px]">
                {result.e2eReport.details}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
