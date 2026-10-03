import { z } from 'zod';

export const BloomLevelSchema = z.enum([
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
  'EVALUATE',
  'CREATE'
]);
export type BloomLevel = z.infer<typeof BloomLevelSchema>;

export const LessonObjectiveSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['KNOWLEDGE', 'SKILL', 'ATTITUDE']),
  description: z.string().min(5),
  bloomLevel: BloomLevelSchema
});
export type LessonObjective = z.infer<typeof LessonObjectiveSchema>;

export const ActivityPhaseSchema = z.enum([
  'WARM_UP',       // Khởi động
  'KNOWLEDGE',     // Hình thành kiến thức
  'PRACTICE',      // Luyện tập
  'APPLICATION'    // Vận dụng & Mở rộng
]);
export type ActivityPhase = z.infer<typeof ActivityPhaseSchema>;

export const PedagogicalActivitySchema = z.object({
  id: z.string().uuid(),
  phase: ActivityPhaseSchema,
  title: z.string().min(3),
  durationMinutes: z.number().int().positive(),
  teacherRole: z.string().min(5),
  studentRole: z.string().min(5),
  expectedProduct: z.string().min(3)
});
export type PedagogicalActivity = z.infer<typeof PedagogicalActivitySchema>;

export const SlideLayoutSchema = z.enum([
  'TITLE_HERO',
  'CONCEPT_BREAKDOWN',
  'INTERACTIVE_QUIZ',
  'TIMELINE_PROCESS',
  'COMPARISON_TABLE',
  'SUMMARY_MINDMAP'
]);
export type SlideLayout = z.infer<typeof SlideLayoutSchema>;

export const SlideItemSchema = z.object({
  id: z.string().uuid(),
  slideNumber: z.number().int().positive(),
  layout: SlideLayoutSchema,
  title: z.string().max(80),
  bullets: z.array(z.string().max(120)).max(5),
  teacherScript: z.string().max(300),
  visualSuggestion: z.string().max(150)
});
export type SlideItem = z.infer<typeof SlideItemSchema>;

export const LessonPlanProjectSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(2),
  gradeLevel: z.string().min(1),
  lessonName: z.string().min(3),
  durationPeriod: z.number().int().default(45),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
  departmentName: z.string().optional(),
  themeId: z.string().optional(),
  customBackgroundUrl: z.string().optional(),
  objectives: z.array(LessonObjectiveSchema).min(1),
  activities: z.array(PedagogicalActivitySchema).length(4),
  slides: z.array(SlideItemSchema).min(4),
  updatedAt: z.string().datetime()
});

export type LessonPlanProject = z.infer<typeof LessonPlanProjectSchema>;
