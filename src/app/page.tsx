'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import type { LessonInput, LessonPlanOutput } from '../contracts/app.schema';
import { LessonForm } from '../components/lesson-form';
import { LessonResult } from '../components/lesson-result';

export default function HomePage(): React.JSX.Element {
  const [plan, setPlan] = useState<LessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: LessonInput): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Hệ Thống Chuẩn GDPT 2018 (Công văn 5512 & 2345)</span>
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
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {plan ? (
        <LessonResult plan={plan} onReset={() => setPlan(null)} />
      ) : (
        <LessonForm onSubmit={handleGenerate} isLoading={isLoading} />
      )}
    </main>
  );
}
