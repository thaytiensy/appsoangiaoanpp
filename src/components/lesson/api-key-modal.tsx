'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';

interface ApiKeyModalProps {
  readonly apiKey: string;
  readonly onSaveApiKey: (key: string) => void;
}

export function ApiKeyModal({ apiKey, onSaveApiKey }: ApiKeyModalProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>(apiKey);
  const [showKey, setShowKey] = useState<boolean>(false);

  useEffect(() => {
    setInputVal(apiKey);
  }, [apiKey]);

  const handleSave = (): void => {
    onSaveApiKey(inputVal.trim());
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition"
      >
        <Key className="w-3.5 h-3.5 text-amber-500" />
        <span>{apiKey ? 'API Key: Đã cài đặt' : 'Cài đặt API Key'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">Cấu hình Google Gemini API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Nhập khóa Gemini API Key của Thầy/Cô (bắt đầu bằng <code className="bg-slate-100 px-1 rounded">AIzaSy...</code>) lấy miễn phí tại{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-medium"
              >
                Google AI Studio
              </a>
              . Khóa sẽ được lưu an toàn trong trình duyệt của Thầy/Cô.
            </p>

            <div className="relative mb-5">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Khóa API</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
