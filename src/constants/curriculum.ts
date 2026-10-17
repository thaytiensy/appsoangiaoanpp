export interface GradeOption {
  readonly id: number;
  readonly label: string;
  readonly stage: 'TIỂU HỌC' | 'THCS' | 'THPT';
}

export const GRADES: readonly GradeOption[] = [
  { id: 1, label: 'Lớp 1', stage: 'TIỂU HỌC' },
  { id: 2, label: 'Lớp 2', stage: 'TIỂU HỌC' },
  { id: 3, label: 'Lớp 3', stage: 'TIỂU HỌC' },
  { id: 4, label: 'Lớp 4', stage: 'TIỂU HỌC' },
  { id: 5, label: 'Lớp 5', stage: 'TIỂU HỌC' },
  { id: 6, label: 'Lớp 6', stage: 'THCS' },
  { id: 7, label: 'Lớp 7', stage: 'THCS' },
  { id: 8, label: 'Lớp 8', stage: 'THCS' },
  { id: 9, label: 'Lớp 9', stage: 'THCS' },
  { id: 10, label: 'Lớp 10', stage: 'THPT' },
  { id: 11, label: 'Lớp 11', stage: 'THPT' },
  { id: 12, label: 'Lớp 12', stage: 'THPT' },
];

export const TEXTBOOKS: readonly string[] = [
  'Kết nối tri thức với cuộc sống',
];

export const ALL_SUBJECTS: readonly string[] = [
  'Toán học',
  'Tiếng Việt',
  'Ngữ văn',
  'Tiếng Anh',
  'Ngoại ngữ 2',
  'Đạo đức',
  'Tự nhiên và Xã hội',
  'Khoa học',
  'Khoa học tự nhiên',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử và Địa lí',
  'Lịch sử',
  'Địa lí',
  'Giáo dục công dân',
  'Giáo dục kinh tế và pháp luật',
  'Tin học',
  'Công nghệ',
  'Tin học và Công nghệ',
  'Giáo dục thể chất',
  'Giáo dục quốc phòng và an ninh',
  'Âm nhạc',
  'Mĩ thuật',
  'Hoạt động trải nghiệm',
  'Hoạt động trải nghiệm - hướng nghiệp',
  'Nội dung giáo dục địa phương',
  'Bài học STEM',
  'Chuyên đề học tập',
];

export function getSubjectsByGrade(grade: number): readonly string[] {
  if (grade <= 5) {
    return [
      'Toán học',
      'Tiếng Việt',
      'Tiếng Anh',
      'Đạo đức',
      'Tự nhiên và Xã hội',
      'Khoa học',
      'Lịch sử và Địa lí',
      'Tin học và Công nghệ',
      'Giáo dục thể chất',
      'Âm nhạc',
      'Mĩ thuật',
      'Hoạt động trải nghiệm',
      'Bài học STEM',
    ];
  }
  if (grade <= 9) {
    return [
      'Toán học',
      'Ngữ văn',
      'Tiếng Anh',
      'Khoa học tự nhiên',
      'Lịch sử và Địa lí',
      'Giáo dục công dân',
      'Tin học',
      'Công nghệ',
      'Giáo dục thể chất',
      'Âm nhạc',
      'Mĩ thuật',
      'Hoạt động trải nghiệm - hướng nghiệp',
      'Nội dung giáo dục địa phương',
      'Bài học STEM',
    ];
  }
  return [
    'Toán học',
    'Ngữ văn',
    'Tiếng Anh',
    'Ngoại ngữ 2',
    'Vật lí',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lí',
    'Giáo dục kinh tế và pháp luật',
    'Tin học',
    'Công nghệ',
    'Giáo dục thể chất',
    'Giáo dục quốc phòng và an ninh',
    'Âm nhạc',
    'Mĩ thuật',
    'Hoạt động trải nghiệm - hướng nghiệp',
    'Nội dung giáo dục địa phương',
    'Chuyên đề học tập',
    'Bài học STEM',
  ];
}
