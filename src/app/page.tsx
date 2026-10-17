'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import type { LessonInput, LessonPlanOutput } from '../contracts/app.schema';
import { LessonForm } from '../components/lesson-form';
import { LessonResult } from '../components/lesson-result';
import { QuickTemplates } from '../components/lesson/quick-templates';
import { GenerationProgress } from '../components/lesson/generation-progress';
import { ApiKeyModal } from '../components/lesson/api-key-modal';

const API_KEY_STORAGE = 'lesson_planner_custom_gemini_key';

export default function HomePage(): React.JSX.Element {
  const [plan, setPlan] = useState<LessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<Partial<LessonInput> | null>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(API_KEY_STORAGE);
      if (savedKey) setCustomApiKey(savedKey);
    } catch {
      // Bỏ qua lỗi storage
    }
  }, []);

  const handleSaveApiKey = (key: string): void => {
    setCustomApiKey(key);
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
    } catch {
      // Bỏ qua lỗi storage
    }
  };

  const handleGenerate = async (formData: LessonInput): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) {
        headers['x-gemini-api-key'] = customApiKey;
      }

      const response = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorJson: unknown = await response.json().catch(() => ({}));
        const errObj = errorJson as { error?: string };
        throw new Error(errObj.error || `Yêu cầu thất bại với mã ${response.status}`);
      }

      const data: unknown = await response.json();
      setPlan(data as LessonPlanOutput);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header thanh công cụ & tiêu đề */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Chuẩn GDPT 2018 (Công văn 5512 & 2345)</span>
          </div>
          <ApiKeyModal apiKey={customApiKey} onSaveApiKey={handleSaveApiKey} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hệ thống AI Soạn Giáo Án & Slide PowerPoint Chuẩn Bộ GD
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Bộ sách giáo khoa <strong>Kết nối tri thức với cuộc sống</strong> • Tự động tạo kế hoạch bài dạy 4 bước và slide trình chiếu 16:9 chất lượng cao.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Đã xảy ra lỗi khi tạo giáo án:</p>
            <p className="text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Hiển thị Tiến trình khi đang sinh */}
      {isLoading && <GenerationProgress />}

      {/* Hiển thị Form hoặc Kết quả */}
      {!isLoading && (
        plan ? (
          <LessonResult
            plan={plan}
            onReset={() => setPlan(null)}
            onUpdatePlan={(updated) => setPlan(updated)}
          />
        ) : (
          <>
            <QuickTemplates onSelect={(preset) => setSelectedPreset(preset)} />
            <LessonForm
              onSubmit={handleGenerate}
              isLoading={isLoading}
              externalPreset={selectedPreset}
            />
          </>
        )
      )}
    </main>
  );
}
