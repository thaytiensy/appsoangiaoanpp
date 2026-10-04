/**
 * Tiện ích bóc tách và làm sạch chuỗi văn bản từ PowerPoint OpenXML (DrawingML)
 * Đảm bảo loại bỏ 100% các thẻ namespace <a:...>, <p:...>, <w:...>, các thuộc tính XML dính kèm
 * và giải mã các thực thể ký tự HTML/XML.
 */

/**
 * Giải mã các thực thể ký tự XML/HTML thông dụng và dạng số (Unicode code point)
 */
export function decodeXmlEntities(input: string): string {
  if (!input) return '';

  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : '';
    });
}

/**
 * Kiểm tra xem chuỗi có phải là chuỗi rác XML/DrawingML thuần túy hay không
 * (Ví dụ: '</a:r><a:solidFill><a:srgbClr val="002060"/></a:solidFill>')
 */
export function isXmlGarbage(input: string): boolean {
  if (!input || typeof input !== 'string') return true;
  const trimmed = input.trim();
  if (trimmed.length === 0) return true;

  // Nếu chuỗi chứa các namespace đặc trưng của Office OpenXML mà sau khi gỡ thẻ chỉ còn rỗng
  const stripped = trimmed
    .replace(/<\/?[a-zA-Z0-9_\-:]+(?:\s+[^>]*)?\/?>/g, '')
    .replace(/val="[a-zA-Z0-9_\-#]+"/gi, '')
    .trim();

  return stripped.length === 0;
}

/**
 * Bóc tách và làm sạch hoàn toàn văn bản khỏi mã XML/HTML
 * - Loại bỏ toàn bộ thẻ XML (<a:...>, <p:...>, <w:...>, ...)
 * - Loại bỏ các thuộc tính XML còn sót lại
 * - Giải mã ký tự thực thể
 * - Chuẩn hóa khoảng trắng thừa
 */
export function sanitizePptxText(input: unknown): string {
  if (input === null || input === undefined) return '';
  let text = String(input);

  if (text.length === 0) return '';

  // 1. Loại bỏ các thẻ XML/HTML đóng/mở chuẩn và tự đóng (<tag.../>, </tag>)
  text = text.replace(/<\/?[a-zA-Z0-9_\-:]+(?:\s+[^>]*)?\/?>/gi, ' ');

  // 2. Loại bỏ các thẻ gãy hoặc các mảnh đóng thẻ còn sót lại
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/^[^\w\s\u00C0-\u1EF9]+>/g, ' ');
  text = text.replace(/<[^\w\s\u00C0-\u1EF9]+$/g, ' ');

  // 3. Loại bỏ các thuộc tính XML dính kèm nếu còn sót lại (ví dụ: val="002060", srgbClr val=...)
  text = text.replace(/\b(?:val|xmlns|xmlns:[a-zA-Z0-9_\-]+)="[^"]*"/gi, ' ');
  text = text.replace(/\b(?:srgbClr|solidFill|schemeClr|prstClr)\b/gi, ' ');

  // 4. Giải mã các thực thể XML/HTML
  text = decodeXmlEntities(text);

  // 5. Chuẩn hóa khoảng trắng và dấu ngắt dòng
  text = text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return text;
}

/**
 * Làm sạch mảng các chuỗi (ví dụ: danh sách gạch đầu dòng bullets)
 * Tự động loại bỏ các phần tử rỗng hoặc phần tử chỉ chứa rác XML
 */
export function sanitizePptxList(inputs: unknown[]): string[] {
  if (!Array.isArray(inputs)) return [];

  const results: string[] = [];
  for (const item of inputs) {
    if (typeof item === 'string' && isXmlGarbage(item)) {
      continue;
    }
    const clean = sanitizePptxText(item);
    if (clean.length > 0 && !isXmlGarbage(clean)) {
      results.push(clean);
    }
  }

  return results;
}
