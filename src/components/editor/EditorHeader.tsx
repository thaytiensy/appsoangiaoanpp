'use client';

import React from 'react';
import { BookOpen, Clock, GraduationCap, Sparkles } from 'lucide-react';
import { LessonPlanProject } from '@/types/lesson-plan';

interface EditorHeaderProps {
  plan: LessonPlanProject;
  onChange: (updated: Partial<LessonPlanProject>) => void;
}

export function EditorHeader({ plan, onChange }: EditorHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Thông Tin Giáo Án Chuẩn Sư Phạm</h2>
            <p className="text-xs text-slate-500">Khung kế hoạch bài dạy theo chuẩn GDPT 2026</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          GDPT Chuẩn Hóa
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-12">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên Bài Học / Chuyên Đề
          </label>
          <input
            type="text"
            value={plan.lessonName}
            onChange={(e) => onChange({ lessonName: e.target.value })}
            className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            placeholder="Nhập tên bài học..."
          />
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Môn Học
          </label>
          <input
            type="text"
            value={plan.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Khối Lớp
          </label>
          <input
            type="text"
            value={plan.gradeLevel}
            onChange={(e) => onChange({ gradeLevel: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Thời Lượng (Phút)
          </label>
          <input
            type="number"
            min={15}
            max={180}
            value={plan.durationPeriod}
            onChange={(e) => onChange({ durationPeriod: parseInt(e.target.value) || 45 })}
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
}
