'use client';

import { useState } from 'react';
import { Copy, Check, Printer, Edit3 } from 'lucide-react';
import type { LessonPlanOutput } from '../../contracts/app.schema';

interface EditableKhbdProps {
  readonly plan: LessonPlanOutput;
  readonly onUpdatePlan: (updated: LessonPlanOutput) => void;
}

export function EditableKhbd({ plan, onUpdatePlan }: EditableKhbdProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const { metadata, objectives, materials, activities } = plan;

  const handleCopy = async (): Promise<void> => {
    try {
      const text = `KẾ HOẠCH BÀI DẠY: ${metadata.topic}\nMôn: ${metadata.subject} - Lớp ${metadata.grade} (${metadata.textbook})\n\nI. MỤC TIÊU:\n- Kiến thức: ${objectives.knowledge}\n- Năng lực: ${objectives.coreCompetencies}; ${objectives.specificCompetencies}\n- Phẩm chất: ${objectives.qualities}\n\nII. THIẾT BỊ DẠY HỌC:\n- GV: ${materials.teacherPreparation}\n- HS: ${materials.studentPreparation}\n\nIII. TIẾN TRÌNH DẠY HỌC:\n` +
        activities.map((a) => `${a.stepName} (${a.duration}):\n+ Mục tiêu: ${a.objective}\n+ Nội dung: ${a.content}\n+ Sản phẩm: ${a.product}`).join('\n\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Edit3 className="w-4 h-4 text-blue-600" />
          <span>Thầy/Cô có thể chỉnh sửa trực tiếp nội dung văn bản dưới đây trước khi in hoặc lưu.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép văn bản'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In / Lưu PDF</span>
          </button>
        </div>
      </div>

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          // Lưu trạng thái sửa đổi nếu cần
        }}
        className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-slate-800 leading-relaxed font-serif text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {/* Tiêu đề hành chính */}
        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300 text-xs text-center font-sans">
          <div>
            <p className="uppercase font-semibold">{metadata.departmentName}</p>
            <p className="uppercase font-bold text-slate-900">{metadata.schoolName}</p>
            <p className="italic">Tổ chuyên môn: {metadata.facultyName}</p>
            <p className="mt-1">Họ tên GV: <strong>{metadata.teacherName}</strong></p>
          </div>
          <div>
            <p className="uppercase font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-semibold underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
            <p className="italic mt-2">Năm học: {metadata.schoolYear}</p>
          </div>
        </div>

        <div className="text-center my-6">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
            KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512)
          </h2>
          <p className="text-base font-bold text-blue-700 mt-1 uppercase">
            BÀI: {metadata.topic}
          </p>
          <p className="text-xs font-sans text-slate-600 mt-1">
            Môn: <strong>{metadata.subject}</strong> | Lớp: <strong>{metadata.grade}</strong> | Bộ sách: <strong>{metadata.textbook}</strong> | {metadata.periodNumber} ({metadata.durationMinutes} phút)
          </p>
        </div>

        {/* I. MỤC TIÊU */}
        <section className="mb-6">
          <h3 className="font-bold uppercase text-slate-900 mb-2 border-b pb-1 font-sans text-sm">I. MỤC TIÊU</h3>
          <div className="space-y-2 text-xs sm:text-sm pl-2">
            <p><strong>1. Về kiến thức:</strong> {objectives.knowledge}</p>
            <p><strong>2. Về năng lực:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li><em>Năng lực chung:</em> {objectives.coreCompetencies}</li>
              <li><em>Năng lực đặc thù:</em> {objectives.specificCompetencies}</li>
            </ul>
            <p><strong>3. Về phẩm chất:</strong> {objectives.qualities}</p>
          </div>
        </section>

        {/* II. THIẾT BỊ DẠY HỌC */}
        <section className="mb-6">
          <h3 className="font-bold uppercase text-slate-900 mb-2 border-b pb-1 font-sans text-sm">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
          <div className="space-y-1 text-xs sm:text-sm pl-2">
            <p><strong>1. Giáo viên:</strong> {materials.teacherPreparation}</p>
            <p><strong>2. Học sinh:</strong> {materials.studentPreparation}</p>
          </div>
        </section>

        {/* III. TIẾN TRÌNH DẠY HỌC */}
        <section className="space-y-6">
          <h3 className="font-bold uppercase text-slate-900 mb-2 border-b pb-1 font-sans text-sm">III. TIẾN TRÌNH DẠY HỌC</h3>
          {activities.map((act, index) => (
            <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-blue-900 font-sans text-sm mb-1">
                {act.stepName} ({act.duration})
              </h4>
              <div className="text-xs space-y-1 text-slate-700 mb-3 pl-2">
                <p><strong>a) Mục tiêu:</strong> {act.objective}</p>
                <p><strong>b) Nội dung:</strong> {act.content}</p>
                <p><strong>c) Sản phẩm:</strong> {act.product}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-300 font-sans">
                  <thead className="bg-slate-200 text-slate-800">
                    <tr>
                      <th className="p-2 border border-slate-300 w-1/2 text-left">Hoạt động của Giáo viên</th>
                      <th className="p-2 border border-slate-300 w-1/2 text-left">Hoạt động của Học sinh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 bg-white">
                    <tr>
                      <td className="p-2 border border-slate-300 align-top">
                        <strong>Bước 1 (Chuyển giao):</strong> {act.implementation.transferTask}
                      </td>
                      <td className="p-2 border border-slate-300 align-top">
                        <strong>Bước 2 (Thực hiện):</strong> {act.implementation.performTask}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 align-top">
                        <strong>Bước 4 (Kết luận):</strong> {act.implementation.concludeJudge}
                      </td>
                      <td className="p-2 border border-slate-300 align-top">
                        <strong>Bước 3 (Báo cáo):</strong> {act.implementation.reportDiscuss}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
