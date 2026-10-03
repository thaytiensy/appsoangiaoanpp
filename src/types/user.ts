import { z } from 'zod';

export const UserRoleSchema = z.enum(['TEACHER', 'HEAD_OF_DEPARTMENT', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().default('0353205414'),
  role: UserRoleSchema.default('TEACHER'),
  school: z.string().min(2),
  subject: z.string().min(2),
  avatarUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
