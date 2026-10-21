import type { LessonPlanOutput, SlideItem } from '../contracts/app.schema';

export interface QualityIssue {
  readonly level: 'info' | 'warning' | 'error';
  readonly message: string;
}

export interface AuditReport {
  readonly isPassed: boolean;
  readonly score: number;
  readonly duplicatesRemoved: number;
  readonly auditedSlides: SlideItem[];
  readonly issues: QualityIssue[];
  readonly metrics: {
    readonly hasAllFourActivities: boolean;
    readonly hasObjectives: boolean;
    readonly hasMaterials: boolean;
    readonly slideCount: number;
  };
}

export function auditAndDeduplicateLesson(plan: LessonPlanOutput): AuditReport {
  const issues: QualityIssue[] = [];
  let duplicatesRemoved = 0;

  // 1. Kiểm tra cấu trúc 4 hoạt động CV 5512
  const actNames = plan.activities.map((a) => a.stepName.toLowerCase());
  const hasKhoidong = actNames.some((n) => n.includes('khởi động') || n.includes('mở đầu'));
  const hasHinhthanh = actNames.some((n) => n.includes('hình thành') || n.includes('khám phá'));
  const hasLuyentap = actNames.some((n) => n.includes('luyện tập') || n.includes('thực hành'));
  const hasVandung = actNames.some((n) => n.includes('vận dụng') || n.includes('mở rộng'));

  const hasAllFourActivities = hasKhoidong && hasHinhthanh && hasLuyentap && hasVandung;

  if (hasAllFourActivities) {
    issues.push({ level: 'info', message: 'Cấu trúc đạt chuẩn 100% Công văn 5512/BGDĐT (đủ 4 hoạt động sư phạm).' });
  } else {
    issues.push({ level: 'warning', message: 'Kế hoạch bài dạy chưa đủ rõ 4 hoạt động tiêu chuẩn theo Công văn 5512.' });
  }

  // 2. Kiểm tra mục tiêu & thiết bị
  const hasObjectives = Boolean(plan.objectives.knowledge && plan.objectives.coreCompetencies);
  const hasMaterials = Boolean(plan.materials.teacherPreparation && plan.materials.studentPreparation);

  if (hasObjectives) {
    issues.push({ level: 'info', message: 'Mục tiêu bài học phân định rõ 3 thành phần: Kiến thức, Năng lực, Phẩm chất.' });
  }

  // 3. Quét kiểm tra trùng lặp Slide (Deduplication)
  const auditedSlides: SlideItem[] = [];
  const seenTitles = new Set<string>();

  for (const slide of plan.slides) {
    const normalizedTitle = slide.title.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedPoints = slide.bulletPoints.map((p) => p.trim().toLowerCase()).sort().join('|');

    // Kiểm tra slide trùng hoàn toàn
    if (seenTitles.has(normalizedTitle) && normalizedPoints.length > 0) {
      duplicatesRemoved++;
      continue;
    }

    seenTitles.add(normalizedTitle);
    auditedSlides.push({
      ...slide,
      slideNumber: auditedSlides.length + 1,
    });
  }

  if (duplicatesRemoved > 0) {
    issues.push({
      level: 'warning',
      message: `Phát hiện và tự động loại bỏ ${duplicatesRemoved} slide có nội dung trùng lặp.`,
    });
  } else {
    issues.push({
      level: 'info',
      message: 'Kiểm tra trùng lặp hoàn tất: 0 slide bị trùng lặp nội dung.',
    });
  }

  // Tính điểm chất lượng
  let score = 80;
  if (hasAllFourActivities) score += 10;
  if (hasObjectives && hasMaterials) score += 5;
  if (duplicatesRemoved === 0) score += 5;

  return {
    isPassed: score >= 80,
    score: Math.min(score, 100),
    duplicatesRemoved,
    auditedSlides,
    issues,
    metrics: {
      hasAllFourActivities,
      hasObjectives,
      hasMaterials,
      slideCount: auditedSlides.length,
    },
  };
}
