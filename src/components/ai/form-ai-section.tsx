'use client';

import { useState } from 'react';
import { Cpu, CheckCircle2, Key, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { AI_MODELS, type AIModelOption } from '../../constants/ai-models';
import type { AIProvider } from '../../contracts/app.schema';

interface FormAiSectionProps {
  readonly selectedProvider: AIProvider;
  readonly apiKey: string;
  readonly onSelectAI: (provider: AIProvider, model: string) => void;
  readonly onApiKeyChange: (key: string) => void;
}

export function FormAiSection({
  selectedProvider,
  apiKey,
  onSelectAI,
  onApiKeyChange,
}: FormAiSectionProps): React.JSX.Element {
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-slate-800">3. Lựa chọn Động cơ AI Soạn Bài & Thiết Kế Slide</h2>
            <p className="text-xs text-slate-500">Tùy chọn mô hình AI bạn tin dùng (Gemini, ChatGPT, Claude, DeepSeek, Offline)</p>
          </div>
        </div>
      </div>

      {/* Grid danh sách các Động cơ AI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {AI_MODELS.map((model: AIModelOption) => {
          const isSelected = selectedProvider === model.provider;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelectAI(model.provider, model.defaultModel)}
              className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{model.icon}</span>
                    <span className="font-bold text-xs text-slate-900">{model.shortName}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      model.recommended
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {model.tag}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-700 mb-1">{model.name}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {model.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-indigo-700">{model.highlight}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tùy chọn nhập khóa API cá nhân nếu người dùng muốn */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <button
          type="button"
          onClick={() => setShowKeyInput((prev) => !prev)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Khóa API cá nhân (Tùy chọn - Mặc định đã có tài khoản hệ thống miễn phí)</span>
          </div>
          {showKeyInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showKeyInput && (
          <div className="p-4 pt-1 bg-white border-t border-slate-200 text-xs space-y-2">
            <div className="flex items-start gap-2 text-slate-600 bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg text-[11px]">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Bạn <strong>không bắt buộc</strong> phải nhập khóa API. Hệ thống sẽ tự động điều phối qua máy chủ miễn phí 100%. Nếu bạn có khóa API riêng (Gemini, OpenAI, Claude, DeepSeek) và muốn sử dụng hạn mức cá nhân, hãy dán vào ô bên dưới.
              </span>
            </div>
            <div>
              <label htmlFor="custom-api-key" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nhập API Key riêng cho {selectedProvider.toUpperCase()}:
              </label>
              <input
                id="custom-api-key"
                type="password"
                placeholder={`Dán khóa API của bạn cho ${selectedProvider}...`}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
