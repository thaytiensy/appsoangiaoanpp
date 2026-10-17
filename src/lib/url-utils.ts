export function sanitizeUrl(input: string): string {
  let cleaned = input.trim();

  // Loại bỏ cú pháp markdown nếu có: [text](https://example.com) -> https://example.com
  const mdMatch = cleaned.match(/\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    cleaned = mdMatch[1];
  }

  // Loại bỏ các ký tự bọc thừa [url], (url), <url>, "url", 'url'
  cleaned = cleaned.replace(/^[\[\(\<"']+|[\]\)\>"']+$/g, '').trim();

  // Tự động bổ sung https:// nếu người dùng quên nhập protocol
  if (cleaned && !/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  return cleaned;
}
