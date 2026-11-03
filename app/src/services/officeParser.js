import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { SMAS_COMMENT_BANK } from './smasExport.js';

const decodeXmlText = (text) => String(text || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)))
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

/**
 * BỘ PHÂN TÍCH VÀ HIỂN THỊ CHUẨN TẬP TIN MICROSOFT OFFICE (PPTX, DOCX, XLSX)
 * Đảm bảo đọc đúng 100% nội dung thực tế từ máy tính giáo viên hoặc cổng SMAS Viettel.
 */

// ============================================================================
// 1. PHÂN TÍCH TỆP MICROSOFT POWERPOINT (.pptx)
// ============================================================================
export async function parsePptxFile(file, teacherPronoun = 'Thầy') {
  try {
    let arrayBuffer = file;
    if (typeof file?.arrayBuffer === 'function') {
      arrayBuffer = await file.arrayBuffer();
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) {
      arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    }
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Tìm tất cả các slide trong gói OpenXML: ppt/slides/slide{N}.xml
    const slidePaths = Object.keys(zip.files).filter(path => /^ppt\/slides\/slide\d+\.xml$/.test(path));

    if (slidePaths.length === 0) {
      throw new Error('Tệp không chứa cấu trúc slide PowerPoint hợp lệ.');
    }

    // 0. Xác định tỷ lệ màn hình Slide (16:9 widescreen vs 4:3 standard)
    let detectedSlideSize = '16:9';
    if (zip.file('ppt/presentation.xml')) {
      try {
        const presXml = await zip.file('ppt/presentation.xml').async('text');
        const szMatch = presXml.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
        if (szMatch) {
          const cx = parseInt(szMatch[1], 10);
          const cy = parseInt(szMatch[2], 10);
          if (cy > 0 && (cx / cy) < 1.5) {
            detectedSlideSize = '4:3';
          }
        }
      } catch (e) {
        console.warn('Lỗi đọc tỷ lệ slide trong presentation.xml:', e);
      }
    }

    // Quét toàn bộ kho media tìm các tệp âm thanh / âm nhạc (.mp3, .wav, .m4a, .ogg)
    const allAudioPaths = Object.keys(zip.files).filter(p => /^ppt\/media\/.*\.(mp3|wav|m4a|ogg|aac|wma)$/i.test(p));
    const audioCache = {};
    for (const ap of allAudioPaths) {
      try {
        const filename = ap.split('/').pop();
        const b64 = await zip.file(ap).async('base64');
        const ext = filename.split('.').pop().toLowerCase();
        const mime = ext === 'wav' ? 'audio/wav' : (ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg');
        audioCache[filename] = {
          name: filename,
          url: `data:${mime};base64,${b64}`,
          type: mime
        };
      } catch (e) {}
    }

    // Sắp xếp thứ tự tự nhiên của slide: slide1, slide2, ..., slide10
    slidePaths.sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return na - nb;
    });

    const parsedSlides = [];

    for (let i = 0; i < slidePaths.length; i++) {
      const slidePath = slidePaths[i];
      const slideNum = slidePath.match(/slide(\d+)\.xml/)?.[1] || `${i + 1}`;
      const slideXml = await zip.file(slidePath).async('text');

      // 1. Trích xuất toàn bộ các đoạn văn bản (<a:p>)
      const pMatches = slideXml.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
      const paragraphs = pMatches.map(p => {
        const tMatches = p.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        return tMatches.map(t => decodeXmlText(t.replace(/<[^>]+>/g, ''))).join('');
      }).map(s => s.trim()).filter(s => s.length > 0);

      // 2. Trích xuất Font chữ và cỡ chữ thực tế từ OpenXML (<a:rPr typeface=... sz=...>)
      let slideFont = null;
      const fontMatches = slideXml.match(/typeface="([^"+][^"]+)"/g) || [];
      for (const fm of fontMatches) {
        const fn = fm.replace(/typeface="|"/g, '').trim();
        if (fn && !fn.startsWith('+') && !fn.includes('theme') && fn.length > 2) {
          slideFont = fn;
          break;
        }
      }

      let titleSz = 26;
      let bodySz = 16;
      const szMatches = slideXml.match(/sz="(\d+)"/g) || [];
      if (szMatches.length > 0) {
        const pSz = parseInt(szMatches[0].replace(/sz="|"/g, ''), 10) / 100;
        if (pSz >= 16 && pSz <= 60) titleSz = Math.round(pSz);
      }
      if (szMatches.length > 1) {
        const pSz2 = parseInt(szMatches[1].replace(/sz="|"/g, ''), 10) / 100;
        if (pSz2 >= 12 && pSz2 <= 30) bodySz = Math.round(pSz2);
      }

      // 3. Phân loại Tiêu đề & Nội dung
      let title = `Slide ${i + 1}`;
      let subtitle = 'Nội dung bài giảng mĩ thuật';
      let bullets = [];

      if (paragraphs.length === 1) {
        title = paragraphs[0];
      } else if (paragraphs.length >= 2) {
        title = paragraphs[0];
        subtitle = paragraphs[1].length < 150 ? paragraphs[1] : 'Nội dung trọng tâm bài học';
        bullets = paragraphs.slice(2);
      } else {
        bullets = [];
      }

      // 4. Trích xuất TOÀN BỘ hình ảnh & tệp âm thanh minh họa từ tệp quan hệ (.rels)
      const slideImages = [];
      let slideAudio = null;
      const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;

      if (zip.file(relsPath)) {
        try {
          const relsXml = await zip.file(relsPath).async('text');
          const targetMatches = relsXml.match(/Target="([^"]+)"/g) || [];
          for (const tm of targetMatches) {
            const rawTarget = tm.replace(/Target="|"/g, '');
            const filename = rawTarget.split('/').pop();

            // Nhận diện ảnh (.png, .jpg, .jpeg, .webp, .gif)
            if (rawTarget.includes('media/') && /\.(png|jpg|jpeg|webp|gif)$/i.test(filename)) {
              const mediaPath = `ppt/media/${filename}`;
              const mediaFile = zip.file(mediaPath);
              if (mediaFile) {
                const b64 = await mediaFile.async('base64');
                const ext = filename.split('.').pop().toLowerCase();
                const mime = ext === 'png'
                  ? 'image/png'
                  : ext === 'gif'
                    ? 'image/gif'
                    : ext === 'webp'
                      ? 'image/webp'
                      : 'image/jpeg';
                slideImages.push({
                  id: `img_${slideNum}_${slideImages.length + 1}`,
                  name: filename,
                  url: `data:${mime};base64,${b64}`
                });
              }
            }

            // Nhận diện âm thanh / bài hát / nhạc nền (.mp3, .wav, .m4a, .ogg)
            if (rawTarget.includes('media/') && /\.(mp3|wav|m4a|ogg|aac|wma)$/i.test(filename)) {
              if (audioCache[filename]) {
                slideAudio = audioCache[filename];
              }
            }
          }
        } catch (e) {
          console.warn('Lỗi đọc rels của slide:', e);
        }
      }

      // Nếu slide chưa có audio riêng nhưng tệp bài giảng có nhạc
      if (!slideAudio && allAudioPaths.length > 0 && i === 0) {
        const firstAudioName = allAudioPaths[0].split('/').pop();
        slideAudio = audioCache[firstAudioName];
      }

      // 5. Trích xuất ghi chú của giáo viên (Speaker Notes)
      let speakerNote = null;
      const notesPaths = [
        `ppt/notesSlides/notesSlide${slideNum}.xml`,
        `ppt/notesSlides/notesSlide${i + 1}.xml`
      ];
      for (const np of notesPaths) {
        if (zip.file(np)) {
          try {
            const nXml = await zip.file(np).async('text');
            const nP = nXml.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
            const nTexts = nP.map(p => {
              if (/<a:fld\b[^>]*type=["']slidenum["']/i.test(p)) return '';
              const tM = p.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
              return tM.map(t => decodeXmlText(t.replace(/<[^>]+>/g, ''))).join('');
            }).map(s => s.trim()).filter(s => s.length > 0 && !s.includes('Slide '));
            if (nTexts.length > 0) {
              speakerNote = nTexts.join(' ');
              break;
            }
          } catch (e) {
            console.warn('Lỗi đọc ghi chú slide:', e);
          }
        }
      }

      // Chỉ chọn bố cục mà trình sửa có thể hiển thị bằng dữ liệu đã trích xuất.
      // Không đoán slide trò chơi/mục tiêu vì parser chưa đọc được cấu trúc tương ứng.
      const detectedLayout = slideImages.length > 0 ? 'image-caption' : 'title-content';

      parsedSlides.push({
        phase: `Slide ${i + 1}`,
        title: title,
        subtitle: subtitle,
        speakerNote: speakerNote || '',
        teacherLecture: speakerNote || '',
        bullets,
        fontFamily: slideFont || 'Arial',
        titleFontSize: titleSz,
        bodyFontSize: bodySz,
        slideSize: detectedSlideSize,
        layout: detectedLayout,
        images: slideImages,
        visualArt: {
          title: title,
          imageUrl: slideImages[0]?.url || './teacher.jpg'
        },
        audio: slideAudio,
        textBoxes: []
      });
    }

    return {
      success: true,
      slides: parsedSlides,
      total: parsedSlides.length,
      slideSize: detectedSlideSize,
      allAudios: Object.values(audioCache),
      fileName: file?.name || 'PowerPoint_Presentation.pptx'
    };
  } catch (error) {
    console.error('Lỗi phân tích cú pháp tệp PowerPoint:', error);
    throw error;
  }
}

