'use client';

import type { LessonPlanOutput } from '../contracts/app.schema';

interface LessonPlanDocumentProps {
  readonly plan: LessonPlanOutput;
}

export function LessonPlanDocument({ plan }: LessonPlanDocumentProps): React.JSX.Element {
  const { metadata, objectives, materials, activities } = plan;

  return (
    <div id="lesson-plan-print" className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-slate-800 leading-relaxed font-serif text-sm">
      {/* Khung đầu văn bản hành chính */}
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

      {/* Tiêu đề Kế hoạch bài dạy */}
      <div className="text-center my-6">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
          KẾ HOẠCH BÀI DẠY
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

      {/* II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
      <section className="mb-6">
        <h3 className="font-bold uppercase text-slate-900 mb-2 border-b pb-1 font-sans text-sm">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
        <div className="space-y-1 text-xs sm:text-sm pl-2">
          <p><strong>1. Giáo viên:</strong> {materials.teacherPreparation}</p>
          <p><strong>2. Học sinh:</strong> {materials.studentPreparation}</p>
        </div>
      </section>

      {/* III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG) */}
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
                      <strong>Bước 1: Chuyển giao nhiệm vụ:</strong> {act.implementation.transferTask}
                    </td>
                    <td className="p-2 border border-slate-300 align-top">
                      <strong>Bước 2: Thực hiện nhiệm vụ:</strong> {act.implementation.performTask}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 align-top">
                      <strong>Bước 4: Kết luận, nhận định:</strong> {act.implementation.concludeJudge}
                    </td>
                    <td className="p-2 border border-slate-300 align-top">
                      <strong>Bước 3: Báo cáo, thảo luận:</strong> {act.implementation.reportDiscuss}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
