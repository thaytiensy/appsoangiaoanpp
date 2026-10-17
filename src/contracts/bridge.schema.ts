import { z } from 'zod';

export const FileActionSchema = z.object({
  path: z.string().min(1, 'Đường dẫn file không được rỗng'),
  content: z.string(),
  action: z.enum(['create', 'update', 'delete']),
});

export type FileAction = z.infer<typeof FileActionSchema>;

export const GeminiResponseSchema = z.object({
  explanation: z.string(),
  files: z.array(FileActionSchema),
  next_step: z.string(),
});

export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;

export const HandoffReportSchema = z.object({
  status: z.enum(['success', 'failed', 'pending_review']),
  task: z.string(),
  attempt: z.number().int().nonnegative(),
  files_modified: z.array(z.string()),
  errors: z.array(z.string()),
  next_step: z.string(),
});

export type HandoffReport = z.infer<typeof HandoffReportSchema>;
