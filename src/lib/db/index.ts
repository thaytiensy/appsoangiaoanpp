import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqliteDbPath = process.env.DATABASE_URL || 'lesson_planner.db';

const sqlite = new Database(sqliteDbPath);
sqlite.pragma('journal_mode = WAL');

// Tự động khởi tạo bảng lesson_plans & users nếu chưa có
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS lesson_plans (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    lesson_name TEXT NOT NULL,
    duration_period INTEGER NOT NULL DEFAULT 45,
    objectives_json TEXT NOT NULL,
    activities_json TEXT NOT NULL,
    slides_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '0353205414',
    role TEXT NOT NULL DEFAULT 'TEACHER',
    school TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Đảm bảo Quản trị viên Thầy Đỗ Tiến Sỹ (ADMIN) luôn tồn tại
const adminId = '00000000-0000-0000-0000-000000000001';
const adminCheck = sqlite.prepare('SELECT id FROM users WHERE id = ?').get(adminId);
if (!adminCheck) {
  const insertAdmin = sqlite.prepare(`
    INSERT INTO users (id, name, email, phone, role, school, subject, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAdmin.run(
    adminId,
    'Thầy Đỗ Tiến Sỹ',
    'dotiensy.admin@gmail.com',
    '0353205414',
    'ADMIN',
    'THPT Chuyên Lê Hồng Phong',
    'Toán học & Tin học',
    new Date().toISOString()
  );
}

export const db = drizzle(sqlite, { schema });
