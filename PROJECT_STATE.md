# PROJECT_STATE: Gemini ⇄ Antigravity Autonomous Loop V2.1 & Lesson Planner Pro

## 1. Project Overview & Scope
- **Hệ thống**: Cầu nối Tự động hóa Khép kín Hai chiều (Gemini ⇄ Antigravity Autonomous Loop V2.1) với cơ chế Báo cáo Trực tiếp tại Terminal.
- **Ứng dụng chủ lực**: AI PowerPoint Lesson Planner Pro chuẩn GDPT 2026 và Antigravity Studio.
- **Mục tiêu**: Tự động hóa chu trình Phát triển ➔ Kiểm thử ➔ Tự sửa lỗi (Self-Healing Loop) ➔ Báo cáo nghiệm thu hoặc Blocker tự động tối đa 5 vòng lặp.

## 2. Approved Libraries & Tools
- **Bridge & AI Loop**: `@google/generative-ai`, `zod`, `@playwright/test`, `dotenv`, `tsx`
- **Frontend & App Core**: `next` (15.1.7), `react` (19.0.0), `react-dom`, `typescript` (5.7.3)
- **Styling & UI**: `tailwindcss` (4.0.6), `lucide-react`, `clsx`, `tailwind-merge`
- **Data & Export**: `drizzle-orm`, `better-sqlite3`, `pptxgenjs`, `zustand`

## 3. Data Contracts Locked
- `src/contracts/bridge.schema.ts`:
  - `FileActionSchema`: Thao tác file `{ path, content, action: "create" | "update" | "delete" }`
  - `GeminiResponseSchema`: Phản hồi cấu trúc `{ explanation, files, next_step }`
  - `HandoffReportSchema`: Biên bản bàn giao `{ status, task, attempt, files_modified, errors, next_step }`
- `HANDOFF.json`: Bàn giao trạng thái máy đọc giữa các vòng lặp tự động.

## 4. Completed Modules
- [x] Module 0: Data Contracts & Bridge Schemas (`src/contracts/bridge.schema.ts`)
- [x] Module 1: AI PowerPoint Lesson Planner Pro (18 GDPT Subjects, 16:9 Live Preview, PPTX Export)
- [x] Module 2: Role-based User Management & Privacy Protection (Admin Thầy Đỗ Tiến Sỹ)
- [x] Module 3: Multi-track Timeline & Studio Video Editor
- [x] Module 4: Console Reporter & Safe File Manager (`src/bridge/console-reporter.ts`, `src/bridge/file-manager.ts`)
- [x] Module 5: Gemini Agent & Autonomous Self-Healing Loop (`src/bridge/gemini-agent.ts`, `src/bridge/auto-loop.ts`)
- [x] Module 6: 4-Tier Guardrail Verification & Visual Check (`verify.sh`, `scripts/visual-check.ts`)

## 5. In-Progress & Blockers
- **In-Progress**: Đang hoàn tất kiểm tra và chốt Checkpoint an toàn đầu tiên qua `bash verify.sh`.
- **Blockers**: Không có. Toàn bộ file mã nguồn tuân thủ <= 200 dòng và 0 vi phạm kiểu any.
