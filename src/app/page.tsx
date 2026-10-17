'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, Clock, GraduationCap, CheckCircle, Presentation } from 'lucide-react';
import { LessonInputSchema, type LessonInput } from '../contracts/app.schema';

const DEFAULT_SUBJECTS: readonly string[] = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử & Địa lí',
  'Tin học',
  'Giáo dục công dân',
];

export default function HomePage(): React.JSX.Element {
  const [formData, setFormData] = useState<LessonInput>({
    subject: 'Toán học',
    grade: 6,
    topic: 'Số thập phân và các phép tính',
    durationMinutes: 45,
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const result = LessonInputSchema.safeParse(formData);
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Kiến trúc 4 Trụ Cột Chuẩn GDPT 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hệ thống AI Soạn Giáo Án & Slide PowerPoint Chuẩn Bộ GD
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Tự động hóa xây dựng tiến trình hoạt động dạy học 4 bước và cấu trúc slide trình chiếu bài giảng theo chuẩn Công văn 5512.
        </p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject-select" className="block text-sm font-semibold text-slate-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1 text-blue-600" />
                Môn học
              </label>
              <select
                id="subject-select"
                aria-label="Chọn môn học"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {DEFAULT_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grade-select" className="block text-sm font-semibold text-slate-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-1 text-blue-600" />
                Khối lớp
              </label>
              <select
                id="grade-select"
                aria-label="Chọn khối lớp"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade} value={grade}>Lớp {grade}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="topic-input" className="block text-sm font-semibold text-slate-700 mb-2">
              <Presentation className="w-4 h-4 inline mr-1 text-blue-600" />
              Chủ đề bài dạy
            </label>
            <input
              id="topic-input"
              type="text"
              aria-label="Chủ đề bài dạy"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Ví dụ: Định luật II Newton, Phép nhân phân số..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label htmlFor="duration-input" className="block text-sm font-semibold text-slate-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1 text-blue-600" />
              Thời lượng (phút)
            </label>
            <input
              id="duration-input"
              type="number"
              aria-label="Thời lượng bài dạy tính theo phút"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full sm:w-48 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Khóa Data Contract: LessonInputSchema</span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Thiết kế Giáo án & Slide</span>
            </button>
          </div>
        </form>

        {submitted && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Đã xác thực dữ liệu đầu vào thành công theo Data Contract: <strong>{formData.subject} - Lớp {formData.grade}</strong>: <em>{formData.topic}</em> ({formData.durationMinutes} phút).
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
