'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getSubjectsByGrade } from '../constants/curriculum';
import { LessonInputSchema, type LessonInput } from '../contracts/app.schema';
import { FormAdminSection } from './form-admin-section';
import { FormLessonSection } from './form-lesson-section';

interface LessonFormProps {
  readonly onSubmit: (data: LessonInput) => void;
  readonly isLoading: boolean;
}

const LOCAL_STORAGE_KEY = 'lesson_planner_teacher_profile';

export function LessonForm({ onSubmit, isLoading }: LessonFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<LessonInput>({
    departmentName: 'Phòng GD&ĐT Thành phố',
    schoolName: 'Trường THCS & THPT Chu Văn An',
    facultyName: 'Tổ Toán - Tin học',
    teacherName: 'Thầy Đỗ Tiến Sỹ',
    schoolYear: '2026 - 2027',
    prepareDate: new Date().toISOString().split('T')[0],
    teachDate: new Date().toISOString().split('T')[0],
    grade: 6,
    subject: 'Toán học',
    textbook: 'Kết nối tri thức với cuộc sống',
    periodNumber: 'Tiết 12',
    durationMinutes: 45,
    topic: 'Số thập phân và các phép tính',
    additionalNotes: 'Tích hợp hoạt động thảo luận nhóm và bài tập thực hành ứng dụng thực tế',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LessonInput>;
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Bỏ qua lỗi localStorage
    }
  }, []);

  const handleAdminChange = (key: keyof LessonInput, val: string): void => {
    const updated = { ...formData, [key]: val };
    setFormData(updated);
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          departmentName: updated.departmentName,
          schoolName: updated.schoolName,
          facultyName: updated.facultyName,
          teacherName: updated.teacherName,
          schoolYear: updated.schoolYear,
        })
      );
    } catch {
      // Bỏ qua lỗi lưu
    }
  };

  const handleGradeChange = (newGrade: number): void => {
    const validSubjects = getSubjectsByGrade(newGrade);
    const newSubject = validSubjects.includes(formData.subject) ? formData.subject : validSubjects[0];
    setFormData({ ...formData, grade: newGrade, subject: newSubject });
  };

  const handleFieldChange = <K extends keyof LessonInput>(key: K, val: LessonInput[K]): void => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-md transition transform active:scale-95"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>{isLoading ? 'AI Đang Soạn Giáo Án & Slide...' : 'Bắt Đầu Soạn Giáo Án & Tạo Slide AI'}</span>
        </button>
      </div>
    </form>
  );
}
