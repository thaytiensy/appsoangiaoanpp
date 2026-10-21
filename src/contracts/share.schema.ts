import { z } from 'zod';

export const SharedUserSchema = z.object({
  id: z.string(),
  email: z.string().email('Địa chỉ Gmail không đúng định dạng'),
  role: z.enum(['viewer', 'editor']).default('viewer'),
  sharedAt: z.string(),
  lessonId: z.string(),
  lessonTitle: z.string(),
});

export type SharedUser = z.infer<typeof SharedUserSchema>;

export const ShareRequestSchema = z.object({
  email: z.string().email('Vui lòng nhập đúng địa chỉ Gmail'),
  role: z.enum(['viewer', 'editor']).default('viewer'),
  lessonId: z.string(),
  lessonTitle: z.string(),
});

export type ShareRequest = z.infer<typeof ShareRequestSchema>;
