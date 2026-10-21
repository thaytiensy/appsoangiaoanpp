export interface SlideImageContext {
  readonly subject: string;
  readonly topic: string;
  readonly slideTitle: string;
  readonly slideNumber: number;
}

const SUBJECT_KEYWORDS: Record<string, string> = {
  'Toán học': 'mathematics geometry formulas diagrams clean white background textbook style',
  'Ngữ văn': 'vietnamese literature book feather ink library clean bright aesthetic',
  'Tiếng Anh': 'english education global communication vocabulary clean graphic design',
  'Khoa học tự nhiên': 'natural science laboratory experiment biology chemistry clean',
  'Vật lí': 'physics mechanics optics electricity scientific diagram clean white backdrop',
  'Hóa học': 'chemistry molecules test tubes molecular structure clean modern vector',
  'Sinh học': 'biology cell structure genetics ecology botany clean educational vector',
  'Lịch sử': 'world history artifacts vintage parchment historical architecture clean',
  'Địa lí': 'geography world globe topography map climate diagram clean educational',
  'Tin học': 'computer science algorithms programming flowchart clean modern tech',
  'Công nghệ': 'technology engineering design modern mechanisms clean vector',
  'Giáo dục công dân': 'citizenship ethics community teamwork bright friendly illustration',
};

const CURATED_FALLBACKS: Record<string, string> = {
  'Toán học': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
  'Ngữ văn': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
  'Tiếng Anh': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
  'Khoa học tự nhiên': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  'Vật lí': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
  'Hóa học': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
  'Sinh học': 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
  'Lịch sử': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
  'Địa lí': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
  'Tin học': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80';

export function getSlideImageUrl(ctx: SlideImageContext): string {
  const subjectKey = Object.keys(SUBJECT_KEYWORDS).find((s) => ctx.subject.includes(s)) || 'Toán học';
  const keyword = SUBJECT_KEYWORDS[subjectKey] || 'education classroom';

  // Tạo prompt chuyên biệt cho Pollinations AI
  const cleanTitle = ctx.slideTitle.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9\s]/g, ' ').trim();
  const cleanTopic = ctx.topic.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9\s]/g, ' ').trim();
  
  const prompt = `educational classroom diagram illustration for ${ctx.subject}, topic ${cleanTopic}, slide ${ctx.slideNumber} ${cleanTitle}, ${keyword}, clean minimalist vector, 16:9 aspect ratio, light white background, highly detailed`;

  // Sử dụng Pollinations AI sinh ảnh trực tiếp từ prompt không cần API key
  const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${ctx.slideNumber * 77 + 13}`;

  return aiUrl;
}

export function getFallbackImageUrl(subject: string): string {
  const matchedKey = Object.keys(CURATED_FALLBACKS).find((s) => subject.includes(s));
  return matchedKey ? CURATED_FALLBACKS[matchedKey] : DEFAULT_IMAGE;
}
