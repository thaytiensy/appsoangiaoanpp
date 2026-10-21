'use client';

import { useState } from 'react';
import { Cloud, GitBranch, Github, ExternalLink, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface CloudDeployModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function CloudDeployModal({ isOpen, onClose }: CloudDeployModalProps): React.JSX.Element | null {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSyncToGitHub = async (): Promise<void> => {
    setIsLoading(true);
    setStatusMessage(null);
    setIsSuccess(null);

    try {
      const res = await fetch('/api/deploy/push', { method: 'POST' });
      const data: unknown = await res.json();
      const result = data as { success?: boolean; message?: string };

      if (res.ok && result.success) {
        setIsSuccess(true);
        setStatusMessage(result.message || 'Đồng bộ GitHub thành công! Vercel đang tự động triển khai.');
      } else {
        setIsSuccess(false);
        setStatusMessage(result.message || 'Có lỗi xảy ra khi đẩy mã nguồn lên GitHub.');
      }
    } catch (err) {
      setIsSuccess(false);
      setStatusMessage(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Đưa Lên GitHub & Vercel</h2>
              <p className="text-xs text-slate-500">Đồng bộ mã nguồn & tự động kích hoạt CI/CD Vercel</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Kho lưu trữ GitHub:</span>
              <a
                href="https://github.com/thaytiensy/appsoangiaoanpp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
              >
                <Github className="w-3.5 h-3.5" />
                <span>thaytiensy/appsoangiaoanpp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Nhánh làm việc:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                <span>master (mặc định)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Cơ chế Vercel:</span>
              <span className="text-emerald-700 font-semibold">Tự động kích hoạt khi push code</span>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 border ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              )}
              <div className="leading-relaxed">{statusMessage}</div>
            </div>
          )}

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-semibold">Quy trình tự động hóa:</p>
            <p>1. Bấm nút dưới đây để đẩy mã nguồn mới nhất lên GitHub repository.</p>
            <p>2. Vercel webhook sẽ tự động nhận commit và build bản phát hành trực tuyến.</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <span>Trang Vercel Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSyncToGitHub}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang đẩy lên GitHub...</span>
                </>
              ) : (
                <>
                  <Github className="w-3.5 h-3.5" />
                  <span>Đồng bộ lên GitHub & Vercel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
