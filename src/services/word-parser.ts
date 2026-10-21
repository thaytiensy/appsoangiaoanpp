import JSZip from 'jszip';
import type { LessonInput } from '../contracts/app.schema';

export interface ParsedWordResult {
  readonly topic: string;
  readonly subject: string;
  readonly grade: number;
  readonly textbook: string;
  readonly rawText: string;
  readonly sections: {
    readonly objectives: string;
    readonly materials: string;
    readonly activities: string[];
  };
}

export async function parseDocxFile(fileData: ArrayBuffer): Promise<ParsedWordResult> {
  const zip = await JSZip.loadAsync(fileData);
  const docXml = await zip.file('word/document.xml')?.async('text');

  if (!docXml) {
    throw new Error('File không hợp lệ hoặc không tìm thấy nội dung văn bản trong file docx.');
  }

  const paragraphs: string[] = [];
  const pMatches = docXml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];

  for (const pXml of pMatches) {
    const tMatches = pXml.match(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g) || [];
    const pText = tMatches
      .map((t) => t.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))
      .join('')
      .trim();
    if (pText) {
      paragraphs.push(pText);
    }
  }

  const rawText = paragraphs.join('\n');
  let topic = 'Bài dạy từ file Word';
  let subject = 'Toán học';
  let grade = 6;
  const textbook = 'Kết nối tri thức với cuộc sống';

  // Nhận diện tên bài
  for (const p of paragraphs.slice(0, 15)) {
    const upper = p.toUpperCase();
    if (upper.includes('BÀI:') || upper.includes('BÀI ') || upper.includes('CHỦ ĐỀ:')) {
      topic = p.replace(/^(BÀI\s*\d*[:.-]?|CHỦ ĐỀ[:.-]?)/i, '').trim() || p;
      break;
    }
  }

  // Nhận diện môn học
  const subjectsMap: Record<string, string> = {
    toán: 'Toán học',
    văn: 'Ngữ văn',
    'tiếng anh': 'Tiếng Anh',
    'khoa học tự nhiên': 'Khoa học tự nhiên',
    khtn: 'Khoa học tự nhiên',
    'vật lí': 'Vật lí',
    hóa: 'Hóa học',
    sinh: 'Sinh học',
    'lịch sử': 'Lịch sử và Địa lí',
    'địa lí': 'Lịch sử và Địa lí',
    'tin học': 'Tin học',
  };

  const lowerRaw = rawText.toLowerCase();
  for (const [key, name] of Object.entries(subjectsMap)) {
    if (lowerRaw.includes(key)) {
      subject = name;
      break;
    }
  }

  // Nhận diện khối lớp
  const gradeMatch = rawText.match(/lớp\s*(\d{1,2})/i);
  if (gradeMatch && gradeMatch[1]) {
    const parsedGrade = parseInt(gradeMatch[1], 10);
    if (parsedGrade >= 1 && parsedGrade <= 12) {
      grade = parsedGrade;
    }
  }

  // Nhận diện các phân đoạn
  let currentSection = 'intro';
  let objectives = '';
  let materials = '';
  const activities: string[] = [];
  let currentAct = '';

  for (const p of paragraphs) {
    const upper = p.toUpperCase();
    if (upper.includes('I. MỤC TIÊU') || upper.includes('MỤC TIÊU')) {
      currentSection = 'objectives';
      continue;
    }
    if (upper.includes('II. THIẾT BỊ') || upper.includes('HỌC LIỆU')) {
      currentSection = 'materials';
      continue;
    }
    if (upper.includes('III. TIẾN TRÌNH') || upper.includes('HOẠT ĐỘNG')) {
      currentSection = 'activities';
      continue;
    }

    if (currentSection === 'objectives') {
      objectives += p + '\n';
    } else if (currentSection === 'materials') {
      materials += p + '\n';
    } else if (currentSection === 'activities') {
      if (upper.includes('HOẠT ĐỘNG') || upper.match(/^[1-4]\.\s*HOẠT ĐỘNG/)) {
        if (currentAct.trim()) activities.push(currentAct.trim());
        currentAct = p + '\n';
      } else {
        currentAct += p + '\n';
      }
    }
  }

  if (currentAct.trim()) {
    activities.push(currentAct.trim());
  }

  return {
    topic,
    subject,
    grade,
    textbook,
    rawText,
    sections: {
      objectives: objectives.trim() || 'Học sinh nắm vững kiến thức và kỹ năng cơ bản của bài học.',
      materials: materials.trim() || 'Kế hoạch bài dạy, bài giảng PowerPoint, phiếu học tập, SGK.',
      activities: activities.length > 0 ? activities : [
        'Hoạt động 1: Khởi động tiếp cận bài học',
        'Hoạt động 2: Hình thành kiến thức cốt lõi',
        'Hoạt động 3: Luyện tập bài tập thực hành',
        'Hoạt động 4: Vận dụng thực tế và liên hệ đời sống',
      ],
    },
  };
}

export function convertParsedToLessonInput(parsed: ParsedWordResult): LessonInput {
  return {
    departmentName: 'Phòng Giáo dục và Đào tạo',
    schoolName: 'Trường THCS & THPT Chu Văn An',
    facultyName: `Tổ ${parsed.subject}`,
    teacherName: 'Thầy Đỗ Tiến Sỹ',
    schoolYear: '2026 - 2027',
    prepareDate: new Date().toISOString().split('T')[0],
    teachDate: new Date().toISOString().split('T')[0],
    grade: parsed.grade,
    subject: parsed.subject,
    textbook: parsed.textbook,
    periodNumber: 'Tiết 1',
    durationMinutes: 45,
    topic: parsed.topic,
    additionalNotes: 'Tự động bóc tách từ file giáo án Word và tối ưu hóa theo chuẩn Công văn 5512',
  };
}
