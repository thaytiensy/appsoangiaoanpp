import pptxgen from 'pptxgenjs';
import { LessonPlanProject } from '@/types/lesson-plan';

export async function exportLessonToPptx(project: LessonPlanProject): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Slide mở đầu (Hero Title)
  const introSlide = pptx.addSlide();
  introSlide.background = { color: '0F172A' }; // Slate 900
  introSlide.addText(project.lessonName.toUpperCase(), {
    x: 1.0, y: 2.2, w: '80%', h: 1.5,
    fontSize: 36, bold: true, color: 'F8FAFC', align: 'left'
  });
  introSlide.addText(`Môn học: ${project.subject} | Khối: ${project.gradeLevel} | Thời lượng: ${project.durationPeriod}p`, {
    x: 1.0, y: 3.8, w: '80%', h: 0.8,
    fontSize: 18, color: '38BDF8', align: 'left'
  });

  // Từng slide hoạt động
  project.slides.forEach((item) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'F8FAFC' };

    // Header slide
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 0.6, w: 0.15, h: 0.6, fill: { color: '0284C7' }
    });
    slide.addText(item.title, {
      x: 1.1, y: 0.6, w: '85%', h: 0.6,
      fontSize: 24, bold: true, color: '0F172A'
    });

    // Bullets nội dung
    const bulletText = item.bullets.map((b: string) => ({
      text: b,
      options: { fontSize: 16, color: '334155', breakLine: true, bullet: true }
    }));
    slide.addText(bulletText, {
      x: 1.0, y: 1.6, w: '80%', h: 4.0, lineSpacing: 28
    });

    // Ghi chú của giáo viên (Speaker Notes)
    if (item.teacherScript) {
      slide.addNotes(`[Lời giảng gợi ý]: ${item.teacherScript}`);
    }
  });

  await pptx.writeFile({ fileName: `${project.lessonName.replace(/\s+/g, '_')}_GiaoAn.pptx` });
}