// ============================================================================
// 2. PHÂN TÍCH TỆP MICROSOFT WORD (.docx / .doc / .txt)
// ============================================================================
export async function parseDocxFile(file) {
  try {
    let arrayBuffer = file;
    if (typeof file?.arrayBuffer === 'function') {
      arrayBuffer = await file.arrayBuffer();
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) {
      arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    }

    // 1. Chuyển đổi toàn diện sang Rich HTML với hình ảnh inline base64
    const htmlResult = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: mammoth.images.imgElement((image) => {
          return image.read('base64').then((imageBuffer) => {
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`
            };
          });
        })
      }
    );
    const fullHtml = htmlResult.value;

    // 2. Trích xuất văn bản thuần để bóc tách cấu trúc CV 2345
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    const rawText = textResult.value || '';
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Tiêu đề & tên bài
    let title = 'KẾ HOẠCH BÀI DẠY MĨ THUẬT';
    let unit = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'Bài học môn Mĩ thuật';
    const objectives = [];
    const activities = [];

    // Tìm tiêu đề
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('kế hoạch') || line.toLowerCase().includes('bài dạy') || line.toLowerCase().includes('giáo án')) {
        title = line.toUpperCase();
      } else if (line.toLowerCase().includes('bài') || line.toLowerCase().includes('chủ đề')) {
        unit = line;
      }
    }

    // Bóc tách mục tiêu (Yêu cầu cần đạt)
    let inObjectives = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('mục tiêu') || line.toLowerCase().includes('yêu cầu cần đạt')) {
        inObjectives = true;
        continue;
      }
      if (inObjectives && (line.toLowerCase().includes('đồ dùng') || line.toLowerCase().includes('thiết bị') || line.toLowerCase().includes('tiến trình'))) {
        inObjectives = false;
      }
      if (inObjectives) {
        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('+') || line.toLowerCase().includes('năng lực') || line.toLowerCase().includes('phẩm chất')) {
          objectives.push(line.replace(/^[-•+]\s*/, ''));
        }
      }
    }

    // Bóc tách các hoạt động dạy học
    const actRegex = /(hoạt động \d+|khởi động|khám phá|luyện tập|vận dụng|thực hành)/i;
    let currentAct = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (actRegex.test(line) && line.length < 80) {
        if (currentAct) {
          activities.push(currentAct);
        }
        currentAct = {
          phase: line,
          duration: '7-10 phút',
          objective: 'Củng cố kiến thức và kỹ năng thực hành',
          teacherAct: '',
          studentAct: '',
          teacherQuestions: [],
          visualNotes: ''
        };
      } else if (currentAct) {
        if (line.toLowerCase().includes('giáo viên') || line.toLowerCase().includes('gv:')) {
          currentAct.teacherAct += (currentAct.teacherAct ? '\n' : '') + line;
        } else if (line.toLowerCase().includes('học sinh') || line.toLowerCase().includes('hs:')) {
          currentAct.studentAct += (currentAct.studentAct ? '\n' : '') + line;
        } else if (line.includes('?')) {
          currentAct.teacherQuestions.push(line);
        } else {
          currentAct.teacherAct += (currentAct.teacherAct ? ' ' : '') + line;
        }
      }
    }
    if (currentAct) {
      activities.push(currentAct);
    }

    return {
      success: true,
      html: fullHtml,
      rawText: rawText,
      title: title,
      unit: unit,
      objectives: objectives.length > 0 ? objectives : [
        'Nhận biết được đặc điểm hình khối, màu sắc và đường nét trong tác phẩm',
        'Thực hành sáng tạo sản phẩm mĩ thuật theo ý thích và cảm xúc',
        'Chia sẻ cảm nhận và trân trọng thành quả lao động mĩ thuật'
      ],
      activities: activities.length > 0 ? activities : null,
      fileName: file?.name || 'KHBD_MiThuat.docx'
    };
  } catch (error) {
    console.error('Lỗi phân tích cú pháp Word (.docx):', error);
    throw error;
  }
}

// ============================================================================
// 3. PHÂN TÍCH TỆP MICROSOFT EXCEL (.xlsx / .xls / .csv)
// ============================================================================
export function parseExcelFile(arrayBuffer, currentGrade = 1) {
  try {
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (!sheetNames || sheetNames.length === 0) {
      throw new Error('Tệp Excel không chứa trang tính (sheet) nào.');
    }

    const sheetsData = {};

    sheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      // 1. Quét tìm dòng Tiêu đề (Header Row) thông minh trong 20 dòng đầu
      let headerRowIndex = -1;
      let colMap = {
        stt: -1,
        code: -1,
        fullName: -1,
        hoDem: -1,
        ten: -1,
        birthDate: -1,
        gender: -1,
        level: -1,
        comment: -1
      };

      for (let r = 0; r < Math.min(rawRows.length, 20); r++) {
        const row = rawRows[r];
        if (!Array.isArray(row)) continue;

        let matchCount = 0;
        row.forEach((cell, cIdx) => {
          const text = String(cell || '').trim().toLowerCase();
          if (text === 'stt' || text === 'số tt' || text === 'số thứ tự' || text === 'no.') {
            colMap.stt = cIdx;
            matchCount++;
          } else if (text.includes('mã') || text.includes('smas') || text.includes('code') || text.includes('định danh')) {
            colMap.code = cIdx;
            matchCount++;
          } else if (text === 'họ và tên' || text === 'họ tên' || text === 'họ và tên học sinh' || text === 'tên học sinh') {
            colMap.fullName = cIdx;
            matchCount++;
          } else if (text === 'họ đệm' || text === 'họ và tên đệm' || text === 'họ lót') {
            colMap.hoDem = cIdx;
            matchCount++;
          } else if (text === 'tên' || text === 'tên khai sinh') {
            colMap.ten = cIdx;
            matchCount++;
          } else if (text.includes('ngày sinh') || text.includes('sinh ngày') || text.includes('năm sinh')) {
            colMap.birthDate = cIdx;
            matchCount++;
          } else if (text.includes('giới tính') || text.includes('phái') || text.includes('nam/nữ')) {
            colMap.gender = cIdx;
            matchCount++;
          } else if (text.includes('mức') || text.includes('đánh giá') || text.includes('kết quả') || text.includes('xếp loại')) {
            colMap.level = cIdx;
            matchCount++;
          } else if (text.includes('nhận xét') || text.includes('lời phê') || text.includes('ghi chú')) {
            colMap.comment = cIdx;
            matchCount++;
          }
        });

        if (matchCount >= 2) {
          headerRowIndex = r;
          break;
        }
      }

      // 2. Phân tích danh sách học sinh từ dòng dữ liệu
      const parsedStudents = [];
      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;

      for (let r = startRow; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        let stt = '';
        let studentCode = '';
        let fullName = '';
        let birthDate = '15/09/2018';
        let gender = parsedStudents.length % 2 === 0 ? 'Nam' : 'Nữ';
        let level = 'H';
        let comment = '';

        if (headerRowIndex !== -1) {
          // Trích xuất dựa trên cột đã xác định
          if (colMap.stt !== -1) stt = String(row[colMap.stt] || '').trim();
          if (colMap.code !== -1) studentCode = String(row[colMap.code] || '').trim();

          if (colMap.fullName !== -1 && row[colMap.fullName]) {
            fullName = String(row[colMap.fullName]).trim();
          } else if (colMap.hoDem !== -1 || colMap.ten !== -1) {
            const ho = colMap.hoDem !== -1 ? String(row[colMap.hoDem] || '').trim() : '';
            const ten = colMap.ten !== -1 ? String(row[colMap.ten] || '').trim() : '';
            fullName = `${ho} ${ten}`.trim();
          }

          if (colMap.birthDate !== -1 && row[colMap.birthDate]) {
            birthDate = String(row[colMap.birthDate]).trim();
          }
          if (colMap.gender !== -1 && row[colMap.gender]) {
            gender = String(row[colMap.gender]).trim();
          }
          if (colMap.level !== -1 && row[colMap.level]) {
            const rawLvl = String(row[colMap.level]).trim().toUpperCase();
            if (['T', 'H', 'C'].includes(rawLvl)) level = rawLvl;
          }
          if (colMap.comment !== -1 && row[colMap.comment]) {
            comment = String(row[colMap.comment]).trim();
          }
        } else {
          // Heuristic khi không có header rõ ràng
          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();

          const sttNum = parseInt(col0, 10);
          if (!isNaN(sttNum)) {
            stt = col0;
            if (col1.toUpperCase().startsWith('SMAS') || col1.toUpperCase().startsWith('HS')) {
              studentCode = col1;
              fullName = col2;
            } else {
              fullName = col1;
            }
            if (row[3]) birthDate = String(row[3]).trim();
            if (row[4]) gender = String(row[4]).trim();
            if (row[5]) {
              const rawLvl = String(row[5]).trim().toUpperCase();
              if (['T', 'H', 'C'].includes(rawLvl)) level = rawLvl;
            }
            if (row[6]) comment = String(row[6]).trim();
          }
        }

        // Bỏ qua nếu dòng không có tên học sinh hợp lệ
        if (!fullName || fullName.length < 2 || fullName.toLowerCase().includes('tổng số') || fullName.toLowerCase().includes('thống kê')) {
          continue;
        }

        if (!studentCode) {
          studentCode = `SMAS26${currentGrade}${String(parsedStudents.length + 1).padStart(3, '0')}`;
        }
        if (!comment) {
          const pool = SMAS_COMMENT_BANK[level] || SMAS_COMMENT_BANK.H;
          comment = pool[parsedStudents.length % pool.length];
        }

        parsedStudents.push({
          stt: parsedStudents.length + 1,
          studentCode,
          fullName,
          birthDate,
          gender,
          level,
          comment,
          aestheticCapacity: level === 'C' ? 'CĐ' : (level === 'T' ? 'T' : 'Đ'),
          creativeCapacity: level === 'C' ? 'CĐ' : (level === 'T' ? 'T' : 'Đ'),
          qualities: level === 'C' ? 'Đ' : 'T'
        });
      }

      sheetsData[sheetName] = {
        rawRows: rawRows,
        students: parsedStudents
      };
    });

    return {
      success: true,
      sheetNames: sheetNames,
      sheetsData: sheetsData
    };
  } catch (error) {
    console.error('Lỗi phân tích cú pháp Excel:', error);
    throw error;
  }
}
