'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { LessonInputSchema, type LessonInput } from '../contracts/app.schema';
import { FormAdminSection } from './form-admin-section';
import { FormLessonSection } from './form-lesson-section';

interface LessonFormProps {
  readonly onSubmit: (data: LessonInput) => void;
  readonly isLoading: boolean;
  readonly externalPreset?: Partial<LessonInput> | null;
}

const LOCAL_STORAGE_KEY = 'lesson_planner_teacher_profile';

export function LessonForm({ onSubmit, isLoading, externalPreset }: LessonFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<LessonInput>({
    departmentName: '',
    schoolName: '',
    facultyName: '',
    teacherName: '',
    schoolYear: '2026 - 2027',
    prepareDate: new Date().toISOString().split('T')[0],
    teachDate: new Date().toISOString().split('T')[0],
    grade: 1,
    subject: 'Toán học',
    textbook: 'Kết nối tri thức với cuộc sống',
    periodNumber: 'Tiết 1',
    durationMinutes: 35,
    topic: '',
    additionalNotes: '',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LessonInput>;
        // Chỉ nạp nếu người dùng đã tự lưu thông tin trước đó
        if (parsed.schoolName || parsed.teacherName) {
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Bỏ qua lỗi localStorage
    }
  }, []);

  useEffect(() => {
    if (externalPreset) {
      setFormData((prev) => ({ ...prev, ...externalPreset }));
    }
  }, [externalPreset]);

  const handleAdminChange = (key: keyof LessonInput, val: string): void => {
    const updated = { ...formData, [key]: val };
    setFormData(updated);
    try {
      const adminProfile = {
        departmentName: updated.departmentName,
        schoolName: updated.schoolName,
        facultyName: updated.facultyName,
        teacherName: updated.teacherName,
        schoolYear: updated.schoolYear,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adminProfile));
    } catch {
      // Bỏ qua lỗi localStorage
    }
  };

  const handleGradeChange = (grade: number): void => {
    setFormData((prev) => ({
      ...prev,
      grade,
      durationMinutes: grade <= 5 ? 35 : 45,
    }));
  };

  const handleFieldChange = <K extends keyof LessonInput>(key: K, val: LessonInput[K]): void => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const result = LessonInputSchema.safeParse(formData);
    if (result.success) {
      onSubmit(result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormAdminSection formData={formData} onChange={handleAdminChange} />
      <FormLessonSection
        formData={formData}
        onGradeChange={handleGradeChange}
        onChange={handleFieldChange}
      />
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>{isLoading ? 'AI Đang Soạn Giáo Án & Slide...' : 'Bắt Đầu Soạn Giáo Án & Tạo Slide AI'}</span>
        </button>
      </div>
    </form>
  );
}
