# PROJECT_STATE: AI PowerPoint Lesson Planner Pro

## 1. Project Overview & Scope
- Target: Ứng dụng tạo giáo án & xuất slide PowerPoint chuẩn sư phạm 2026.
- Tech Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Drizzle ORM, SQLite, PptxGenJS.

## 2. Approved Libraries & Tools
- Core: next, react, react-dom, typescript
- Styling: tailwindcss, lucide-react, clsx, tailwind-merge
- Validation & Data: zod, drizzle-orm, better-sqlite3
- Export & Test: pptxgenjs, @playwright/test

## 3. Data Contracts Locked
- src/types/lesson-plan.ts (BloomLevel, Objectives, 4 Activities, SlideDeck, Teacher, School, Department, Theme)
- src/types/user.ts (User, UserRole, SQLite User Table)
- src/types/template.ts (SlideTheme, Custom Template Upload)

## 4. Completed Modules
- [x] Module 1: Project Scaffolding & State Config
- [x] Module 2: Streamlined Teacher Input Form (Chủ đề, Lớp, Giáo viên, Môn học, Trường, Tổ chuyên môn)
- [x] Module 3: Full GDPT 18 Subjects & Grade 1-12 Pedagogical Engine
- [x] Module 4: Slide Themes & Template Upload (.pptx / Image)
- [x] Module 5: Live 16:9 Slide Preview & Speaker Notes
- [x] Module 6: PptxGenJS Direct Export Service with Dynamic Themes
- [x] Module 7: Playwright Visual Verification & verify.ps1 / verify.sh
- [x] Module 8: Teacher Profile & User Management (SQLite Integrated)
- [x] Module 9: Hotline & Zalo Contact Integration (0353205414)

## 5. Active Task & Safety
- Active: All modules complete, 0 lint/type errors, verified and serving on http://localhost:3000
- Safety Scripts: verify.sh, verify.ps1, HANDOFF.json active
