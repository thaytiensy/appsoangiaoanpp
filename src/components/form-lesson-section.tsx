'use client';

import { BookOpen, Layers, Clock } from 'lucide-react';
import { GRADES, TEXTBOOKS, getSubjectsByGrade } from '../constants/curriculum';
import type { LessonInput } from '../contracts/app.schema';

interface FormLessonSectionProps {
  readonly formData: LessonInput;
  readonly onGradeChange: (grade: number) => void;
  readonly onChange: <K extends keyof LessonInput>(key: K, val: LessonInput[K]) => void;
}

export function FormLessonSection({
  formData,
  onGradeChange,
  onChange,
}: FormLessonSectionProps): React.JSX.Element {
  const availableSubjects = getSubjectsByGrade(formData.grade);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        <h2 className="text-base font-bold text-slate-800">2. Cấu hình bài dạy (Chuẩn CV 5512 / 2345)</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <label htmlFor="grade-select" className="block text-xs font-medium text-slate-700 mb-1">
            <Layers className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />Khối lớp *
          </label>
          <select
            id="grade-select"
            aria-label="Chọn khối lớp"
            value={formData.grade}
            onChange={(e) => onGradeChange(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-white"
          >
            {GRADES.map((g) => (
              <option key={g.id} value={g.id}>{g.label} ({g.stage})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject-select" className="block text-xs font-medium text-slate-700 mb-1">Môn học GDPT 2018 *</label>
          <select
            id="subject-select"
            aria-label="Chọn môn học"
            value={formData.subject}
            onChange={(e) => onChange('subject', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-white"
          >
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="textbook-select" className="block text-xs font-medium text-slate-700 mb-1">Bộ sách giáo khoa *</label>
          <select
            id="textbook-select"
            aria-label="Chọn bộ sách giáo khoa"
            value="Kết nối tri thức với cuộc sống"
            disabled
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-50 text-slate-800 font-medium cursor-not-allowed"
          >
            {TEXTBOOKS.map((tb) => (
              <option key={tb} value={tb}>{tb}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="period-number" className="block text-xs font-medium text-slate-700 mb-1">Tiết PPCT</label>
            <input
              id="period-number"
              type="text"
              aria-label="Tiết phân phối chương trình"
              value={formData.periodNumber}
              onChange={(e) => onChange('periodNumber', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="duration-mins" className="block text-xs font-medium text-slate-700 mb-1">
              <Clock className="w-3 h-3 inline mr-1 text-slate-500" />Thời lượng (phút)
            </label>
            <input
              id="duration-mins"
              type="number"
              aria-label="Thời lượng tính theo phút"
              value={formData.durationMinutes}
              onChange={(e) => onChange('durationMinutes', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label htmlFor="topic-name" className="block text-xs font-medium text-slate-700 mb-1">Tên bài dạy / Chủ đề bài học *</label>
          <input
            id="topic-name"
            type="text"
            aria-label="Tên bài dạy hoặc chủ đề bài học"
            required
            value={formData.topic}
            onChange={(e) => onChange('topic', e.target.value)}
            placeholder="Ví dụ: Bài 12. Phép trừ phân số, Sự rơi tự do..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
          />
        </div>
        <div>
          <label htmlFor="additional-notes" className="block text-xs font-medium text-slate-700 mb-1">Ghi chú trọng tâm / Yêu cầu sư phạm bổ sung (tùy chọn)</label>
          <textarea
            id="additional-notes"
            aria-label="Ghi chú trọng tâm hoặc yêu cầu sư phạm bổ sung"
            rows={2}
            value={formData.additionalNotes}
            onChange={(e) => onChange('additionalNotes', e.target.value)}
            placeholder="Yêu cầu nhấn mạnh kiến thức, phương pháp dạy học tích cực, hoạt động nhóm..."
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
