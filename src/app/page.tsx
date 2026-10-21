'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, UploadCloud, Cloud } from 'lucide-react';
import type { LessonInput, LessonPlanOutput } from '../contracts/app.schema';
import type { User } from '../contracts/user.schema';
import { getCurrentUser } from '../services/user-service';
import { LessonForm } from '../components/lesson-form';
import { LessonResult } from '../components/lesson-result';
import { QuickTemplates } from '../components/lesson/quick-templates';
import { GenerationProgress } from '../components/lesson/generation-progress';
import { UserProfileButton } from '../components/auth/user-profile-button';
import { AdminDashboardModal } from '../components/auth/admin-dashboard-modal';
import { WordUploadModal } from '../components/lesson/word-upload-modal';
import { CloudDeployModal } from '../components/deploy/cloud-deploy-modal';

export default function HomePage(): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isWordOpen, setIsWordOpen] = useState<boolean>(false);
  const [isDeployOpen, setIsDeployOpen] = useState<boolean>(false);
  const [plan, setPlan] = useState<LessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Partial<LessonInput> | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

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
      {/* Header thanh công cụ & Tác vụ nâng cao */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Chuẩn GDPT 2018 (Công văn 5512 & 2345)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWordOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Tải file Word (.docx)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeployOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span>GitHub & Vercel</span>
            </button>

            <UserProfileButton
              currentUser={currentUser}
              onUserChange={(u) => setCurrentUser(u)}
              onOpenAdminDashboard={() => setIsAdminOpen(true)}
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hệ thống AI Soạn Giáo Án & Slide PowerPoint Chuẩn Bộ GD
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Bộ sách giáo khoa <strong>Kết nối tri thức với cuộc sống</strong> • Bóc tách Word tạo Slide 16:9 • Tự động lọc trùng lặp & đồng bộ GitHub / Vercel.
          </p>
        </div>
      </header>

      {/* Các Modal Quản trị & Tiện ích */}
      <AdminDashboardModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <WordUploadModal
        isOpen={isWordOpen}
        onClose={() => setIsWordOpen(false)}
        onApplyPlan={(newPlan) => setPlan(newPlan)}
      />
      <CloudDeployModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Thông báo hệ thống:</p>
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
