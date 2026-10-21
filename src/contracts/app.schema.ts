import { z } from 'zod';

export const AIProviderSchema = z.enum(['gemini', 'openai', 'claude', 'deepseek', 'builtin']);
export type AIProvider = z.infer<typeof AIProviderSchema>;

export const LessonInputSchema = z.object({
  departmentName: z.string().default(''),
  schoolName: z.string().default(''),
  facultyName: z.string().default(''),
  teacherName: z.string().default(''),
  schoolYear: z.string().default('2026 - 2027'),
  prepareDate: z.string().default(''),
  teachDate: z.string().default(''),
  grade: z.number().int().min(1).max(12),
  subject: z.string().min(1, 'Môn học không được để trống'),
  textbook: z.string().default('Kết nối tri thức với cuộc sống'),
  periodNumber: z.string().default('Tiết 1'),
  durationMinutes: z.number().int().positive().default(45),
  topic: z.string().min(1, 'Tên bài dạy không được để trống'),
  additionalNotes: z.string().default(''),
  aiProvider: AIProviderSchema.default('gemini'),
  aiModel: z.string().default('gemini-2.5-flash'),
  apiKey: z.string().default(''),
});

export type LessonInput = z.infer<typeof LessonInputSchema>;

export const ObjectivesSchema = z.object({
  knowledge: z.string(),
  coreCompetencies: z.string(),
  specificCompetencies: z.string(),
  qualities: z.string(),
});

export type Objectives = z.infer<typeof ObjectivesSchema>;

export const MaterialsSchema = z.object({
  teacherPreparation: z.string(),
  studentPreparation: z.string(),
});

export type Materials = z.infer<typeof MaterialsSchema>;

export const ImplementationStepsSchema = z.object({
  transferTask: z.string(),
  performTask: z.string(),
  reportDiscuss: z.string(),
  concludeJudge: z.string(),
});

export type ImplementationSteps = z.infer<typeof ImplementationStepsSchema>;

export const PedagogicalActivitySchema = z.object({
  stepName: z.string(),
  duration: z.string(),
  objective: z.string(),
  content: z.string(),
  product: z.string(),
  implementation: ImplementationStepsSchema,
});

export type PedagogicalActivity = z.infer<typeof PedagogicalActivitySchema>;

export const SlideItemSchema = z.object({
  slideNumber: z.number().int().positive(),
  title: z.string().min(1, 'Tiêu đề slide không được để trống'),
  bulletPoints: z.array(z.string()).min(1, 'Nội dung slide tối thiểu 1 ý'),
  visualNote: z.string().default(''),
  speakerNotes: z.string().default(''),
  imageUrl: z.string().default(''),
});

export type SlideItem = z.infer<typeof SlideItemSchema>;

export const LessonPlanOutputSchema = z.object({
  id: z.string(),
  metadata: LessonInputSchema,
  objectives: ObjectivesSchema,
  materials: MaterialsSchema,
  activities: z.array(PedagogicalActivitySchema),
  slides: z.array(SlideItemSchema),
  generatedBy: z.string().default('Google Gemini 2.5 Flash'),
  createdAt: z.string(),
});

export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;
