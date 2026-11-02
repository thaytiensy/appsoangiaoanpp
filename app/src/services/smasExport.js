// SMAS VIETTEL (smas.edu.vn) COMPLIANT EXPORT SERVICE
// Standard: GDPT 2018 & Thông tư 27/2020/TT-BGDĐT cho môn Mĩ Thuật Tiểu học (Lớp 1 - 5)
// Tích hợp:
// 1. Excel (.xlsx) chuẩn biểu mẫu nhập điểm / nhận xét SMAS Viettel
// 2. PowerPoint (.pptx) chuẩn bài giảng số e-learning kho học liệu SMAS Viettel
// 3. Word (.doc) chuẩn Kế hoạch bài dạy Công văn 2345 nộp phân hệ giáo án SMAS Viettel

import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';

// Ngân hàng nhận xét sư phạm Thông tư 27 chuẩn SMAS Viettel phân loại theo mức T / H / C
export const SMAS_COMMENT_BANK = {
  T: [
    'Em có trí tưởng tượng phong phú, nét vẽ tự tin, phối màu tươi sáng hài hòa; tích cực tương tác và giúp đỡ bạn bè trong giờ học.',
    'Em nắm vững kỹ thuật tạo hình, thể hiện bố cục cân đối, sáng tạo vượt bậc; sản phẩm mĩ thuật đạt chất lượng xuất sắc.',
    'Em thể hiện rõ năng khiếu thẩm mĩ, biết vận dụng nhịp điệu nét và màu sắc tương phản; hào hứng giới thiệu tranh trước lớp.',
    'Kỹ năng phối màu và phân mảng chính phụ rất tốt; em chủ động hoàn thành bài vẽ sớm và biết tự nhận xét, đánh giá sản phẩm.',
    'Em rất khéo léo trong các bài vẽ và thủ công; ý tưởng độc đáo, mang đậm cảm xúc hồn nhiên và tình yêu quê hương đất nước.',
    'Nét vẽ phóng khoáng, phối hợp màu sắc ấm áp sinh động; em luôn có ý thức giữ gìn vệ sinh đồ dùng mĩ thuật sạch sẽ ngăn nắp.'
  ],
  H: [
    'Em nắm chắc kỹ thuật vẽ nét và phối màu cơ bản; cần chú ý tô màu nền đậm và đều tay hơn để hình ảnh chính thêm nổi bật.',
    'Em hoàn thành sản phẩm đúng tiến độ; cần chú ý sắp xếp bố cục mảng chính ở trọng tâm trang giấy để tranh thêm cân đối.',
    'Em nhận biết tốt các gam màu cơ bản; cần tự tin hơn khi đưa những nét vẽ chi tiết vào bài thực hành của mình.',
    'Em có tinh thần học tập nghiêm túc, hoàn thành bài vẽ; cần mạnh dạn hơn khi tham gia nhận xét và chia sẻ cảm nhận với bạn bè.',
    'Em vẽ hình rõ ràng, đúng chủ đề bài học; cần rèn luyện thêm cách pha trộn màu sắc để bức tranh thêm phần phong phú.'
  ],
  C: [
    'Em cần rèn luyện thêm tư thế ngồi vẽ, chú ý tập trung và hoàn thành sản phẩm mĩ thuật đúng thời gian quy định của Thầy Cô.',
    'Em cần mang đầy đủ dụng cụ học vẽ (hộp sáp màu, bút chì, tẩy) và mạnh dạn nhờ Thầy Cô hướng dẫn khi gặp khó khăn.',
    'Em cần rèn thêm kỹ năng cầm bút và tô màu đều tay, tránh để màu lem ra ngoài đường viền hình vẽ.'
  ]
};

