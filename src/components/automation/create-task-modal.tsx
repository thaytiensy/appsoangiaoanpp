"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { AutomationActionType } from "@/types/automation";
import { sanitizeUrl } from "@/lib/url-utils";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    name: string;
    targetUrl: string;
    actionType: AutomationActionType;
    scheduleCron?: string;
  }) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [actionType, setActionType] = useState<AutomationActionType>("scrape");
  const [scheduleCron, setScheduleCron] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên tác vụ");
      return;
    }

    const cleanedUrl = sanitizeUrl(targetUrl);
    try {
      new URL(cleanedUrl);
    } catch {
      setError("URL không hợp lệ. Vui lòng nhập URL dạng https://example.com");
      return;
    }

    setError(null);
    onSubmit({
      name: name.trim(),
      targetUrl: cleanedUrl,
      actionType,
      scheduleCron: scheduleCron.trim() || undefined,
    });
    setName("");
    setTargetUrl("");
    setScheduleCron("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Tạo tác vụ tự động hóa mới</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tên tác vụ *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Quét dữ liệu bài giảng GDPT mới"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Đường dẫn mục tiêu (URL) *
            </label>
            <input
              type="text"
              required
              placeholder="https://example.com hoặc example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onBlur={() => {
                if (targetUrl) setTargetUrl(sanitizeUrl(targetUrl));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-hidden font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Loại tác vụ
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as AutomationActionType)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-hidden bg-white cursor-pointer"
            >
              <option value="scrape">Web Scraping (Thu thập dữ liệu + Gemini AI)</option>
              <option value="screenshot">Screenshot (Chụp ảnh màn hình thật)</option>
              <option value="e2e_test">E2E Testing (Kiểm thử tải trang & phần tử)</option>
              <option value="form_fill">Form Auto-fill (Điền form tự động)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Lịch trình Cron (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="0 8 * * * (Mỗi sáng lúc 8:00)"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 cursor-pointer"
            >
              Khởi tạo tác vụ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
