'use client';

import { Sparkles, Calculator, BookOpen, Globe, Atom } from 'lucide-react';
import type { LessonInput } from '../../contracts/app.schema';

interface QuickTemplatesProps {
  readonly onSelect: (template: Partial<LessonInput>) => void;
}

const TEMPLATES = [
  {
    title: 'Toán học 6',
    topic: 'Số thập phân và các phép tính',
    subject: 'Toán học',
    grade: 6,
    periodNumber: 'Tiết 12',
    icon: Calculator,
    color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-800',
  },
  {
    title: 'Ngữ văn 7',
    topic: 'Thơ bốn chữ và thơ năm chữ (Đồng dao mùa xuân)',
    subject: 'Ngữ văn',
    grade: 7,
    periodNumber: 'Tiết 8',
    icon: BookOpen,
    color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800',
  },
  {
    title: 'Tiếng Anh 8',
    topic: 'Unit 3: Teenagers - Skills 1 (Reading & Speaking)',
    subject: 'Tiếng Anh',
    grade: 8,
    periodNumber: 'Tiết 24',
    icon: Globe,
    color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-800',
  },
  {
    title: 'KHTN 6',
    topic: 'Bài 17: Tế bào - Đơn vị cơ sở của sự sống',
    subject: 'Khoa học tự nhiên',
    grade: 6,
    periodNumber: 'Tiết 35',
    icon: Atom,
    color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-800',
  },
] as const;

export function QuickTemplates({ onSelect }: QuickTemplatesProps): React.JSX.Element {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-xs sm:text-sm font-bold text-slate-800">
          Gợi ý nhanh (1-Click Mẫu Chuẩn GDPT 2018):
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          return (
            <button
              key={tmpl.title}
              type="button"
              onClick={() =>
                onSelect({
                  subject: tmpl.subject,
                  grade: tmpl.grade,
                  topic: tmpl.topic,
                  periodNumber: tmpl.periodNumber,
                  durationMinutes: 45,
                  textbook: 'Kết nối tri thức với cuộc sống',
                })
              }
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${tmpl.color}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-xs">{tmpl.title}</div>
                <div className="text-[11px] truncate opacity-90">{tmpl.topic}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
