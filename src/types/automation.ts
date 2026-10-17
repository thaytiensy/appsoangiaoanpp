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

export const ScrapedDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  headings: z.array(z.string()),
  summary: z.string().optional(),
});
export type ScrapedData = z.infer<typeof ScrapedDataSchema>;

export const E2EReportSchema = z.object({
  statusCode: z.number(),
  pageTitle: z.string(),
  loadTimeMs: z.number(),
  buttonCount: z.number(),
  inputCount: z.number(),
  passed: z.boolean(),
  details: z.string(),
});
export type E2EReport = z.infer<typeof E2EReportSchema>;

export const TaskExecutionResultSchema = z.object({
  taskId: z.string(),
  type: z.string(),
  success: z.boolean(),
  durationMs: z.number(),
  screenshotUrl: z.string().optional(),
  scrapedData: ScrapedDataSchema.optional(),
  e2eReport: E2EReportSchema.optional(),
  error: z.string().optional(),
  executedAt: z.string(),
});
export type TaskExecutionResult = z.infer<typeof TaskExecutionResultSchema>;

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
  lastResult: TaskExecutionResultSchema.optional(),
});
export type AutomationTask = z.infer<typeof AutomationTaskSchema>;

export const TaskMetricsSchema = z.object({
  totalTasks: z.number(),
  runningTasks: z.number(),
  successRateAvg: z.number(),
  failedToday: z.number(),
});
export type TaskMetrics = z.infer<typeof TaskMetricsSchema>;

export const ExecuteTaskRequestSchema = z.object({
  taskId: z.string(),
  type: z.enum(["SCREENSHOT", "SCRAPE", "E2E_TEST", "FORM_FILL"]),
  targetUrl: z.string().min(1),
  prompt: z.string().optional(),
});
export type ExecuteTaskRequest = z.infer<typeof ExecuteTaskRequestSchema>;
