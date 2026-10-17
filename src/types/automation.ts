import { z } from "zod";

export const AutomationActionTypeSchema = z.enum([
  "scrape",
  "form_fill",
  "screenshot",
  "e2e_test",
]);
export type AutomationActionType = z.infer<typeof AutomationActionTypeSchema>;

export const AutomationStatusSchema = z.enum([
  "idle",
  "running",
  "completed",
  "failed",
  "paused",
]);
export type AutomationStatus = z.infer<typeof AutomationStatusSchema>;

export const AutomationTaskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Tên tác vụ không được để trống"),
  targetUrl: z.string().url("URL không hợp lệ"),
  actionType: AutomationActionTypeSchema,
  status: AutomationStatusSchema,
  scheduleCron: z.string().optional(),
  lastRunAt: z.string().nullable(),
  successRate: z.number().min(0).max(100),
  durationMs: z.number().nonnegative(),
  createdAt: z.string(),
});
export type AutomationTask = z.infer<typeof AutomationTaskSchema>;

export const TaskMetricsSchema = z.object({
  totalTasks: z.number(),
  runningTasks: z.number(),
  successRateAvg: z.number(),
  failedToday: z.number(),
});
export type TaskMetrics = z.infer<typeof TaskMetricsSchema>;
