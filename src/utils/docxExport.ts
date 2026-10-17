import { LessonPlanProject } from '@/types/lesson-plan';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateDocxHtmlContent(plan: LessonPlanProject, customContent?: string): string {
  if (customContent && customContent.trim().length > 0) {
    const formattedParagraphs = customContent
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '<p style="margin: 0; line-height: 1.35;">&nbsp;</p>';
        if (trimmed.startsWith('TRƯỜNG') || trimmed.startsWith('KẾ HOẠCH') || trimmed.startsWith('TÊN BÀI')) {
          return `<p style="margin: 4px 0; font-weight: bold; text-align: center; line-height: 1.35;">${escapeHtml(trimmed)}</p>`;
        }
        if (trimmed.startsWith('I.') || trimmed.startsWith('II.') || trimmed.startsWith('III.') || trimmed.startsWith('IV.')) {
          return `<p style="margin: 12px 0 4px 0; font-weight: bold; font-size: 14pt; line-height: 1.35;">${escapeHtml(trimmed)}</p>`;
        }
        if (trimmed.startsWith('HOẠT ĐỘNG')) {
          return `<p style="margin: 8px 0 2px 0; font-weight: bold; color: #1e3a8a; line-height: 1.35;">${escapeHtml(trimmed)}</p>`;
        }
        return `<p style="margin: 2px 0; line-height: 1.35; text-align: justify;">${escapeHtml(trimmed)}</p>`;
      })
      .join('');

    return wrapWordDocument(formattedParagraphs, plan.lessonName);
  }

  const objectivesHtml = plan.objectives
    .map((o) => {
      const cat = o.category === 'KNOWLEDGE' ? 'Kiến thức' : o.category === 'SKILL' ? 'Năng lực' : 'Phẩm chất';
      return `<li style="margin-bottom: 4px;"><strong>${escapeHtml(cat)}:</strong> ${escapeHtml(o.description)}</li>`;
    })
    .join('');

  const activitiesRows = plan.activities
    .map(
      (act, i) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${i + 1}</td>
      <td><strong>${escapeHtml(act.title)}</strong><br/><span style="color: #4b5563;">Thời lượng: ${act.durationMinutes} phút</span></td>
      <td>${escapeHtml(act.teacherRole)}</td>
      <td>${escapeHtml(act.studentRole)}</td>
      <td>${escapeHtml(act.expectedProduct)}</td>
    </tr>`
    )
    .join('');

  const schoolName = (plan.schoolName || 'THPT Chuyên Lê Hồng Phong').toUpperCase();
  const departmentName = (plan.departmentName || 'Tổ Chuyên Môn').toUpperCase();
  const teacherName = plan.teacherName || 'Giáo viên bộ môn';

  const bodyHtml = `
    <table style="width: 100%; border: none; margin-bottom: 15px;">
      <tr>
        <td style="border: none; width: 50%; vertical-align: top;">
          <p style="margin: 0; font-weight: bold;">TRƯỜNG: ${escapeHtml(schoolName)}</p>
          <p style="margin: 0;">TỔ CHUYÊN MÔN: ${escapeHtml(departmentName)}</p>
          <p style="margin: 0;">GIÁO VIÊN: ${escapeHtml(teacherName)}</p>
        </td>
        <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p style="margin: 0; font-style: italic;">Độc lập - Tự do - Hạnh phúc</p>
          <p style="margin: 0;">***</p>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 15px 0;">
      <h2 style="margin: 0; font-size: 16pt; font-weight: bold;">KẾ HOẠCH BÀI DẠY (GIÁO ÁN)</h2>
      <p style="margin: 4px 0; font-size: 14pt; font-weight: bold; color: #1e3a8a;">TÊN BÀI: ${escapeHtml(plan.lessonName.toUpperCase())}</p>
      <p style="margin: 0; font-style: italic;">Môn học: ${escapeHtml(plan.subject)} • Lớp: ${escapeHtml(plan.gradeLevel)} • Thời lượng: ${plan.durationPeriod} phút</p>
    </div>

    <h3 style="font-size: 13pt; font-weight: bold; margin: 12px 0 6px 0;">I. MỤC TIÊU BÀI HỌC (THANG ĐO BLOOM)</h3>
    <ul style="margin: 0 0 10px 20px; padding: 0;">${objectivesHtml}</ul>

    <h3 style="font-size: 13pt; font-weight: bold; margin: 12px 0 6px 0;">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
    <p style="margin: 2px 0;">- <strong>Giáo viên:</strong> Kế hoạch bài dạy, bài giảng điện tử PowerPoint 16:9, thiết bị trình chiếu, phiếu học tập.</p>
    <p style="margin: 2px 0;">- <strong>Học sinh:</strong> Sách giáo khoa, vở ghi chép, đồ dùng học tập theo yêu cầu bộ môn.</p>

    <h3 style="font-size: 13pt; font-weight: bold; margin: 14px 0 6px 0;">III. TIẾN TRÌNH DẠY HỌC (CHUẨN CÔNG VĂN 5512 - 4 BƯỚC)</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12pt;">
      <thead style="background-color: #f3f4f6;">
        <tr>
          <th style="width: 5%;">STT</th>
          <th style="width: 25%;">Hoạt động & Thời lượng</th>
          <th style="width: 25%;">Hoạt động của Giáo viên (GV)</th>
          <th style="width: 25%;">Hoạt động của Học sinh (HS)</th>
          <th style="width: 20%;">Sản phẩm kỳ vọng</th>
        </tr>
      </thead>
      <tbody>${activitiesRows}</tbody>
    </table>
  `;

  return wrapWordDocument(bodyHtml, plan.lessonName);
}

function wrapWordDocument(content: string, title: string): string {
  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>
<![endif]-->
<style>
  @page { size: A4; margin: 2cm 2cm 2cm 2.5cm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.35; color: #000; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
</style>
</head>
<body>
${content}
</body>
</html>`;
}

export function downloadLessonPlanDocx(plan: LessonPlanProject, customContent?: string): void {
  const htmlDoc = generateDocxHtmlContent(plan, customContent);
  const blob = new Blob(['\ufeff' + htmlDoc], {
    type: 'application/msword;charset=utf-8',
  });
  const sanitizedName = plan.lessonName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);

  const fileName = `Giao_An_${sanitizedName || 'Chuan_GDPT'}.doc`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
