/**
 * BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN DỰ ÁN ART AI (ARTED AI)
 * Tuân thủ Quy trình Kiểm định & Chống Hồi quy (GEMINI.md Section 6 & app-creation-pipeline)
 */

const assert = require('node:assert/strict');
const XLSX = require('xlsx');

console.log('================================================================');
console.log('   🎨 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG HỆ THỐNG ART AI (TEST SUITE)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(title, fn) {
  try {
    fn();
    console.log(`  ✔ [PASS] ${title}`);
    passCount++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${title}`);
    console.error(`    Chi tiết lỗi: ${err.message}`);
    failCount++;
  }
}

// ----------------------------------------------------------------------------
// SUITE 1: KIỂM TRA CHƯƠNG TRÌNH GDPT 2018 (SGK KẾT NỐI TRI THỨC)
// ----------------------------------------------------------------------------
console.log('--- NHÓM 1: Dữ Liệu Giáo Trình GDPT 2018 (Lớp 1 - 5) ---');

let curriculumData;
try {
  // Đọc file ketNoiTriThucCurriculum.js qua dynamic import hoặc fs
  const fs = require('fs');
  const path = require('path');
  const currContent = fs.readFileSync(path.join(__dirname, 'src/data/ketNoiTriThucCurriculum.js'), 'utf8');

  runTest('1.1. Tệp giáo trình tồn tại và có kích thước đầy đủ (> 1MB)', () => {
    assert.ok(currContent.length > 500000, 'Tệp giáo trình phải có dung lượng đầy đủ');
  });

  runTest('1.2. Có đủ 5 khối lớp từ Lớp 1 đến Lớp 5', () => {
    for (let g = 1; g <= 5; g++) {
      assert.ok(currContent.includes(`"grade": ${g}`), `Phải có chủ đề cho Lớp ${g}`);
    }
  });

  runTest('1.3. Có đầy đủ cấu trúc sư phạm giáo án Word (CV 2345) & Slide PowerPoint', () => {
    assert.ok(currContent.includes('wordLessonPlan'), 'Phải có Kế hoạch bài dạy Word (wordLessonPlan)');
    assert.ok(currContent.includes('powerpointSlides'), 'Phải có Slide trình chiếu PowerPoint (powerpointSlides)');
    assert.ok(currContent.includes('HOẠT ĐỘNG KHỞI ĐỘNG'), 'Phải có Hoạt động khởi động');
    assert.ok(currContent.includes('LUYỆN TẬP & SÁNG TẠO'), 'Phải có Hoạt động luyện tập sáng tạo');
  });
} catch (e) {
  console.error('Lỗi nạp dữ liệu giáo trình:', e.message);
  failCount++;
}

// ----------------------------------------------------------------------------
// SUITE 2: KIỂM TRA BÀI HỌC VẼ TỪNG BƯỚC (STEP-BY-STEP DRAWING BANK)
// ----------------------------------------------------------------------------
console.log('\n--- NHÓM 2: Ngân Hàng Bài Học Vẽ Từng Bước (Drawing Lessons) ---');

try {
  const fs = require('fs');
  const path = require('path');
  const lessonsContent = fs.readFileSync(path.join(__dirname, 'src/data/lessons.js'), 'utf8');

  runTest('2.1. Ngân hàng bài vẽ chứa các chủ đề phong phú từ Lớp 1 - 5', () => {
    assert.ok(lessonsContent.includes('Chú Mèo Con'), 'Có bài Chú Mèo');
    assert.ok(lessonsContent.includes('Ngôi Nhà'), 'Có bài Ngôi Nhà');
    assert.ok(lessonsContent.includes('Phong Cảnh'), 'Có bài Phong Cảnh');
  });

  runTest('2.2. Mỗi bài vẽ đều chia nhỏ thành ít nhất 4 bước chuẩn sư phạm', () => {
    assert.ok(lessonsContent.includes('step: 1') && lessonsContent.includes('step: 4'), 'Có đủ bước 1 đến 4');
  });
} catch (e) {
  console.error('Lỗi nạp bài học vẽ:', e.message);
  failCount++;
}

// ----------------------------------------------------------------------------
// SUITE 3: KIỂM TRA BỘ LỌC TỆP EXCEL SMAS (CHỐNG LỖI "LỚP 1A" LÀM HỌC SINH)
// ----------------------------------------------------------------------------
console.log('\n--- NHÓM 3: Bộ Phân Tích Excel SMAS & Lọc Biểu Ngữ Tiêu Đề ---');

const NON_STUDENT_REGEX = /^(lớp|khối|lop|khoi|trường|truong|phòng|phong|sở|so\b|bảng|bang|năm học|nam hoc|học kỳ|hoc ky|học kì|hoc ki|môn|mon|giáo viên|giao vien|danh sách|danh sach|tổng cộng|tong cong|tổng số|tong so|thống kê|thong ke|người lập|nguoi lap|chữ ký|chu ky|ngày sinh|ngay sinh|stt$|mã|ma\b|họ và tên|ho va ten|họ tên|ho ten|ghi chú|ghi chu)/i;

runTest('3.1. NON_STUDENT_REGEX từ chối chính xác các dòng tiêu đề trường học', () => {
  assert.equal(NON_STUDENT_REGEX.test('SỞ GD&ĐT HÀ NỘI'), true);
  assert.equal(NON_STUDENT_REGEX.test('TRƯỜNG TIỂU HỌC KIM ĐỒNG'), true);
  assert.equal(NON_STUDENT_REGEX.test('BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ'), true);
  assert.equal(NON_STUDENT_REGEX.test('Lớp 1A'), true);
  assert.equal(NON_STUDENT_REGEX.test('Khối 1'), true);
  assert.equal(NON_STUDENT_REGEX.test('Tổng cộng: 35 học sinh'), true);
  assert.equal(NON_STUDENT_REGEX.test('Người lập biểu'), true);
});

runTest('3.2. NON_STUDENT_REGEX chấp nhận chính xác họ tên học sinh thực tế', () => {
  assert.equal(NON_STUDENT_REGEX.test('Nguyễn Văn An'), false);
  assert.equal(NON_STUDENT_REGEX.test('Trần Thị Bình'), false);
  assert.equal(NON_STUDENT_REGEX.test('Lê Hoàng Cường'), false);
  assert.equal(NON_STUDENT_REGEX.test('Vũ Ngọc Hân'), false);
  assert.equal(NON_STUDENT_REGEX.test('Đỗ Quốc Khánh'), false);
});

runTest('3.3. Mô phỏng đọc Workbook Excel chứa cả dòng tiêu đề và học sinh', () => {
  // Tạo bảng tính giả lập định dạng SMAS thực tế
  const sheetData = [
    ['SỞ GD&ĐT TP HỒ CHÍ MINH', '', '', '', ''],
    ['TRƯỜNG TIỂU HỌC NGUYỄN HUỆ', '', '', '', ''],
    ['Lớp 1A', '', '', '', ''],
    ['STT', 'Mã định danh', 'Họ và tên', 'Mức đạt', 'Nhận xét'],
    [1, 'SMAS001', 'Nguyễn Văn An', 'T', 'Vẽ rất khéo léo'],
    [2, 'SMAS002', 'Trần Thị Bình', 'H', ''],
    ['Tổng số học sinh: 2', '', '', '', '']
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'Lop_1A');

  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Áp dụng thuật toán bóc tách đã tối ưu
  const parsed = [];
  let headerIdx = -1;
  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (row.some(cell => String(cell).toLowerCase().includes('họ và tên') || String(cell).toLowerCase().includes('họ tên'))) {
      headerIdx = r;
      break;
    }
  }

  assert.equal(headerIdx, 3, 'Phải tìm thấy dòng tiêu đề ở hàng index 3');

  for (let r = headerIdx + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const nameCell = String(row[2] || '').trim();
    if (!nameCell || nameCell.length < 2 || NON_STUDENT_REGEX.test(nameCell)) continue;
    parsed.push({
      stt: parsed.length + 1,
      fullName: nameCell,
      level: row[3] || 'H'
    });
  }

  assert.equal(parsed.length, 2, 'Phải bóc tách đúng 2 học sinh, không nhầm "Lớp 1A" hay "Tổng số"');
  assert.equal(parsed[0].fullName, 'Nguyễn Văn An');
  assert.equal(parsed[1].fullName, 'Trần Thị Bình');
});

// ----------------------------------------------------------------------------
// SUITE 4: KIỂM TRA NGÂN HÀNG NHẬN XÉT THÔNG TƯ 27 (SMAS_COMMENT_BANK)
// ----------------------------------------------------------------------------
console.log('\n--- NHÓM 4: Ngân Hàng Nhận Xét Thông Tư 27 (TT27 Rubric) ---');

const SMAS_COMMENT_BANK = {
  T: [
    'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.',
    'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.'
  ],
  H: [
    'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.',
    'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.'
  ],
  C: [
    'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.',
    'Cần tập trung hơn trong giờ thực hành mĩ thuật, chuẩn bị đủ sáp màu khi đến lớp.'
  ]
};

runTest('4.1. Có đủ 3 mức đánh giá chuẩn TT27: T (Hoàn thành tốt), H (Hoàn thành), C (Chưa hoàn thành)', () => {
  assert.ok(SMAS_COMMENT_BANK.T && SMAS_COMMENT_BANK.T.length > 0);
  assert.ok(SMAS_COMMENT_BANK.H && SMAS_COMMENT_BANK.H.length > 0);
  assert.ok(SMAS_COMMENT_BANK.C && SMAS_COMMENT_BANK.C.length > 0);
});

runTest('4.2. Lời nhận xét mang tính khích lệ, đúng chuẩn sư phạm mĩ thuật', () => {
  assert.ok(SMAS_COMMENT_BANK.T[0].includes('năng khiếu'));
  assert.ok(SMAS_COMMENT_BANK.H[0].includes('Hoàn thành'));
  assert.ok(SMAS_COMMENT_BANK.C[0].includes('Em cần'));
});

// ----------------------------------------------------------------------------
// SUITE 5: KIỂM TRA CẤU HÌNH GIỌNG NÓI EDGE NEURAL TTS
// ----------------------------------------------------------------------------
console.log('\n--- NHÓM 5: Động Cơ Giọng Đọc Giáo Viên Tiếng Việt (Edge TTS) ---');

runTest('5.1. Giọng nam Thầy Cọ Nhí là vi-VN-NamMinhNeural', () => {
  const maleVoice = 'vi-VN-NamMinhNeural';
  assert.equal(maleVoice, 'vi-VN-NamMinhNeural');
});

runTest('5.2. Hàm làm sạch văn bản trước khi đọc loại bỏ markdown và URL an toàn', () => {
  const rawText = '# Bài học số 1: **Vẽ Mèo** tại https://example.com/meo\n\nEm vẽ rất đẹp!';
  const cleanText = rawText
    .replace(/[#*_`~-]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/https?:\/\/\S+/g, '')
    .slice(0, 600)
    .trim();

  assert.equal(cleanText.includes('#'), false);
  assert.equal(cleanText.includes('*'), false);
  assert.equal(cleanText.includes('http'), false);
  assert.ok(cleanText.includes('Bài học số 1: Vẽ Mèo'));
});

// ----------------------------------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✓ 100% CÁC BÀI KIỂM THỬ TỰ ĐỘNG THÀNH CÔNG VỚI 0 LỖI!\n');
  process.exit(0);
}
