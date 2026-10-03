'use client';

import React from 'react';
import { Target, Layers, Clock, FileText } from 'lucide-react';
import { LessonPlanProject } from '@/types/lesson-plan';

interface LessonPlanSummaryCardProps {
  plan: LessonPlanProject;
}

export function LessonPlanSummaryCard({ plan }: LessonPlanSummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Kế Hoạch Bài Dạy Đã Sinh (Chuẩn Sư Phạm)</h3>
            <p className="text-xs text-slate-500">
              {plan.lessonName} • {plan.subject} {plan.gradeLevel} • {plan.durationPeriod} phút
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ✓ Đã Đồng Bộ Slide
        </span>
      </div>

      {/* Mục tiêu bài học */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-rose-500" />
          Mục Tiêu Bài Học (Thang Đo Bloom)
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {plan.objectives.map((obj) => (
            <div key={obj.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300 text-slate-700 shrink-0">
                {obj.category === 'KNOWLEDGE' ? 'Kiến thức' : obj.category === 'SKILL' ? 'Kỹ năng' : 'Phẩm chất'}
              </span>
              <span className="text-slate-700 flex-1">{obj.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Hoạt động dạy học */}
      <div className="space-y-2.5 pt-1">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          Tiến Trình 4 Bước Hoạt Động Sư Phạm
        </h4>
        <div className="space-y-2">
          {plan.activities.map((act, idx) => (
            <div key={act.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">{idx + 1}. {act.title}</span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {act.durationMinutes} phút
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div><strong>GV:</strong> {act.teacherRole}</div>
                <div><strong>HS:</strong> {act.studentRole}</div>
                <div className="text-slate-500"><strong>Sản phẩm:</strong> {act.expectedProduct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