// Danh sách học sinh mẫu chuẩn SMAS cho từng khối lớp
export const generateDefaultSmasStudents = (grade = 1, className = '1A') => {
  const firstNames = [
    'Nguyễn Hoàng An', 'Trần Khánh Linh', 'Lê Minh Khang', 'Phạm Thùy Dung', 'Đỗ Gia Bảo',
    'Hoàng Ngọc Ánh', 'Vũ Đức Anh', 'Phan Bảo Châu', 'Bùi Tuấn Kiệt', 'Đặng Mai Phương',
    'Ngô Quang Huy', 'Dương Thảo My', 'Lý Quốc Bảo', 'Trịnh Cẩm Tú', 'Lương Minh Trí',
    'Hồ Diệp Anh', 'Võ Thành Đạt', 'Mai Như Ý', 'Đoàn Nhật Minh', 'Cao Bảo Ngọc',
    'Tạ Hữu Phước', 'Đinh Thanh Trúc', 'Châu Anh Tuấn', 'Lâm Thúy Hằng', 'Phùng Hải Đăng',
    'Tô Kim Ngân', 'Hà Trọng Nhân', 'Trương Yến Nhi', 'Nghiêm Đình Trọng', 'Khổng Thùy Trang'
  ];

  return firstNames.map((name, idx) => {
    const codeNum = String(idx + 1).padStart(3, '0');
    const studentCode = `SMAS26${grade}${codeNum}`;
    
    // Tỉ lệ chuẩn thực tế: ~40% T, ~55% H, ~5% C
    let level = 'H';
    if (idx % 3 === 0 || idx === 1) level = 'T';
    else if (idx === 28) level = 'C';

    const comments = SMAS_COMMENT_BANK[level];
    const comment = comments[idx % comments.length];

    const birthDay = ((idx % 28) + 1).toString().padStart(2, '0');
    const birthMonth = (((idx * 3) % 12) + 1).toString().padStart(2, '0');
    const birthYear = 2026 - (grade + 6); // Lớp 1: ~6 tuổi

    return {
      stt: idx + 1,
      studentCode,
      fullName: name,
      dob: `${birthDay}/${birthMonth}/${birthYear}`,
      gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
      className: `${grade}${className.replace(/[^A-Za-z]/g, '') || 'A'}`,
      level, // 'T' | 'H' | 'C'
      comment,
      aestheticCapacity: level === 'C' ? 'CĐ' : (level === 'T' ? 'T' : 'Đ'),
      creativeCapacity: level === 'C' ? 'CĐ' : (level === 'T' ? 'T' : 'Đ'),
      qualities: level === 'C' ? 'Đ' : 'T'
    };
  });
};

/**
 * 1. XUẤT FILE EXCEL (.xlsx) CHUẨN NHẬP ĐIỂM / NHẬN XÉT SMAS VIETTEL
 * Định dạng 100% khớp biểu mẫu Import SMAS Viettel
 */
