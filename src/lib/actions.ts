'use server';

import { db } from './db';
import { lessonPlans } from './db/schema';
import { eq } from 'drizzle-orm';
import { LessonPlanProject, LessonPlanProjectSchema } from '@/types/lesson-plan';

export async function saveLessonPlanAction(project: LessonPlanProject): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = LessonPlanProjectSchema.parse(project);

    await db
      .insert(lessonPlans)
      .values({
        id: validated.id,
        subject: validated.subject,
        gradeLevel: validated.gradeLevel,
        lessonName: validated.lessonName,
        durationPeriod: validated.durationPeriod,
        objectivesJson: JSON.stringify(validated.objectives),
        activitiesJson: JSON.stringify(validated.activities),
        slidesJson: JSON.stringify(validated.slides),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: lessonPlans.id,
        set: {
          subject: validated.subject,
          gradeLevel: validated.gradeLevel,
          lessonName: validated.lessonName,
          durationPeriod: validated.durationPeriod,
          objectivesJson: JSON.stringify(validated.objectives),
          activitiesJson: JSON.stringify(validated.activities),
          slidesJson: JSON.stringify(validated.slides),
          updatedAt: new Date().toISOString(),
        },
      });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return { success: false, error: message };
  }
}

export async function loadLessonPlanAction(id: string): Promise<LessonPlanProject | null> {
  try {
    const rows = await db.select().from(lessonPlans).where(eq(lessonPlans.id, id)).limit(1);
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    const projectData = {
      id: row.id,
      subject: row.subject,
      gradeLevel: row.gradeLevel,
      lessonName: row.lessonName,
      durationPeriod: row.durationPeriod,
      objectives: JSON.parse(row.objectivesJson),
      activities: JSON.parse(row.activitiesJson),
      slides: JSON.parse(row.slidesJson),
      updatedAt: row.updatedAt,
    };

    return LessonPlanProjectSchema.parse(projectData);
  } catch (err) {
    console.error('Error loading lesson plan:', err);
    return null;
  }
}
