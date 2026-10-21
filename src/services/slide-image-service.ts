export interface SlideImageContext {
  readonly subject: string;
  readonly topic: string;
  readonly slideTitle: string;
  readonly slideNumber: number;
}

interface TopicVisualCollection {
  readonly keywords: string[];
  readonly images: string[];
}

const THANK_YOU_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', // Tri ân & chúc mừng
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80', // Hoa tươi rực rỡ
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', // Lời cảm ơn chân thành
];

const TOPIC_COLLECTIONS: TopicVisualCollection[] = [
  {
    keywords: ['gia đình', 'nhà', 'bố mẹ', 'cha mẹ', 'ông bà', 'family', 'cả nhà'],
    images: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', // Gia đình hạnh phúc
      'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=800&q=80', // Cha mẹ và con cái đọc sách
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=800&q=80', // Bữa cơm gia đình ấm cúng
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80', // Gia đình ngoài trời vui vẻ
    ],
  },
  {
    keywords: ['stem', 'chế tạo', 'mô hình', 'robot', 'lắp ráp', 'sáng tạo'],
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', // Học sinh chế tạo STEM
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', // Thảo luận nhóm STEM
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', // Thực hành công nghệ
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', // Trưng bày sản phẩm sáng tạo
    ],
  },
  {
    keywords: ['toán', 'số', 'phép tính', 'phân số', 'hình học', 'tam giác', 'mệnh đề', 'đại số'],
    images: [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80', // Khối hình học & công thức
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', // Bảng toán học
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80', // Học sinh giải toán
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80', // Thước kẻ compa đồ dùng toán
    ],
  },
  {
    keywords: ['văn', 'thơ', 'đồng dao', 'mùa xuân', 'tiếng việt', 'chữ', 'đọc', 'bài thơ'],
    images: [
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80', // Sách văn học & hoa cỏ
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', // Trang sách mở
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', // Thư viện đọc sách
      'https://images.unsplash.com/photo-1471970471555-19d4b113e9ed?auto=format&fit=crop&w=800&q=80', // Bút mực cổ điển
    ],
  },
  {
    keywords: ['tiếng anh', 'english', 'teenagers', 'skills', 'vocabulary', 'communication'],
    images: [
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80', // Lớp học giao tiếp tiếng Anh
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', // Nhóm bạn học tập
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', // Học sinh quốc tế
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80', // Luyện viết tiếng Anh
    ],
  },
  {
    keywords: ['khtn', 'khoa học tự nhiên', 'tế bào', 'sinh học', 'thực vật', 'động vật'],
    images: [
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80', // Tế bào sinh học
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', // Kính hiển vi phòng lab
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80', // Cây xanh quang hợp
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80', // Khám phá thiên nhiên
    ],
  },
  {
    keywords: ['vật lí', 'lực', 'năng lượng', 'ánh sáng', 'điện', 'chuyển động'],
    images: [
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80', // Khúc xạ ánh sáng
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', // Năng lượng và công nghệ
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', // Thí nghiệm vật lí
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', // Thiết bị đo lường
    ],
  },
  {
    keywords: ['hóa học', 'phản ứng', 'axit', 'nguyên tử', 'dung dịch', 'chất'],
    images: [
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80', // Ống nghiệm hóa học
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80', // Dung dịch phản ứng
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', // Bảng tuần hoàn hóa học
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', // Nghiên cứu thí nghiệm
    ],
  },
  {
    keywords: ['lịch sử', 'địa lí', 'bản đồ', 'kháng chiến', 'văn hóa', 'di tích'],
    images: [
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80', // Bản đồ địa lí thế giới
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80', // Di tích lịch sử cổ kính
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', // Địa hình thiên nhiên
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', // Non sông gấm vóc
    ],
  },
];

const DEFAULT_COLLECTION: string[] = [
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
];

export function getSlideImageUrl(ctx: SlideImageContext): string {
  const lowerTitle = ctx.slideTitle.toLowerCase();
  
  // Slide cuối có lời cảm ơn hoặc tổng kết
  if (lowerTitle.includes('cảm ơn') || lowerTitle.includes('kết thúc') || lowerTitle.includes('chân thành')) {
    const idx = (ctx.slideNumber - 1) % THANK_YOU_IMAGES.length;
    return THANK_YOU_IMAGES[idx] || THANK_YOU_IMAGES[0];
  }

  const textToMatch = `${ctx.topic} ${ctx.subject} ${ctx.slideTitle}`.toLowerCase();

  // Tìm bộ ảnh phù hợp nhất theo từ khóa chủ đề bài học
  const matchedCollection = TOPIC_COLLECTIONS.find((col) =>
    col.keywords.some((kw) => textToMatch.includes(kw))
  );

  const images = matchedCollection ? matchedCollection.images : DEFAULT_COLLECTION;

  // Lấy ảnh tuần tự tương ứng với số thứ tự của Slide (1, 2, 3...)
  const imageIndex = (ctx.slideNumber - 1) % images.length;
  return images[imageIndex] || images[0];
}

export function getAlternativeSlideImage(currentUrl: string, subject: string, topic: string): string {
  const textToMatch = `${topic} ${subject}`.toLowerCase();
  const matchedCollection = TOPIC_COLLECTIONS.find((col) =>
    col.keywords.some((kw) => textToMatch.includes(kw))
  );
  const images = matchedCollection ? matchedCollection.images : DEFAULT_COLLECTION;

  const currentIndex = images.indexOf(currentUrl);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % images.length : 1;
  return images[nextIndex] || images[0];
}
