'use client';

import React, { useState } from 'react';
import { Layers, Clock, UserCheck, Users, PackageCheck } from 'lucide-react';
import { ActivityPhase, PedagogicalActivity } from '@/types/lesson-plan';

interface PedagogicalActivitiesEditorProps {
  activities: PedagogicalActivity[];
  onChange: (activities: PedagogicalActivity[]) => void;
}

const PHASES_CONFIG: {
  phase: ActivityPhase;
  label: string;
  sub: string;
  badge: string;
}[] = [
  { phase: 'WARM_UP', label: '1. Khởi Động', sub: 'Tạo tâm thế & khơi gợi hứng thú', badge: 'bg-amber-100 text-amber-800' },
  { phase: 'KNOWLEDGE', label: '2. Hình Thành Kiến Thức', sub: 'Khám phá & xây dựng tri thức mới', badge: 'bg-blue-100 text-blue-800' },
  { phase: 'PRACTICE', label: '3. Luyện Tập', sub: 'Củng cố kiến thức & rèn kỹ năng', badge: 'bg-emerald-100 text-emerald-800' },
  { phase: 'APPLICATION', label: '4. Vận Dụng & Mở Rộng', sub: 'Liên hệ thực tế & dự án sáng tạo', badge: 'bg-purple-100 text-purple-800' },
];

export function PedagogicalActivitiesEditor({ activities, onChange }: PedagogicalActivitiesEditorProps) {
  const [activeTab, setActiveTab] = useState<ActivityPhase>('WARM_UP');

  const currentIndex = activities.findIndex((a) => a.phase === activeTab);
  const currentActivity = activities[currentIndex] ?? activities[0];

  const handleUpdate = (updated: Partial<PedagogicalActivity>) => {
    if (currentIndex === -1) return;
    const list = [...activities];
    list[currentIndex] = { ...list[currentIndex], ...updated };
    onChange(list);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tiến Trình Dạy Học (4 Bước Sư Phạm)</h3>
            <p className="text-xs text-slate-500">Chuẩn hóa cấu trúc kế hoạch dạy học theo Công văn GDPT</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg">
        {PHASES_CONFIG.map((cfg) => {
          const isActive = activeTab === cfg.phase;
          return (
            <button
              key={cfg.phase}
              type="button"
              onClick={() => setActiveTab(cfg.phase)}
              className={`text-left px-2.5 py-1.5 rounded-md transition text-xs font-semibold ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <div className="truncate">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {currentActivity && (
        <div className="space-y-3 p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-9">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Hoạt Động
              </label>
              <input
                type="text"
                value={currentActivity.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Thời lượng (phút)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={currentActivity.durationMinutes}
                onChange={(e) =>
                  handleUpdate({ durationMinutes: parseInt(e.target.value) || 5 })
                }
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Hoạt Động Của Giáo Viên (Giao nhiệm vụ & hướng dẫn)
            </label>
            <textarea
              rows={2}
              value={currentActivity.teacherRole}
              onChange={(e) => handleUpdate({ teacherRole: e.target.value })}
              className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Hoạt Động Của Học Sinh (Thực hiện nhiệm vụ & thảo luận)
            </label>
            <textarea
              rows={2}
              value={currentActivity.studentRole}
              onChange={(e) => handleUpdate({ studentRole: e.target.value })}
              className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-purple-600" />
              Sản Phẩm Dự Kiến Cần Đạt
            </label>
            <textarea
              rows={2}
              value={currentActivity.expectedProduct}
              onChange={(e) => handleUpdate({ expectedProduct: e.target.value })}
              className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
