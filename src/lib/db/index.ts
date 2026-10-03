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

// Seed default teacher if users table is empty
const countStmt = sqlite.prepare('SELECT count(*) as count FROM users');
const row = countStmt.get() as { count: number };
if (row.count === 0) {
  const insertUser = sqlite.prepare(`
    INSERT INTO users (id, name, email, phone, role, school, subject, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    '11111111-2222-3333-4444-555555555555',
    'Thầy Nguyễn Văn An',
    'nguyenvanan.edu@gmail.com',
    '0353205414',
    'HEAD_OF_DEPARTMENT',
    'THPT Chuyên Lê Hồng Phong',
    'Tin học & Công nghệ số',
    new Date().toISOString()
  );
}

export const db = drizzle(sqlite, { schema });
