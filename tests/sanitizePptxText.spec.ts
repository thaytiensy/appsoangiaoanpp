import { test, expect } from '@playwright/test';
import {
  sanitizePptxText,
  sanitizePptxList,
  isXmlGarbage,
  decodeXmlEntities,
} from '../src/utils/sanitizePptxText';

test.describe('Sanitize PPTX Text & DrawingML Parser Utility', () => {
  test('Loại bỏ hoàn toàn các chuỗi XML/DrawingML thô được báo cáo từ người dùng', () => {
    // 3 chuỗi lỗi thực tế trong báo cáo lỗi của người dùng
    const bugString1 = '</a:r><a:solidFill><a:srgbClr val="002060"/></a:solidFill>';
    const bugString2 = '</a:r><a:solidFill><a:srgbClr val="66FF33"/></a:solidFill>';
    const bugString3 = '</a:r><a:solidFill><a:srgbClr val="008000"/></a:solidFill>';

    expect(isXmlGarbage(bugString1)).toBe(true);
    expect(isXmlGarbage(bugString2)).toBe(true);
    expect(isXmlGarbage(bugString3)).toBe(true);

    expect(sanitizePptxText(bugString1)).toBe('');
    expect(sanitizePptxText(bugString2)).toBe('');
    expect(sanitizePptxText(bugString3)).toBe('');
  });

  test('Lọc sạch mảng bullets bị dính XML thô (sanitizePptxList)', () => {
    const rawBullets = [
      'TRƯỜNG TH QUẢNG PHÚ',
      '</a:r><a:solidFill><a:srgbClr val="002060"/></a:solidFill>',
      '</a:r><a:solidFill><a:srgbClr val="66FF33"/></a:solidFill>',
      '</a:r><a:solidFill><a:srgbClr val="008000"/></a:solidFill>',
      'Nội dung trọng tâm bài học mỹ thuật',
    ];

    const cleanBullets = sanitizePptxList(rawBullets);

    expect(cleanBullets).toHaveLength(2);
    expect(cleanBullets[0]).toBe('TRƯỜNG TH QUẢNG PHÚ');
    expect(cleanBullets[1]).toBe('Nội dung trọng tâm bài học mỹ thuật');
  });

  test('Làm sạch văn bản hỗn hợp chứa các thẻ XML lồng nhau', () => {
    const mixed1 = 'TRƯỜNG TH QUẢNG PHÚ<a:rPr><a:solidFill><a:srgbClr val="002060"/></a:solidFill></a:rPr>';
    expect(sanitizePptxText(mixed1)).toBe('TRƯỜNG TH QUẢNG PHÚ');

    const mixed2 = '<a:p><a:r><a:t>XÃ NGUYỄN VIỆT KHÁI -TỈNH CÀ MAU</a:t></a:r></a:p>';
    expect(sanitizePptxText(mixed2)).toBe('XÃ NGUYỄN VIỆT KHÁI -TỈNH CÀ MAU');

    const mixedWithP = '<p:sp><p:txBody><a:p><a:r><a:t>Bài 1: Khởi động</a:t></a:r></a:p></p:txBody></p:sp>';
    expect(sanitizePptxText(mixedWithP)).toBe('Bài 1: Khởi động');
  });

  test('Giải mã chuẩn xác các ký tự thực thể XML và HTML', () => {
    const entityStr = 'Toán &amp; Tin học &lt;Lớp 10&gt; &#34;GDPT 2018&#34; &apos;Chuyên sâu&apos;';
    expect(decodeXmlEntities(entityStr)).toBe('Toán & Tin học <Lớp 10> "GDPT 2018" \'Chuyên sâu\'');

    const cleanEntity = sanitizePptxText(entityStr);
    expect(cleanEntity).toBe('Toán & Tin học <Lớp 10> "GDPT 2018" \'Chuyên sâu\'');
  });

  test('Xử lý an toàn với các trường hợp biên (null, undefined, rỗng, số)', () => {
    expect(sanitizePptxText(null)).toBe('');
    expect(sanitizePptxText(undefined)).toBe('');
    expect(sanitizePptxText('')).toBe('');
    expect(sanitizePptxText('   ')).toBe('');
    expect(sanitizePptxText(12345)).toBe('12345');
    expect(sanitizePptxList([])).toEqual([]);
    expect(sanitizePptxList([null, undefined, '', '   '])).toEqual([]);
  });
});
