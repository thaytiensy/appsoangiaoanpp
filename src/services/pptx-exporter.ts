import PptxGenJS from 'pptxgenjs';
import type { LessonPlanOutput } from '../contracts/app.schema';
import { normalizeNfc } from './text-normalizer';

export async function exportLessonToPptx(plan: LessonPlanOutput): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = normalizeNfc(plan.metadata.teacherName);
  pptx.company = normalizeNfc(plan.metadata.schoolName);
  pptx.title = normalizeNfc(plan.metadata.topic);

  // Slide 1: Trang bìa phong cách nền trắng hiện đại
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: 'FFFFFF' };

  coverSlide.addText(normalizeNfc(plan.metadata.schoolName.toUpperCase()), {
    x: 0.8,
    y: 0.6,
    w: '85%',
    h: 0.4,
    fontSize: 14,
    color: '475569',
    fontFace: 'Arial',
    bold: true,
  });

  coverSlide.addText(normalizeNfc(plan.metadata.topic.toUpperCase()), {
    x: 0.8,
    y: 2.0,
    w: '85%',
    h: 1.8,
    fontSize: 32,
    color: '0F172A',
    fontFace: 'Arial',
    bold: true,
  });

  coverSlide.addText(
    normalizeNfc(`Môn: ${plan.metadata.subject} - Lớp ${plan.metadata.grade} | Bộ sách: ${plan.metadata.textbook}\nGiáo viên: ${plan.metadata.teacherName} | Năm học: ${plan.metadata.schoolYear}`),
    {
      x: 0.8,
      y: 4.5,
      w: '85%',
      h: 1.0,
      fontSize: 14,
      color: '2563EB',
      fontFace: 'Arial',
    }
  );

  // Các slide nội dung (Từ slide 2 trở đi)
  for (let i = 1; i < plan.slides.length; i++) {
    const s = plan.slides[i];
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Header thanh tiêu đề
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.1,
      fill: { color: '2563EB' },
    });

    slide.addText(`SLIDE ${s.slideNumber}: ${normalizeNfc(s.title.toUpperCase())}`, {
      x: 0.8,
      y: 0.25,
      w: '85%',
      h: 0.6,
      fontSize: 20,
      color: 'FFFFFF',
      fontFace: 'Arial',
      bold: true,
    });

    // Nội dung bullet points
    const bulletText = s.bulletPoints.map((point) => ({
      text: normalizeNfc(point),
      options: {
        fontSize: 16,
        color: '1E293B',
        bullet: true,
        breakLine: true,
        fontFace: 'Arial',
      },
    }));

    slide.addText(bulletText, {
      x: 0.8,
      y: 1.6,
      w: s.visualNote ? '60%' : '85%',
      h: 3.5,
    });

    // Khung hình ảnh gợi ý nếu có
    if (s.visualNote) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.5,
        y: 1.6,
        w: 4.0,
        h: 3.5,
        fill: { color: 'FEF3C7' },
        line: { color: 'F59E0B', width: 1.5 },
      });

      slide.addText(normalizeNfc(`[Gợi ý hình ảnh minh họa]:\n\n${s.visualNote}`), {
        x: 8.7,
        y: 1.8,
        w: 3.6,
        h: 3.1,
        fontSize: 12,
        color: '92400E',
        fontFace: 'Arial',
      });
    }

    // Ghi chú thuyết trình của giáo viên (Speaker Notes)
    if (s.speakerNotes) {
      slide.addNotes(normalizeNfc(s.speakerNotes));
    }
  }

  const cleanFileName = `GiaoAn_${plan.metadata.subject}_Lop${plan.metadata.grade}_${plan.metadata.topic.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_')}.pptx`;
  await pptx.writeFile({ fileName: cleanFileName });
}
