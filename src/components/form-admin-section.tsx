'use client';

import { School, User, Calendar } from 'lucide-react';
import type { LessonInput } from '../contracts/app.schema';

interface FormAdminSectionProps {
  readonly formData: LessonInput;
  readonly onChange: (key: keyof LessonInput, val: string) => void;
}

export function FormAdminSection({ formData, onChange }: FormAdminSectionProps): React.JSX.Element {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <School className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-bold text-slate-800">1. Đơn vị công tác & Giáo viên bộ môn</h2>
        <span className="text-xs text-slate-500 ml-auto hidden sm:inline">(Tự động ghi nhớ cho các lần soạn sau)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <label htmlFor="dept-name" className="block text-xs font-medium text-slate-700 mb-1">Cơ quan chủ quản</label>
          <input
            id="dept-name"
            type="text"
            aria-label="Cơ quan chủ quản"
            placeholder="ví dụ: Phòng Giáo dục và Đào tạo..."
            value={formData.departmentName}
            onChange={(e) => onChange('departmentName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="school-name" className="block text-xs font-medium text-slate-700 mb-1">Tên trường *</label>
          <input
            id="school-name"
            type="text"
            aria-label="Tên trường"
            required
            placeholder="ví dụ: Trường PTDTBTTH Lê Quý Đôn..."
            value={formData.schoolName}
            onChange={(e) => onChange('schoolName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="faculty-name" className="block text-xs font-medium text-slate-700 mb-1">Tổ chuyên môn *</label>
          <input
            id="faculty-name"
            type="text"
            aria-label="Tổ chuyên môn"
            required
            placeholder="ví dụ: Tổ Khối 2, Tổ Toán..."
            value={formData.facultyName}
            onChange={(e) => onChange('facultyName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="teacher-name" className="block text-xs font-medium text-slate-700 mb-1">
            <User className="w-3.5 h-3.5 inline mr-1 text-slate-500" />Họ tên giáo viên *
          </label>
          <input
            id="teacher-name"
            type="text"
            aria-label="Họ tên giáo viên"
            required
            placeholder="ví dụ: Thầy Đỗ Tiến Sỹ..."
            value={formData.teacherName}
            onChange={(e) => onChange('teacherName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
          />
        </div>
        <div>
          <label htmlFor="school-year" className="block text-xs font-medium text-slate-700 mb-1">Năm học</label>
          <input
            id="school-year"
            type="text"
            aria-label="Năm học"
            placeholder="2026 - 2027"
            value={formData.schoolYear}
            onChange={(e) => onChange('schoolYear', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="prepare-date" className="block text-xs font-medium text-slate-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1 text-slate-500" />Ngày soạn
            </label>
            <input
              id="prepare-date"
              type="date"
              aria-label="Ngày soạn bài"
              value={formData.prepareDate}
              onChange={(e) => onChange('prepareDate', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="teach-date" className="block text-xs font-medium text-slate-700 mb-1">Ngày dạy</label>
            <input
              id="teach-date"
              type="date"
              aria-label="Ngày thực hiện bài dạy"
              value={formData.teachDate}
              onChange={(e) => onChange('teachDate', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
