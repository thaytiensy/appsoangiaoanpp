'use server';

import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { User, UserSchema, UserRole } from '@/types/user';

export async function getUsersAction(): Promise<User[]> {
  try {
    const rows = await db.select().from(users);
    return rows.map((r) =>
      UserSchema.parse({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        role: r.role as UserRole,
        school: r.school,
        subject: r.subject,
        createdAt: r.createdAt,
      })
    );
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

export async function saveUserAction(user: User): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = UserSchema.parse(user);
    await db
      .insert(users)
      .values({
        id: validated.id,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        role: validated.role,
        school: validated.school,
        subject: validated.subject,
        createdAt: validated.createdAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          role: validated.role,
          school: validated.school,
          subject: validated.subject,
        },
      });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return { success: false, error: message };
  }
}

export async function deleteUserAction(id: string): Promise<{ success: boolean }> {
  try {
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  } catch (err) {
    console.error('Error deleting user:', err);
    return { success: false };
  }
}
