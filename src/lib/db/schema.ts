import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const lessonPlans = sqliteTable('lesson_plans', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  gradeLevel: text('grade_level').notNull(),
  lessonName: text('lesson_name').notNull(),
  durationPeriod: integer('duration_period').notNull().default(45),
  objectivesJson: text('objectives_json').notNull(),
  activitiesJson: text('activities_json').notNull(),
  slidesJson: text('slides_json').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type LessonPlanDbRow = typeof lessonPlans.$inferSelect;
export type NewLessonPlanDbRow = typeof lessonPlans.$inferInsert;
