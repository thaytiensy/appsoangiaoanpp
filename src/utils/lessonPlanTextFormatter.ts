import { LessonPlanProject } from '@/types/lesson-plan';

export function formatLessonPlanToPlainText(plan: LessonPlanProject): string {
  const objectiveLines = plan.objectives
    .map((o) => {
      const catName = o.category === 'KNOWLEDGE' ? 'Kiến thức' : o.category === 'SKILL' ? 'Năng lực' : 'Phẩm chất';
      return `- ${catName}: ${o.description}`;
    })
    .join('\n');

  const activityLines = plan.activities
    .map((act, idx) => {
      return `HOẠT ĐỘNG ${idx + 1}: ${act.title.toUpperCase()} (${act.durationMinutes} PHÚT)
a) Mục tiêu: Tiếp thu và hoàn thành nội dung trọng tâm hoạt động ${idx + 1}.
b) Nội dung: ${act.teacherRole}
c) Sản phẩm: ${act.expectedProduct}
d) Tổ chức thực hiện:
  - Giáo viên (GV): ${act.teacherRole}
  - Học sinh (HS): ${act.studentRole}
`;
    })
    .join('\n----------------------------------------\n\n');

  const schoolName = (plan.schoolName || 'THPT Chuyên Lê Hồng Phong').toUpperCase();
  const departmentName = (plan.departmentName || 'Tổ Chuyên Môn').toUpperCase();
  const teacherName = plan.teacherName || 'Giáo viên bộ môn';

  return `TRƯỜNG: ${schoolName}
TỔ CHUYÊN MÔN: ${departmentName}
GIÁO VIÊN: ${teacherName}

KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
TÊN BÀI DẠY: ${plan.lessonName.toUpperCase()}
Môn học: ${plan.subject}; Lớp: ${plan.gradeLevel}
Thời gian thực hiện: ${plan.durationPeriod} phút

I. MỤC TIÊU BÀI HỌC
${objectiveLines}

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
1. Đối với Giáo viên:
- Kế hoạch bài dạy, bài giảng điện tử trình chiếu 16:9 HD.
- Phiếu học tập, học liệu số và thiết bị dạy học trực quan.
2. Đối với Học sinh:
- Sách giáo khoa, vở ghi bài, đồ dùng học tập theo yêu cầu.

III. TIẾN TRÌNH DẠY HỌC (CHUẨN 4 BƯỚC SƯ PHẠM)

${activityLines}

IV. HỒ SƠ DẠY HỌC & ĐÁNH GIÁ
- Tiêu chí đánh giá: Đánh giá quá trình thông qua sản phẩm học tập và mức độ tương tác của học sinh.
- Kế hoạch phụ đạo, bồi dưỡng phân hóa đối tượng học sinh sau tiết dạy.
`;
}
