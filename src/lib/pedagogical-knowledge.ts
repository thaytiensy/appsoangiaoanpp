import { BloomLevel } from '@/types/lesson-plan';

export interface SubjectTemplate {
  subject: string;
  defaultTopics: string[];
  warmUpPrefix: string;
  knowledgePrefix: string;
  practicePrefix: string;
  applicationPrefix: string;
}

export const SUBJECT_PRESETS: Record<string, SubjectTemplate> = {
  'Tin học': {
    subject: 'Tin học & Công nghệ số',
    defaultTopics: [
      'Trí tuệ nhân tạo và Đạo đức số trong đời sống',
      'Thuật toán sắp xếp và tìm kiếm nâng cao',
      'An toàn thông tin và Bảo mật dữ liệu cá nhân',
      'Lập trình hướng đối tượng với Python',
    ],
    warmUpPrefix: 'Trò chơi tương tác số & Tình huống thực nghiệm',
    knowledgePrefix: 'Khám phá mô hình dữ liệu và nguyên lý thuật toán',
    practicePrefix: 'Thực hành giải quyết bài toán mã nguồn',
    applicationPrefix: 'Dự án công nghệ ứng dụng giải quyết vấn đề cộng đồng',
  },
  'Toán học': {
    subject: 'Toán học',
    defaultTopics: [
      'Phương trình bậc hai và Ứng dụng thực tế',
      'Hình học không gian: Vị trí tương đối của đường thẳng và mặt phẳng',
      'Xác suất có điều kiện và Phân tích quyết định',
      'Đạo hàm và Bài toán tối ưu hóa trong kinh tế',
    ],
    warmUpPrefix: 'Thử thách đố vui hình học & Nghịch lý toán học',
    knowledgePrefix: 'Xây dựng định lý và chứng minh trực quan',
    practicePrefix: 'Luyện tập giải toán đa dạng theo nhóm',
    applicationPrefix: 'Mô hình hóa bài toán thực tiễn bằng công cụ toán học',
  },
  'Ngữ văn': {
    subject: 'Ngữ văn',
    defaultTopics: [
      'Nghệ thuật xây dựng nhân vật trong Truyện Kiều',
      'Kỹ năng viết bài văn nghị luận xã hội về lối sống đẹp',
      'Đặc trưng thể loại Thơ hiện đại qua tác phẩm Đất Nước',
      'Kỹ năng thuyết trình và tranh biện trước đám đông',
    ],
    warmUpPrefix: 'Xem video tư liệu truyền cảm hứng & Bày tỏ cảm xúc ban đầu',
    knowledgePrefix: 'Đọc hiểu văn bản và giải mã các tầng ý nghĩa nghệ thuật',
    practicePrefix: 'Viết đoạn văn cảm nhận & Phân tích nghệ thuật ngôn từ',
    applicationPrefix: 'Sáng tạo sản phẩm nghệ thuật: Kịch bản / Poster thông điệp',
  },
  'Khoa học tự nhiên': {
    subject: 'Khoa học tự nhiên (Lý - Hóa - Sinh)',
    defaultTopics: [
      'Định luật vạn vật hấp dẫn và Chuyển động vệ tinh',
      'Phản ứng oxi hóa - khử và Ứng dụng trong pin năng lượng',
      'Quang hợp ở thực vật và Vai trò điều hòa sinh quyển',
      'Di truyền học Mendel và Công nghệ biến đổi gen',
    ],
    warmUpPrefix: 'Thí nghiệm mở đầu kích thích trí tò mò khoa học',
    knowledgePrefix: 'Quan sát hiện tượng và đúc kết quy luật tự nhiên',
    practicePrefix: 'Giải bài tập định lượng và phân tích bảng số liệu thực nghiệm',
    applicationPrefix: 'Đề xuất giải pháp bảo vệ môi trường và ứng dụng xanh',
  },
};
