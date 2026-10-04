'use client';

import React, { useState } from 'react';
import { Target, Layers, Clock, FileText, Edit3, Check, Sparkles } from 'lucide-react';
import { LessonPlanProject, PedagogicalActivity } from '@/types/lesson-plan';

interface LessonPlanSummaryCardProps {
  plan: LessonPlanProject;
  onUpdateObjective?: (index: number, description: string) => void;
  onUpdateActivity?: (index: number, updated: Partial<PedagogicalActivity>) => void;
}

export function LessonPlanSummaryCard({
  plan,
  onUpdateObjective,
  onUpdateActivity,
}: LessonPlanSummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
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

        <div className="flex items-center gap-2">
          {(onUpdateObjective || onUpdateActivity) && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                isEditing
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Xong Chỉnh Sửa</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa Thật</span>
                </>
              )}
            </button>
          )}
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline">
            ✓ Đã Đồng Bộ Slide
          </span>
        </div>
      </div>

      {/* Mục tiêu bài học */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-500" />
            Mục Tiêu Bài Học (Thang Đo Bloom)
          </h4>
          {isEditing && (
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Chỉnh sửa trực tiếp mục tiêu bên dưới
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {plan.objectives.map((obj, idx) => (
            <div key={obj.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300 text-slate-700 shrink-0 mt-0.5">
                {obj.category === 'KNOWLEDGE' ? 'Kiến thức' : obj.category === 'SKILL' ? 'Kỹ năng' : 'Phẩm chất'}
              </span>
              {isEditing && onUpdateObjective ? (
                <textarea
                  rows={2}
                  value={obj.description}
                  onChange={(e) => onUpdateObjective(idx, e.target.value)}
                  className="flex-1 text-xs text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              ) : (
                <span className="text-slate-700 flex-1 leading-relaxed">{obj.description}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4 Hoạt động dạy học */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Tiến Trình 4 Bước Hoạt Động Sư Phạm
          </h4>
          {isEditing && (
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Chỉnh sửa vai trò GV, HS và sản phẩm
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          {plan.activities.map((act, idx) => (
            <div key={act.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                {isEditing && onUpdateActivity ? (
                  <input
                    type="text"
                    value={act.title}
                    onChange={(e) => onUpdateActivity(idx, { title: e.target.value })}
                    className="text-xs font-bold text-indigo-700 bg-white border border-slate-300 rounded px-2 py-1 flex-1 min-w-[200px]"
                  />
                ) : (
                  <span className="text-xs font-bold text-indigo-700">{idx + 1}. {act.title}</span>
                )}
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isEditing && onUpdateActivity ? (
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={act.durationMinutes}
                      onChange={(e) => onUpdateActivity(idx, { durationMinutes: Number(e.target.value) || 5 })}
                      className="w-12 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded px-1 text-center"
                    />
                  ) : (
                    <span>{act.durationMinutes}</span>
                  )}
                  <span>phút</span>
                </span>
              </div>

              {isEditing && onUpdateActivity ? (
                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Vai trò Giáo Viên (GV):</label>
                    <textarea
                      rows={2}
                      value={act.teacherRole}
                      onChange={(e) => onUpdateActivity(idx, { teacherRole: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Hoạt động Học Sinh (HS):</label>
                    <textarea
                      rows={2}
                      value={act.studentRole}
                      onChange={(e) => onUpdateActivity(idx, { studentRole: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Sản phẩm kỳ vọng:</label>
                    <input
                      type="text"
                      value={act.expectedProduct}
                      onChange={(e) => onUpdateActivity(idx, { expectedProduct: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div><strong>GV:</strong> {act.teacherRole}</div>
                  <div><strong>HS:</strong> {act.studentRole}</div>
                  <div className="text-slate-500"><strong>Sản phẩm:</strong> {act.expectedProduct}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
