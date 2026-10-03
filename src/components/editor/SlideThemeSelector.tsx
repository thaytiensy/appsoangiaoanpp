'use client';

import React, { useRef, useState } from 'react';
import { Palette, Upload, Check, FileCheck, Loader2 } from 'lucide-react';
import { BUILTIN_THEMES } from '@/lib/slide-themes';
import { parseUploadedTemplate, ParsedTemplateResult } from '@/lib/pptx-parser';

interface SlideThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onUploadCustomTheme?: (result: ParsedTemplateResult) => void;
}

export function SlideThemeSelector({ selectedThemeId, onSelectTheme, onUploadCustomTheme }: SlideThemeSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState<number>(0);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const parsed = await parseUploadedTemplate(file);
      setUploadedFileName(parsed.templateName);
      setSlideCount(parsed.slides.length);
      if (onUploadCustomTheme) {
        onUploadCustomTheme(parsed);
      }
    } catch (err) {
      console.error('Error parsing uploaded template:', err);
    } finally {
      setIsParsing(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-600" />
          Mẫu Slide Trình Chiếu (Đồng nhất nền & Kiểu chữ)
        </label>
        <button
          type="button"
          disabled={isParsing}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer disabled:opacity-50"
        >
          {isParsing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          <span>{isParsing ? 'Đang đọc .pptx...' : 'Tải Mẫu Slide Lên'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,.potx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadedFileName && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            Đã áp dụng mẫu: <strong>{uploadedFileName}</strong>
            {slideCount > 0 ? ` (${slideCount} slide bài giảng)` : ' (Ảnh nền)'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {BUILTIN_THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`p-2 rounded-lg border text-left transition relative cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-full h-3 rounded-sm bg-gradient-to-r ${theme.previewGradient} mb-1`} />
              <div className="text-[11px] font-bold text-slate-800 truncate">{theme.name}</div>
              {isSelected && (
                <div className="absolute top-1 right-1 p-0.5 bg-indigo-600 text-white rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
