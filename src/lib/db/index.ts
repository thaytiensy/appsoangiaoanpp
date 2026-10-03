import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqliteDbPath = process.env.DATABASE_URL || 'lesson_planner.db';

const sqlite = new Database(sqliteDbPath);
sqlite.pragma('journal_mode = WAL');

// Tự động khởi tạo bảng nếu chưa có
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
`);

export const db = drizzle(sqlite, { schema });
