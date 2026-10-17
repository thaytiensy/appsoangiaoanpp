import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'teacher']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không đúng định dạng'),
  avatar: z.string().default(''),
  school: z.string().default('Trường THCS & THPT Chu Văn An'),
  subject: z.string().default('Toán học'),
  role: UserRoleSchema,
  lessonPlansCreated: z.number().int().nonnegative().default(0),
  lastActive: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthSessionSchema = z.object({
  user: UserSchema.nullable(),
  isAuthenticated: z.boolean(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;
