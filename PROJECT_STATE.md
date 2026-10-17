# PROJECT_STATE: Gemini ⇄ Antigravity Autonomous Loop & Lesson Planner

## 1. Project Overview & Scope
- **Hệ thống**: Hệ thống AI Soạn Giáo Án & Slide PowerPoint Chuẩn Bộ GD kết hợp Cầu nối Tự động hóa Khép kín Hai chiều (Gemini ⇄ Antigravity Autonomous Loop).
- **Mục tiêu**: Tự động hóa chu trình Phát triển ➔ Kiểm định 4 tầng Rào chắn ➔ Tự sửa lỗi (Self-Healing Loop) ➔ Bàn giao nghiệm thu tự động.
- **Kiến trúc**: Clean Slate 4 Trụ cột (Data Contract First, Automated Guardrails, Autonomous Bridge, Visual Verification).

## 2. Approved Libraries & Tools
- **Bridge & AI Loop**: `@google/generative-ai`, `zod`, `@playwright/test`, `dotenv`, `tsx`
- **Frontend & App Core**: `next` (15.1.7), `react` (19.0.0), `react-dom`, `typescript` (5.7.3), `lucide-react`
- **Styling**: `tailwindcss` (4.0.6)

## 3. Data Contracts Locked
- `src/contracts/app.schema.ts`:
  - `LessonInputSchema`: `{ subject, grade, topic, durationMinutes }`
  - `ActivitySchema`: `{ stepName, objective, teacherAction, studentAction, product }`
  - `SlideItemSchema`: `{ slideNumber, title, bulletPoints, visualNote }`
  - `LessonPlanOutputSchema`: `{ id, metadata, activities, slides, createdAt }`
- `src/contracts/bridge.schema.ts`:
  - `FileActionSchema`: `{ path, content, action: "create" | "update" | "delete" }`
  - `GeminiResponseSchema`: `{ explanation, files, next_step }`
  - `HandoffReportSchema`: `{ status, task, attempt, files_modified, errors, next_step }`

## 4. Completed Modules
- [x] Clean Slate Reset & Cấu trúc thư mục mới (`src/contracts/`, `src/bridge/`, `src/services/`, `src/components/`, `src/app/`)
- [x] Khóa Data Contracts (`src/contracts/app.schema.ts`, `src/contracts/bridge.schema.ts`)

## 5. In-Progress & Blockers
- **In-Progress**: Thiết lập Trụ cột 2 (verify.sh), Trụ cột 3 (src/bridge/), Trụ cột 4 (Visual check & UI baseline).
- **Blockers**: Không có. Toàn bộ mã nguồn tuân thủ 0 any và <= 200 dòng.
