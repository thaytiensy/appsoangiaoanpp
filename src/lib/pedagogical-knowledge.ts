export interface SubjectTemplate {
  subject: string;
  defaultTopics: string[];
  warmUpPrefix: string;
  knowledgePrefix: string;
  practicePrefix: string;
  applicationPrefix: string;
}

export const ALL_GDPT_SUBJECTS: string[] = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Tin học',
  'Khoa học tự nhiên',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử & Địa lí',
  'Lịch sử',
  'Địa lí',
  'Công nghệ',
  'Giáo dục Kinh tế & Pháp luật',
  'Giáo dục công dân',
  'Âm nhạc',
  'Mĩ thuật',
  'Giáo dục thể chất',
  'Hoạt động trải nghiệm, hướng nghiệp',
  'Giáo dục Quốc phòng và An ninh',
];

export const ALL_GRADES: string[] = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
  'Lớp 10', 'Lớp 11', 'Lớp 12',
];

export const SUBJECT_PRESETS: Record<string, SubjectTemplate> = {
  'Toán học': {
    subject: 'Toán học',
    defaultTopics: [
      'Phương trình bậc hai và Ứng dụng thực tế',
      'Hình học không gian: Mặt cầu và Thể tích khối tròn xoay',
      'Xác suất có điều kiện và Phân tích quyết định',
      'Đạo hàm và Khảo sát sự biến thiên của hàm số',
    ],
    warmUpPrefix: 'Thử thách đố vui toán học & Câu đố logic tình huống',
    knowledgePrefix: 'Hình thành định nghĩa, chứng minh định lý trực quan',
    practicePrefix: 'Luyện tập giải toán đa cấp độ từ cơ bản đến nâng cao',
    applicationPrefix: 'Mô hình hóa bài toán thực tiễn bằng công cụ toán học',
  },
  'Ngữ văn': {
    subject: 'Ngữ văn',
    defaultTopics: [
      'Nghệ thuật xây dựng hình tượng người lính trong thơ hiện đại',
      'Kỹ năng viết bài văn nghị luận xã hội về trách nhiệm thế hệ trẻ',
      'Đặc trưng thể loại Truyện ngắn Việt Nam hiện đại',
      'Kỹ năng đọc hiểu văn bản thông tin và tranh biện đa chiều',
    ],
    warmUpPrefix: 'Thưởng thức âm nhạc/hình ảnh tư liệu truyền cảm hứng',
    knowledgePrefix: 'Đọc hiểu sâu tác phẩm, giải mã tầng nghĩa nghệ thuật',
    practicePrefix: 'Viết đoạn văn phân tích và cảm thụ ngôn từ nghệ thuật',
    applicationPrefix: 'Sáng tạo sản phẩm truyền thông: Poster, Kịch bản, Podcast',
  },
  'Tiếng Anh': {
    subject: 'Tiếng Anh',
    defaultTopics: [
      'Unit 1: Life Stories and Inspirational Figures',
      'Unit 2: Protecting the Global Environment and Eco-lifestyle',
      'Unit 3: Artificial Intelligence in Modern Education',
      'Unit 4: Cultural Diversity and Global Integration',
    ],
    warmUpPrefix: 'Interactive Warm-up game: Kahoot / Word Cloud / Quiz',
    knowledgePrefix: 'Vocabulary in context, Grammar focus & Reading discovery',
    practicePrefix: 'Pair work / Role-play / Sentence restructuring drills',
    applicationPrefix: 'Group presentation & Mini debate on the lesson topic',
  },
  'Tin học': {
    subject: 'Tin học',
    defaultTopics: [
      'Trí tuệ nhân tạo và Đạo đức số trong đời sống',
      'Thuật toán sắp xếp và tìm kiếm nâng cao với Python',
      'An toàn thông tin và Bảo mật dữ liệu cá nhân trên mạng',
      'Thiết kế cơ sở dữ liệu quan hệ và Truy vấn SQL cơ bản',
    ],
    warmUpPrefix: 'Trò chơi Turing tương tác & Tình huống công nghệ số',
    knowledgePrefix: 'Khám phá mô hình dữ liệu, nguyên lý giải thuật',
    practicePrefix: 'Thực hành viết mã nguồn và gỡ lỗi thuật toán',
    applicationPrefix: 'Xây dựng dự án phần mềm giải quyết nhu cầu đời sống',
  },
};
