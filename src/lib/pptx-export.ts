import pptxgen from 'pptxgenjs';
import { LessonPlanProject } from '@/types/lesson-plan';
import { getThemeById } from './slide-themes';
import { sanitizePptxText, sanitizePptxList } from '@/utils/sanitizePptxText';

export async function exportLessonToPptx(project: LessonPlanProject): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const theme = getThemeById(project.themeId);
  const teacher = project.teacherName || 'Thầy Đỗ Tiến Sỹ';
  const school = project.schoolName || 'THPT Chuyên Lê Hồng Phong';

  const hasCustomBg = !!project.customBackgroundUrl && project.customBackgroundUrl.startsWith('data:image');

  // Slide mở đầu (Hero Title)
  const introSlide = pptx.addSlide();
  if (hasCustomBg) {
    introSlide.background = { data: project.customBackgroundUrl };
  } else {
    introSlide.background = { color: theme.bgHeroHex };
  }

  const cleanLessonName = sanitizePptxText(project.lessonName) || 'Bài Học';

  introSlide.addText(cleanLessonName.toUpperCase(), {
    x: 1.0, y: 1.8, w: '80%', h: 1.5,
    fontSize: 34, bold: true, color: theme.textHeroHex, align: 'left'
  });
  introSlide.addText(`Môn học: ${project.subject} | Khối: ${project.gradeLevel} | Thời lượng: ${project.durationPeriod} phút`, {
    x: 1.0, y: 3.4, w: '80%', h: 0.6,
    fontSize: 18, color: theme.accentHex, align: 'left'
  });
  introSlide.addText(`Giáo viên: ${teacher} | Đơn vị: ${school}`, {
    x: 1.0, y: 4.1, w: '80%', h: 0.5,
    fontSize: 15, color: '94A3B8', align: 'left'
  });

  // Từng slide hoạt động - đồng nhất nền và phong cách chữ
  project.slides.forEach((item) => {
    const slide = pptx.addSlide();
    if (hasCustomBg) {
      slide.background = { data: project.customBackgroundUrl };
    } else {
      slide.background = { color: theme.bgSlideHex };
    }

    const cleanTitle = sanitizePptxText(item.title) || `Slide ${item.slideNumber}`;
    const cleanBullets = sanitizePptxList(item.bullets);
    const finalBullets = cleanBullets.length > 0 ? cleanBullets : ['Nội dung trọng tâm bài giảng'];

    // Header slide
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 0.6, w: 0.15, h: 0.6, fill: { color: theme.accentHex }
    });
    slide.addText(cleanTitle, {
      x: 1.1, y: 0.6, w: '85%', h: 0.6,
      fontSize: 22, bold: true, color: theme.textHeroHex
    });

    // Bullets nội dung
    const bulletText = finalBullets.map((b: string) => ({
      text: b,
      options: { fontSize: 16, color: theme.textSlideHex, breakLine: true, bullet: true }
    }));
    slide.addText(bulletText, {
      x: 1.0, y: 1.5, w: '80%', h: 4.2, lineSpacing: 26
    });

    // Speaker Notes
    if (item.teacherScript) {
      slide.addNotes(`[Lời giảng gợi ý]: ${sanitizePptxText(item.teacherScript)}`);
    }
  });

  await pptx.writeFile({ fileName: `${project.lessonName.replace(/\s+/g, '_')}_GiaoAn.pptx` });
}
