import { LessonPlanProject, LessonObjective, PedagogicalActivity } from '@/types/lesson-plan';
import { generateSlidesFromPlan } from './slide-generator';

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function generatePedagogicalLessonPlan(
  lessonName: string,
  subject: string,
  gradeLevel: string,
  durationPeriod: number = 45,
  focusGoal?: string
): LessonPlanProject {
  const cleanName = lessonName.trim() || 'Bài Học Trọng Tâm Mới';
  const cleanSubject = subject.trim() || 'Tin học & Công nghệ';
  const cleanGrade = gradeLevel.trim() || 'Lớp 10';

  const objectives: LessonObjective[] = [
    {
      id: makeId('obj-k'),
      category: 'KNOWLEDGE',
      description: `Trình bày và phân tích được các khái niệm nền tảng cùng quy luật cốt lõi của chủ đề "${cleanName}".`,
      bloomLevel: 'UNDERSTAND',
    },
    {
      id: makeId('obj-s'),
      category: 'SKILL',
      description: `Vận dụng quy trình chuẩn để giải quyết các bài toán, tình huống thực tế liên quan đến "${cleanName}".`,
      bloomLevel: 'APPLY',
    },
    {
      id: makeId('obj-a'),
      category: 'ATTITUDE',
      description: `Hình thành thái độ chủ động nghiên cứu, tư duy phản biện và tinh thần hợp tác tích cực trong học tập.`,
      bloomLevel: 'EVALUATE',
    },
  ];

  const activities: PedagogicalActivity[] = [
    {
      id: makeId('act-warm'),
      phase: 'WARM_UP',
      title: `Khởi động: Kích hoạt tư duy về "${cleanName}"`,
      durationMinutes: Math.round(durationPeriod * 0.15),
      teacherRole: `Giáo viên trình chiếu tình huống có vấn đề hoặc video clip ngắn liên quan đến "${cleanName}", đặt câu hỏi dẫn dắt kích thích tò mò.`,
      studentRole: `Học sinh quan sát, suy nghĩ độc lập trong 2 phút, thảo luận nhanh với bạn cùng bàn và giơ tay chia sẻ phán đoán ban đầu.`,
      expectedProduct: `Câu trả lời dự đoán của học sinh ghi nhận trên bảng phụ và tâm thế sẵn sàng tiếp cận bài học mới.`,
    },
    {
      id: makeId('act-know'),
      phase: 'KNOWLEDGE',
      title: `Hình thành kiến thức: Khám phá trọng tâm "${cleanName}"`,
      durationMinutes: Math.round(durationPeriod * 0.45),
      teacherRole: `Giáo viên giao phiếu học tập số 1, tổ chức hoạt động nghiên cứu tài liệu/mẫu vật, gợi mở để học sinh tự rút ra kiến thức cốt lõi.`,
      studentRole: `Học sinh làm việc theo nhóm 4, đọc tài liệu, đối chiếu dữ liệu, hoàn thiện phiếu học tập và cử đại diện báo cáo kết quả.`,
      expectedProduct: `Phiếu học tập nhóm đã điền đầy đủ các định nghĩa, quy tắc và sơ đồ tư duy tóm lược kiến thức mới.`,
    },
    {
      id: makeId('act-prac'),
      phase: 'PRACTICE',
      title: `Luyện tập: Rèn luyện kỹ năng qua bài tập thực tế`,
      durationMinutes: Math.round(durationPeriod * 0.25),
      teacherRole: `Giáo viên giao hệ thống câu hỏi phân hóa từ nhận biết đến vận dụng, quan sát hỗ trợ các nhóm gặp khó khăn và chấm chữa mẫu.`,
      studentRole: `Học sinh chủ động hoàn thành bài tập cá nhân vào vở, đổi chéo chấm chữa theo barem đáp án do giáo viên cung cấp.`,
      expectedProduct: `Vở bài tập cá nhân có kết quả giải chi tiết và nhận xét đánh giá chéo giữa các bạn học sinh.`,
    },
    {
      id: makeId('act-app'),
      phase: 'APPLICATION',
      title: `Vận dụng & Mở rộng: Đưa tri thức vào đời sống`,
      durationMinutes: Math.max(5, durationPeriod - Math.round(durationPeriod * 0.85)),
      teacherRole: `Giáo viên nêu yêu cầu nhiệm vụ dự án mini/bài tập mở rộng về nhà, hướng dẫn các nguồn tài liệu mở để tự học thêm.`,
      studentRole: `Học sinh ghi chép nhiệm vụ sáng tạo, thảo luận ý tưởng triển khai và cam kết thời gian hoàn thành sản phẩm.`,
      expectedProduct: `Bản kế hoạch ý tưởng dự án hoặc sơ đồ ứng dụng thực tiễn nộp lại cho giáo viên vào tiết học sau.`,
    },
  ];

  const project: LessonPlanProject = {
    id: makeId('plan'),
    subject: cleanSubject,
    gradeLevel: cleanGrade,
    lessonName: cleanName,
    durationPeriod,
    objectives,
    activities: activities as [PedagogicalActivity, PedagogicalActivity, PedagogicalActivity, PedagogicalActivity],
    slides: [],
    updatedAt: new Date().toISOString(),
  };

  project.slides = generateSlidesFromPlan(project);
  return project;
}
