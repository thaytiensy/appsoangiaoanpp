'use client';

import React from 'react';
import { Target, Plus, Trash2, Award } from 'lucide-react';
import { BloomLevel, LessonObjective } from '@/types/lesson-plan';

interface ObjectivesEditorProps {
  objectives: LessonObjective[];
  onChange: (objectives: LessonObjective[]) => void;
}

const BLOOM_LEVELS: { value: BloomLevel; label: string; badgeColor: string }[] = [
  { value: 'REMEMBER', label: '1. Nhận biết', badgeColor: 'bg-blue-100 text-blue-800' },
  { value: 'UNDERSTAND', label: '2. Thông hiểu', badgeColor: 'bg-cyan-100 text-cyan-800' },
  { value: 'APPLY', label: '3. Vận dụng', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { value: 'ANALYZE', label: '4. Phân tích', badgeColor: 'bg-amber-100 text-amber-800' },
  { value: 'EVALUATE', label: '5. Đánh giá', badgeColor: 'bg-orange-100 text-orange-800' },
  { value: 'CREATE', label: '6. Sáng tạo', badgeColor: 'bg-purple-100 text-purple-800' },
];

export function ObjectivesEditor({ objectives, onChange }: ObjectivesEditorProps) {
  const handleAdd = () => {
    const newObj: LessonObjective = {
      id: crypto.randomUUID ? crypto.randomUUID() : `obj-${Date.now()}`,
      category: 'KNOWLEDGE',
      description: 'Học sinh nắm vững kiến thức cốt lõi và vận dụng linh hoạt.',
      bloomLevel: 'UNDERSTAND',
    };
    onChange([...objectives, newObj]);
  };

  const handleUpdate = (index: number, updated: Partial<LessonObjective>) => {
    const list = [...objectives];
    list[index] = { ...list[index], ...updated };
    onChange(list);
  };

  const handleDelete = (index: number) => {
    if (objectives.length <= 1) return;
    onChange(objectives.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Mục Tiêu Bài Học (Chuẩn Thang Đo Bloom)</h3>
            <p className="text-xs text-slate-500">Phẩm chất, năng lực & mức độ tư duy nhận thức</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm Mục Tiêu
        </button>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {objectives.map((obj, idx) => (
          <div key={obj.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                <select
                  value={obj.category}
                  onChange={(e) =>
                    handleUpdate(idx, { category: e.target.value as 'KNOWLEDGE' | 'SKILL' | 'ATTITUDE' })
                  }
                  className="text-xs font-semibold px-2 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="KNOWLEDGE">Kiến thức</option>
                  <option value="SKILL">Kỹ năng</option>
                  <option value="ATTITUDE">Phẩm chất / Thái độ</option>
                </select>
                <select
                  value={obj.bloomLevel}
                  onChange={(e) =>
                    handleUpdate(idx, { bloomLevel: e.target.value as BloomLevel })
                  }
                  className="text-xs font-semibold px-2 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                >
                  {BLOOM_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                  title="Xóa mục tiêu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={obj.description}
              onChange={(e) => handleUpdate(idx, { description: e.target.value })}
              className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="Mô tả cụ thể hành vi đầu ra của học sinh..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
