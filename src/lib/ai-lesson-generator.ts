import { LessonPlanProject, LessonObjective, PedagogicalActivity } from '@/types/lesson-plan';
import { generateSlidesFromPlan } from './slide-generator';
import { sanitizePptxText } from '@/utils/sanitizePptxText';

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export interface LessonGeneratorParams {
  topic: string;
  subject: string;
  grade: string;
  teacherName?: string;
  schoolName?: string;
  departmentName?: string;
  themeId?: string;
  customBackgroundUrl?: string;
  duration?: number;
}

export function generatePedagogicalLessonPlan(
  paramsOrTopic: LessonGeneratorParams | string,
  subjectStr?: string,
  gradeStr?: string,
  durationNum?: number
): LessonPlanProject {
  const params: LessonGeneratorParams =
    typeof paramsOrTopic === 'string'
      ? {
          topic: paramsOrTopic,
          subject: subjectStr || 'Toán học',
          grade: gradeStr || 'Lớp 10',
          duration: durationNum || 45,
        }
      : paramsOrTopic;

  const cleanName = sanitizePptxText(params.topic) || 'Bài Học Trọng Tâm Mới';
  const cleanSubject = sanitizePptxText(params.subject) || 'Toán học';
  const cleanGrade = sanitizePptxText(params.grade) || 'Lớp 10';
  const durationPeriod = params.duration || 45;

  const objectives: LessonObjective[] = [
    {
      id: makeId('obj-k'),
      category: 'KNOWLEDGE',
      description: `Trình bày và phân tích được các khái niệm nền tảng cùng quy luật cốt lõi của bài học "${cleanName}".`,
      bloomLevel: 'UNDERSTAND',
    },
    {
      id: makeId('obj-s'),
      category: 'SKILL',
      description: `Vận dụng kiến thức bài học để giải quyết các bài tập, tình huống thực tế và rèn luyện kỹ năng của môn ${cleanSubject}.`,
      bloomLevel: 'APPLY',
    },
    {
      id: makeId('obj-a'),
      category: 'ATTITUDE',
      description: `Phát triển phẩm chất chăm chỉ, trách nhiệm, tư duy phản biện khoa học và tinh thần hợp tác tích cực.`,
      bloomLevel: 'EVALUATE',
    },
  ];

  const activities: PedagogicalActivity[] = [
    {
      id: makeId('act-warm'),
      phase: 'WARM_UP',
      title: `Khởi động: Kích hoạt tư duy về "${cleanName}"`,
      durationMinutes: Math.round(durationPeriod * 0.15),
      teacherRole: `Giáo viên trình chiếu câu hỏi gợi mở hoặc tình huống thực tế về "${cleanName}", dẫn dắt học sinh vào bài học.`,
      studentRole: `Học sinh quan sát, suy nghĩ độc lập, thảo luận nhanh với bạn cùng bàn và giơ tay phát biểu ý kiến ban đầu.`,
      expectedProduct: `Tâm thế hào hứng và các ý tưởng phán đoán ban đầu của học sinh ghi nhận trên bảng phụ.`,
    },
    {
      id: makeId('act-know'),
      phase: 'KNOWLEDGE',
      title: `Hình thành kiến thức: Khám phá cốt lõi "${cleanName}"`,
      durationMinutes: Math.round(durationPeriod * 0.45),
      teacherRole: `Giáo viên chia nhóm, phát phiếu học tập số 1, dẫn dắt học sinh khám phá kiến thức mới qua các câu hỏi gợi mở.`,
      studentRole: `Học sinh làm việc nhóm 4, đọc tài liệu, ghi chép vào phiếu học tập và cử đại diện trình bày kết quả.`,
      expectedProduct: `Phiếu học tập nhóm đã hoàn thành với đầy đủ định nghĩa, công thức và sơ đồ tư duy trọng tâm.`,
    },
    {
      id: makeId('act-prac'),
      phase: 'PRACTICE',
      title: `Luyện tập: Rèn luyện kỹ năng giải quyết bài tập`,
      durationMinutes: Math.round(durationPeriod * 0.25),
      teacherRole: `Giáo viên giao hệ thống bài tập phân hóa theo mức độ, quan sát hướng dẫn các nhóm và chốt đáp án chuẩn.`,
      studentRole: `Học sinh thực hiện bài tập cá nhân, đổi chéo vở để chấm điểm và nhận xét lẫn nhau theo barem đáp án.`,
      expectedProduct: `Vở ghi bài tập của học sinh có lời giải chi tiết và điểm đánh giá nhận xét chéo.`,
    },
    {
      id: makeId('act-app'),
      phase: 'APPLICATION',
      title: `Vận dụng & Mở rộng: Liên hệ thực tiễn đời sống`,
      durationMinutes: Math.max(5, durationPeriod - Math.round(durationPeriod * 0.85)),
      teacherRole: `Giáo viên giao nhiệm vụ sáng tạo/dự án nhỏ liên hệ thực tiễn về nhà, định hướng tiêu chí đánh giá sản phẩm.`,
      studentRole: `Học sinh tiếp nhận nhiệm vụ, thảo luận ý tưởng triển khai và cam kết thời hạn nộp sản phẩm.`,
      expectedProduct: `Bản kế hoạch ý tưởng hoặc sản phẩm học tập sáng tạo nộp lại vào tiết học tiếp theo.`,
    },
  ];

  const project: LessonPlanProject = {
    id: makeId('plan'),
    subject: cleanSubject,
    gradeLevel: cleanGrade,
    lessonName: cleanName,
    durationPeriod,
    teacherName: params.teacherName || 'Thầy Đỗ Tiến Sỹ',
    schoolName: params.schoolName || 'THPT Chuyên Lê Hồng Phong',
    departmentName: params.departmentName || `Tổ ${cleanSubject}`,
    themeId: params.themeId || 'TECH_DARK',
    customBackgroundUrl: params.customBackgroundUrl,
    objectives,
    activities: activities as [PedagogicalActivity, PedagogicalActivity, PedagogicalActivity, PedagogicalActivity],
    slides: [],
    updatedAt: new Date().toISOString(),
  };

  project.slides = generateSlidesFromPlan(project);
  return project;
}