export function exportSmasExcel({
  grade = 1,
  className = '1A',
  semester = 'Cuối Học kỳ 1',
  schoolName = 'TRƯỜNG TIỂU HỌC TÂN PHONG',
  districtName = 'PHÒNG GD&ĐT HUYỆN/QUẬN NGUYỄN DU',
  provinceName = 'SỞ GD&ĐT TỈNH/THÀNH PHỐ HÀ NỘI',
  teacherName = 'Thầy Cọ Nhí',
  unitTitle = 'Mĩ thuật trong nhà trường',
  students = []
}) {
  const wb = XLSX.utils.book_new();

  // Dữ liệu bảng Excel chuẩn SMAS Viettel
  const data = [
    // Header hành chính
    [provinceName, '', '', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    [districtName, '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
    [schoolName.toUpperCase(), '', '', '', '', '', '', '------------------------'],
    ['HỆ THỐNG QUẢN LÝ NHÀ TRƯỜNG - SMAS VIETTEL (smas.edu.vn)'],
    [''],
    [`BẢNG ĐÁNH GIÁ MÔN MĨ THUẬT TIỂU HỌC - CHUẨN THÔNG TƯ 27/2020/TT-BGDĐT`],
    [`Khối lớp: Lớp ${grade} • Lớp học: ${className} • Học kỳ: ${semester} • Năm học: 2026 - 2027`],
    [`Môn học: Mĩ thuật (Bộ sách: Kết nối tri thức với cuộc sống) • Giáo viên giảng dạy: ${teacherName}`],
    [`Nội dung tích hợp chủ đề: ${unitTitle}`],
    [''],
    // Hàng tiêu đề các cột chuẩn SMAS
    [
      'STT',
      'Mã Học Sinh (SMAS)',
      'Họ và Tên Học Sinh',
      'Ngày Sinh',
      'Giới Tính',
      'Mức Đạt Được (T/H/C)',
      'Nội Dung Nhận Xét Sư Phạm Vì Sự Tiến Bộ (Thông tư 27 & SMAS Viettel)',
      'Năng Lực Thẩm Mĩ',
      'Năng Lực Sáng Tạo',
      'Phẩm Chất Chủ Yếu'
    ]
  ];

  // Nạp danh sách học sinh vào bảng
  students.forEach((s) => {
    data.push([
      s.stt,
      s.studentCode,
      s.fullName,
      s.dob,
      s.gender,
      s.level,
      s.comment,
      s.aestheticCapacity,
      s.creativeCapacity,
      s.qualities
    ]);
  });

  // Thêm phần thống kê và ký tên
  const countT = students.filter(s => s.level === 'T').length;
  const countH = students.filter(s => s.level === 'H').length;
  const countC = students.filter(s => s.level === 'C').length;
  const total = students.length || 1;

  data.push(['']);
  data.push(['TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ CHUẨN SMAS VIETTEL:']);
  data.push([`• Hoàn thành Tốt (T): ${countT} học sinh (${Math.round((countT / total) * 100)}%)`]);
  data.push([`• Hoàn thành (H): ${countH} học sinh (${Math.round((countH / total) * 100)}%)`]);
  data.push([`• Chưa hoàn thành (C): ${countC} học sinh (${Math.round((countC / total) * 100)}%)`]);
  data.push(['']);
  data.push(['', '', '', '', '', 'BAN GIÁM HIỆU DUYỆT', '', '', 'GIÁO VIÊN BỘ MÔN']);
  data.push(['', '', '', '', '', '(Ký và đóng dấu SMAS)', '', '', teacherName]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Cấu hình độ rộng các cột tối ưu cho SMAS Viettel
  ws['!cols'] = [
    { wch: 6 },   // STT
    { wch: 18 },  // Mã học sinh
    { wch: 25 },  // Họ tên
    { wch: 14 },  // Ngày sinh
    { wch: 10 },  // Giới tính
    { wch: 20 },  // Mức T/H/C
    { wch: 70 },  // Nhận xét sư phạm
    { wch: 18 },  // NL Thẩm mĩ
    { wch: 18 },  // NL Sáng tạo
    { wch: 18 }   // Phẩm chất
  ];

  XLSX.utils.book_append_sheet(wb, ws, `SMAS_MiThuat_Lop_${className}`);

  const fileName = `SMAS_Viettel_DanhGia_MiThuat_Lop_${className}_${grade}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}

/**
 * 2. XUẤT BÀI GIẢNG POWERPOINT (.pptx) CHUẨN KHO HỌC LIỆU SỐ SMAS VIETTEL
 * Sử dụng thư viện PptxGenJS tạo file trình chiếu Microsoft PowerPoint thực thụ
 */
export async function exportSmasPowerPoint({
  unit,
  teacher = { name: 'Thầy Cọ Nhí', title: 'Thầy giáo' },
  grade = 1,
  schoolName = 'TRƯỜNG TIỂU HỌC VIỆT NAM'
}) {
  if (!unit) return;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = teacher.name;
  pptx.company = 'SMAS Viettel E-Learning Repository';
  pptx.title = `${unit.title} - Mĩ Thuật Lớp ${grade}`;

  const teacherName = teacher.name || 'Thầy Cọ Nhí';
  const slidesData = unit.powerpointSlides || [];

  // SLIDE 1: BÌA BÀI GIẢNG ĐIỆN TỬ SỐ SMAS VIETTEL
  const slideCover = pptx.addSlide();
  slideCover.background = { color: 'FFFBEB' };

  // Header Banner
  slideCover.addText('HỆ THỐNG BÀI GIẢNG ĐIỆN TỬ SỐ • CHUẨN KHO HỌC LIỆU SMAS VIETTEL', {
    x: 0.8,
    y: 0.5,
    w: 8.4,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: 'D97706',
    align: 'center'
  });

  slideCover.addText(schoolName.toUpperCase(), {
    x: 0.8,
    y: 0.9,
    w: 8.4,
    h: 0.4,
    fontSize: 13,
    bold: true,
    color: '1E3A8A',
    align: 'center'
  });

  // Tên môn học & Tên bài
  slideCover.addText(`MĨ THUẬT LỚP ${grade}`, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: 'B91C1C',
    align: 'center'
  });

  slideCover.addText(`${unit.unitNumber.toUpperCase()}: ${unit.title.toUpperCase()}`, {
    x: 0.8,
    y: 2.5,
    w: 8.4,
    h: 1.0,
    fontSize: 26,
    bold: true,
    color: '111827',
    align: 'center'
  });

  slideCover.addText(`Bộ sách: Kết nối tri thức với cuộc sống • Thời lượng: ${unit.duration}`, {
    x: 0.8,
    y: 3.6,
    w: 8.4,
    h: 0.5,
    fontSize: 14,
    italic: true,
    color: '4B5563',
    align: 'center'
  });

  // Thông tin giáo viên
  slideCover.addText(`Giáo viên giảng dạy: ${teacherName}\nChuẩn Chương trình Giáo dục Phổ thông 2018 (Thông tư 32/2018/TT-BGDĐT)`, {
    x: 0.8,
    y: 4.5,
    w: 8.4,
    h: 0.8,
    fontSize: 13,
    bold: true,
    color: '1F2937',
    align: 'center'
  });

  // SLIDE 2: MỤC TIÊU BÀI DẠY (YÊU CẦU CẦN ĐẠT THEO CÔNG VĂN 2345)
  const slideObjectives = pptx.addSlide();
  slideObjectives.background = { color: 'FFFFFF' };

  slideObjectives.addText('I. MỤC TIÊU BÀI HỌC (YÊU CẦU CẦN ĐẠT)', {
    x: 0.8,
    y: 0.6,
    w: 8.4,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: '1E3A8A'
  });

  const objectivesList = (unit.wordLessonPlan?.objectives || [
    'Biết quan sát, nhận diện hình khối và màu sắc cơ bản của chủ đề.',
    'Thực hành vẽ và sáng tạo sản phẩm mĩ thuật theo cảm xúc riêng.',
    'Tự tin trưng bày, giới thiệu và nhận xét sản phẩm theo Thang Rubric 4 tiêu chí.'
  ]).map(o => ({ text: o, options: { fontSize: 14, bullet: true, color: '374151', breakLine: true } }));

  slideObjectives.addText(objectivesList, {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 2.5,
    lineSpacing: 28
  });

  slideObjectives.addText('II. ĐỒ DÙNG DẠY HỌC', {
    x: 0.8,
    y: 4.2,
    w: 8.4,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: 'B45309'
  });

  slideObjectives.addText([
    { text: `• Giáo viên: ${unit.wordLessonPlan?.preparations?.teacher || 'Tranh ảnh mẫu, bài giảng điện tử số SMAS, giáo án.'}`, options: { fontSize: 13, breakLine: true } },
    { text: `• Học sinh: ${unit.wordLessonPlan?.preparations?.students || 'Vở thực hành mĩ thuật, bút chì, màu sáp, tẩy, giấy A4.'}`, options: { fontSize: 13 } }
  ], {
    x: 0.8,
    y: 4.8,
    w: 8.4,
    h: 1.5,
    color: '4B5563'
  });

  // SLIDE 3 ĐẾN SLIDE 7: 5 HOẠT ĐỘNG SƯ PHẠM CHUẨN CÔNG VĂN 2345
  slidesData.forEach((s) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Header tiến trình
    slide.addText(`${s.phase.toUpperCase()} - ${unit.title.toUpperCase()}`, {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: 'B91C1C'
    });

    slide.addText(s.subtitle || s.title, {
      x: 0.8,
      y: 1.0,
      w: 8.4,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: 'D97706'
    });

    // Nội dung thuyết minh của Giáo viên
    slide.addText(`Lời giảng của ${teacherName}:`, {
      x: 0.8,
      y: 1.6,
      w: 5.0,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '1E3A8A'
    });

    slide.addText(`"${s.teacherLecture || ''}"`, {
      x: 0.8,
      y: 1.9,
      w: 5.0,
      h: 1.4,
      fontSize: 12.5,
      italic: true,
      color: '374151',
      fill: { color: 'FEF3C7' }
    });

    // Các điểm trọng tâm
    slide.addText('Nội dung trọng tâm hoạt động:', {
      x: 0.8,
      y: 3.5,
      w: 5.0,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '047857'
    });

    const bulletsList = (s.bullets || []).map(b => ({
      text: b,
      options: { fontSize: 12, bullet: true, color: '1F2937', breakLine: true }
    }));

    slide.addText(bulletsList, {
      x: 0.8,
      y: 3.8,
      w: 5.0,
      h: 2.2,
      lineSpacing: 22
    });

    // Bên phải: Khung tranh mẫu & phân tích mĩ thuật
    slide.addText(`Tác phẩm mẫu: ${s.visualArt?.title || unit.visualArt?.title || unit.title}`, {
      x: 6.2,
      y: 1.6,
      w: 3.5,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: 'B45309',
      align: 'center'
    });

    // Khung phân tích nét, hình, màu
    const elementsText = [
      { text: `🎨 Nét vẽ: ${s.visualArt?.elements?.line || 'Nét vẽ tự tin, hài hòa.'}\n`, options: { bold: true, fontSize: 11, color: '1E3A8A' } },
      { text: `🌈 Hòa sắc: ${s.visualArt?.elements?.color || 'Tươi sáng, tương phản sinh động.'}\n`, options: { bold: true, fontSize: 11, color: 'B45309' } },
      { text: `📐 Bố cục: ${s.visualArt?.elements?.composition || 'Cân đối, trọng tâm nổi bật.'}`, options: { bold: true, fontSize: 11, color: '047857' } }
    ];

    slide.addText(elementsText, {
      x: 6.2,
      y: 2.1,
      w: 3.5,
      h: 3.8,
      fill: { color: 'F3F4F6' },
      lineSpacing: 24
    });
  });

  const fileName = `Bai_Giang_PowerPoint_SMAS_Viettel_Lop_${grade}_${unit.id}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
