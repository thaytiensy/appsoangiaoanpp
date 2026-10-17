import { z } from 'zod';

export const LessonInputSchema = z.object({
  subject: z.string().min(1, 'Môn học không được để trống'),
  grade: z.number().int().min(1).max(12),
  topic: z.string().min(1, 'Chủ đề bài dạy không được để trống'),
  durationMinutes: z.number().int().positive().default(45),
});

export type LessonInput = z.infer<typeof LessonInputSchema>;

export const ActivitySchema = z.object({
  stepName: z.string().min(1, 'Tên hoạt động không được để trống'),
  objective: z.string().min(1, 'Mục tiêu không được để trống'),
  teacherAction: z.string().min(1, 'Hoạt động của giáo viên không được để trống'),
  studentAction: z.string().min(1, 'Hoạt động của học sinh không được để trống'),
  product: z.string().min(1, 'Sản phẩm học tập không được để trống'),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const SlideItemSchema = z.object({
  slideNumber: z.number().int().positive(),
  title: z.string().min(1, 'Tiêu đề slide không được để trống'),
  bulletPoints: z.array(z.string()).min(1, 'Nội dung slide tối thiểu 1 ý'),
  visualNote: z.string().default(''),
});

export type SlideItem = z.infer<typeof SlideItemSchema>;

export const LessonPlanOutputSchema = z.object({
  id: z.string(),
  metadata: LessonInputSchema,
  activities: z.array(ActivitySchema),
  slides: z.array(SlideItemSchema),
  createdAt: z.string(),
});

export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;
