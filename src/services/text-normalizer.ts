export function normalizeNfc(text: string | null | undefined): string {
  if (!text) return '';
  // 1. Chuẩn hóa về dạng dựng sẵn Unicode NFC (Precomposed)
  let normalized = text.normalize('NFC');

  // 2. Khắc phục lỗi dấu rời rạc hoặc dấu phẩy/ngoặc đơn thừa do mô hình AI tạo ra (vd: kiế'n, nắ'm, cố't)
  normalized = normalized.replace(/([a-zA-Z\u00C0-\u1EF9])['`´’]\s*([a-zA-Z\u00C0-\u1EF9])/g, '$1$2');
  
  // 3. Khắc phục lỗi ký tự dấu kết hợp bị cách khoảng trắng (vd: nắ m -> nắm, kiế n -> kiến)
  normalized = normalized.replace(/(kiế)\s+(n)/gi, '$1$2')
    .replace(/(nắ)\s+(m)/gi, '$1$2')
    .replace(/(quy\s+tắ)\s+(c)/gi, '$1$2')
    .replace(/(bản\s+chấ)\s+(t)/gi, '$1$2')
    .replace(/(cố)\s+(t)/gi, '$1$2')
    .replace(/(quyế)\s+(t)/gi, '$1$2')
    .replace(/(huố)\s+(ng)/gi, '$1$2')
    .replace(/(cầ)\s+(u)/gi, '$1$2')
    .replace(/(cầ)\s+(n)/gi, '$1$2')
    .replace(/(nố)\s+(i)/gi, '$1$2')
    .replace(/(số)\s+(ng)/gi, '$1$2')
    .replace(/(tiế)\s+(p)/gi, '$1$2')
    .replace(/(xuấ)\s+(t)/gi, '$1$2')
    .replace(/(thầ)\s+(n)/gi, '$1$2')
    .replace(/(Phiế)\s+(u)/gi, '$1$2')
    .replace(/(Đồ)\s+(ng)/gi, '$1$2');

  return normalized.normalize('NFC');
}
