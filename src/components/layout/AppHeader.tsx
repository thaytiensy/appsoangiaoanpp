'use client';

import React from 'react';
import { Presentation, Save, CheckCircle } from 'lucide-react';
import { User } from '@/types/user';
import { LessonPlanProject } from '@/types/lesson-plan';
import { UserBadge } from '@/components/user/UserBadge';
import { ExportPptxButton } from '@/components/preview/ExportPptxButton';

interface AppHeaderProps {
  currentUser: User;
  onOpenUserModal: () => void;
  saveStatus: string | null;
  onSaveToDb: () => void;
  project: LessonPlanProject;
}

export function AppHeader({
  currentUser,
  onOpenUserModal,
  saveStatus,
  onSaveToDb,
  project,
}: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              AI PowerPoint Lesson Planner Pro
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">2026</span>
            </h1>
            <p className="text-xs text-slate-500">Chuẩn GDPT 4 bước • SĐT/Zalo: <strong>0353205414</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <UserBadge currentUser={currentUser} onClick={onOpenUserModal} />
          <button
            type="button"
            onClick={onSaveToDb}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            {saveStatus === 'saved' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-slate-500" />}
            <span>{saveStatus === 'saved' ? 'Đã Lưu' : 'Lưu'}</span>
          </button>
          <ExportPptxButton project={project} />
        </div>
      </div>
    </header>
  );
}
