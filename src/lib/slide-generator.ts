import { LessonPlanProject, SlideItem, SlideLayout } from '@/types/lesson-plan';

function generateRandomUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateSlidesFromPlan(plan: LessonPlanProject): SlideItem[] {
  const warmUp = plan.activities.find((a) => a.phase === 'WARM_UP') ?? plan.activities[0];
  const knowledge = plan.activities.find((a) => a.phase === 'KNOWLEDGE') ?? plan.activities[1];
  const practice = plan.activities.find((a) => a.phase === 'PRACTICE') ?? plan.activities[2];
  const application = plan.activities.find((a) => a.phase === 'APPLICATION') ?? plan.activities[3];

  const teacher = plan.teacherName || 'Giáo viên bộ môn';
  const school = plan.schoolName || 'Trường THPT';
  const dept = plan.departmentName || `Tổ ${plan.subject}`;

  const slides: SlideItem[] = [
    {
      id: generateRandomUuid(),
      slideNumber: 1,
      layout: 'TITLE_HERO' as SlideLayout,
      title: plan.lessonName.toUpperCase(),
      bullets: [
        `Môn học: ${plan.subject} - ${plan.gradeLevel} (${plan.durationPeriod} phút)`,
        `Giáo viên giảng dạy: ${teacher}`,
        `Đơn vị công tác: ${school} - ${dept}`,
      ],
      teacherScript: `Nhiệt liệt chào mừng quý thầy cô và các em học sinh đến với bài học ${plan.lessonName}. Thầy/Cô ${teacher} sẽ cùng các em khám phá bài học hôm nay.`,
      visualSuggestion: 'Trang bìa chuyên nghiệp, nổi bật thông tin môn học, giáo viên và đơn vị.',
    },
    {
      id: generateRandomUuid(),
      slideNumber: 2,
      layout: 'INTERACTIVE_QUIZ' as SlideLayout,
      title: `1. Khởi động: ${warmUp.title}`,
      bullets: [
        `Thời lượng: ${warmUp.durationMinutes} phút tương tác`,
        `Thầy/Cô: ${warmUp.teacherRole.slice(0, 100)}`,
        `Học sinh: ${warmUp.studentRole.slice(0, 100)}`,
        `Sản phẩm mong đợi: ${warmUp.expectedProduct.slice(0, 100)}`,
      ],
      teacherScript: `Ở hoạt động khởi động này: ${warmUp.teacherRole}`,
      visualSuggestion: 'Giao diện câu hỏi đố vui hoặc mini game với hình ảnh trực quan thu hút.',
    },
    {
      id: generateRandomUuid(),
      slideNumber: 3,
      layout: 'CONCEPT_BREAKDOWN' as SlideLayout,
      title: `2. Khám phá kiến thức: ${knowledge.title}`,
      bullets: [
        `Thời lượng nghiên cứu: ${knowledge.durationMinutes} phút`,
        `Nhiệm vụ trọng tâm: ${knowledge.studentRole.slice(0, 100)}`,
        `Yêu cầu đầu ra: ${knowledge.expectedProduct.slice(0, 100)}`,
      ],
      teacherScript: `Hướng dẫn học sinh phân tích nội dung cốt lõi: ${knowledge.teacherRole}`,
      visualSuggestion: 'Sơ đồ tư duy dạng thẻ hoặc infographic kiến thức nền tảng.',
    },
    {
      id: generateRandomUuid(),
      slideNumber: 4,
      layout: 'COMPARISON_TABLE' as SlideLayout,
      title: `3. Luyện tập: ${practice.title}`,
      bullets: [
        `Thời gian thực hành: ${practice.durationMinutes} phút`,
        `Hoạt động thầy hướng dẫn: ${practice.teacherRole.slice(0, 100)}`,
        `Học sinh chủ động: ${practice.studentRole.slice(0, 100)}`,
        `Đánh giá sản phẩm: ${practice.expectedProduct.slice(0, 100)}`,
      ],
      teacherScript: `Tổ chức cho học sinh luyện tập, củng cố kỹ năng: ${practice.teacherRole}`,
      visualSuggestion: 'Bảng đối chiếu hoặc hệ thống bài tập rèn luyện kỹ năng phân hóa.',
    },
    {
      id: generateRandomUuid(),
      slideNumber: 5,
      layout: 'SUMMARY_MINDMAP' as SlideLayout,
      title: `4. Vận dụng & Mở rộng: ${application.title}`,
      bullets: [
        `Thời lượng: ${application.durationMinutes} phút`,
        `Thực hiện nhiệm vụ: ${application.studentRole.slice(0, 100)}`,
        `Kết quả cần đạt: ${application.expectedProduct.slice(0, 100)}`,
        'Tổng kết & Giao bài rèn luyện thực tiễn tại nhà',
      ],
      teacherScript: `Tổng kết bài học và hướng dẫn học sinh vận dụng vào đời sống: ${application.teacherRole}`,
      visualSuggestion: 'Sơ đồ tóm tắt toàn diện và thông điệp hành động truyền cảm hứng.',
    },
  ];

  return slides;
}
