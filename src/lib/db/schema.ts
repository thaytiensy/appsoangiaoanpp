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

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull().default('0353205414'),
  role: text('role').notNull().default('TEACHER'),
  school: text('school').notNull(),
  subject: text('subject').notNull(),
  createdAt: text('created_at').notNull(),
});

export type LessonPlanDbRow = typeof lessonPlans.$inferSelect;
export type NewLessonPlanDbRow = typeof lessonPlans.$inferInsert;
export type UserDbRow = typeof users.$inferSelect;
export type NewUserDbRow = typeof users.$inferInsert;
