import JSZip from 'jszip';
import { SlideItem, SlideLayout } from '@/types/lesson-plan';
import { sanitizePptxText, sanitizePptxList, isXmlGarbage } from '@/utils/sanitizePptxText';

export interface ParsedTemplateResult {
  templateName: string;
  backgroundUrl?: string;
  slides: SlideItem[];
  lessonTitle?: string;
}

function cleanXmlText(xml: string): string[] {
  const paragraphs: string[] = [];
  // Gỡ bỏ các khối thuộc tính style/run properties trước để regex không ăn nhầm thẻ
  const sanitizedXml = xml
    .replace(/<a:pPr[\s\S]*?<\/a:pPr>/gi, '')
    .replace(/<a:rPr[\s\S]*?<\/a:rPr>/gi, '')
    .replace(/<a:endParaRPr[\s\S]*?<\/a:endParaRPr>/gi, '');

  const pRegex = /<a:p[\s>][\s\S]*?<\/a:p>/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pRegex.exec(sanitizedXml)) !== null) {
    const pContent = pMatch[0];
    // Loại bỏ các thẻ tự đóng rác <a:t/> hoặc các thẻ shape
    const contentWithoutSelfClosing = pContent.replace(/<a:[a-zA-Z0-9_\-]+[^>]*\/>/gi, '');
    // Khớp thẻ <a:t>, KHÔNG cho phép chứa ký tự '<' để tránh ăn xuyên qua các thẻ khác
    const tRegex = /<a:t(?:\s+[^>]*)?>([^<]*)<\/a:t>/gi;
    let tMatch: RegExpExecArray | null;
    let fullText = '';
    while ((tMatch = tRegex.exec(contentWithoutSelfClosing)) !== null) {
      fullText += tMatch[1];
    }
    const clean = sanitizePptxText(fullText);
    if (clean && clean.length > 0 && !isXmlGarbage(clean)) {
      paragraphs.push(clean);
    }
  }
  return paragraphs;
}

function determineLayout(index: number, title: string): SlideLayout {
  if (index === 0) return 'TITLE_HERO';
  const lower = title.toLowerCase();
  if (lower.includes('câu hỏi') || lower.includes('trắc nghiệm') || lower.includes('quiz')) {
    return 'INTERACTIVE_QUIZ';
  }
  if (lower.includes('tổng kết') || lower.includes('ghi nhớ') || lower.includes('mindmap')) {
    return 'SUMMARY_MINDMAP';
  }
  if (lower.includes('so sánh') || lower.includes('phân biệt')) {
    return 'COMPARISON_TABLE';
  }
  return 'CONCEPT_BREAKDOWN';
}

export async function parseUploadedTemplate(file: File): Promise<ParsedTemplateResult> {
  const fileName = file.name;
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileName);
  const isPptx = /\.(pptx|potx)$/i.test(fileName);

  if (isImage) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bg = (e.target?.result as string) || undefined;
        resolve({ templateName: fileName, backgroundUrl: bg, slides: [] });
      };
      reader.readAsDataURL(file);
    });
  }

  if (isPptx) {
    try {
      const zip = await JSZip.loadAsync(file);
      let backgroundUrl: string | undefined = undefined;

      // 1. Trích xuất ảnh nền chất lượng cao nhất (kích thước lớn nhất trong ppt/media/)
      const mediaFiles = Object.keys(zip.files).filter((path) =>
        path.startsWith('ppt/media/') && /\.(png|jpe?g)$/i.test(path)
      );

      if (mediaFiles.length > 0) {
        let bestFile = zip.files[mediaFiles[0]];
        let maxBytes = 0;
        for (const mf of mediaFiles) {
          const entry = zip.files[mf];
          const bytes = await entry.async('uint8array');
          if (bytes.length > maxBytes) {
            maxBytes = bytes.length;
            bestFile = entry;
          }
        }
        const base64Data = await bestFile.async('base64');
        const mime = bestFile.name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        backgroundUrl = `data:${mime};base64,${base64Data}`;
      }

      // 2. Trích xuất danh sách slide thực tế từ file .pptx
      const slidePaths = Object.keys(zip.files)
        .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)![0], 10);
          const numB = parseInt(b.match(/\d+/)![0], 10);
          return numA - numB;
        });

      const extractedSlides: SlideItem[] = [];
      let mainTitle = '';

      for (let i = 0; i < slidePaths.length; i++) {
        const xmlText = await zip.files[slidePaths[i]].async('text');
        const paras = cleanXmlText(xmlText);
        if (paras.length === 0) continue;

        const rawTitle = paras[0] || 'Slide bài giảng';
        const title = sanitizePptxText(rawTitle.slice(0, 100)) || `Slide ${i + 1}`;
        if (i === 0 && !mainTitle) mainTitle = title;

        const rawBullets = paras.slice(1);
        const bullets = sanitizePptxList(rawBullets).slice(0, 5).map((p) => p.slice(0, 150));
        if (bullets.length === 0) {
          bullets.push(i === 0 ? 'Nội dung bài giảng PowerPoint tích hợp' : 'Nội dung trọng tâm (bấm để chỉnh sửa)');
        }

        extractedSlides.push({
          id: `pptx-slide-${i + 1}-${Date.now()}`,
          slideNumber: extractedSlides.length + 1,
          layout: determineLayout(i, title),
          title,
          bullets,
          teacherScript: `Giáo viên giảng dạy theo tiến trình slide ${i + 1} từ tệp trình chiếu đã tải lên.`,
          visualSuggestion: 'Bố cục đồng bộ từ tệp PowerPoint của giáo viên.',
        });
      }

      return {
        templateName: fileName,
        backgroundUrl,
        slides: extractedSlides,
        lessonTitle: mainTitle || undefined,
      };
    } catch (err) {
      console.warn('Could not parse pptx contents fully:', err);
      return { templateName: fileName, slides: [] };
    }
  }

  return { templateName: fileName, slides: [] };
}
