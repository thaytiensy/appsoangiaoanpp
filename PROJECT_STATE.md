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
- `src/constants/curriculum.ts`:
  - Phân loại 3 cấp học (Tiểu học Lớp 1-5, THCS Lớp 6-9, THPT Lớp 10-12).
  - 100% môn học GDPT 2018 đầy đủ theo quy định Bộ GD&ĐT.
  - Khóa bộ sách giáo khoa duy nhất: "Kết nối tri thức với cuộc sống".
- `src/contracts/app.schema.ts`:
  - `LessonInputSchema`: Thông tin hành chính (Trường, Tổ chuyên môn, GV, Năm học, Ngày soạn/dạy) + Cấu hình bài dạy (Lớp 1-12, Môn học, Tiết PPCT, Thời lượng, Tên bài, Ghi chú).
  - `ObjectivesSchema`: Kiến thức, Năng lực chung, Năng lực đặc thù, Phẩm chất.
  - `MaterialsSchema`: Thiết bị dạy học của Giáo viên và Học sinh.
  - `PedagogicalActivitySchema`: 4 hoạt động CV 5512/2345 (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng) với 4 bước tổ chức (Chuyển giao, Thực hiện, Báo cáo thảo luận, Kết luận nhận định).
  - `SlideItemSchema`: Cấu trúc slide 16:9 (slideNumber, title, bulletPoints, visualNote, speakerNotes).
  - `LessonPlanOutputSchema`: Trọn bộ giáo án và slide tích hợp.
- `src/contracts/bridge.schema.ts`:
  - `FileActionSchema`: `{ path, content, action: "create" | "update" | "delete" }`
  - `GeminiResponseSchema`: `{ explanation, files, next_step }`
  - `HandoffReportSchema`: `{ status, task, attempt, files_modified, errors, next_step }`

## 4. Completed Modules
- [x] Trụ cột 1: Khóa Data Contracts (`src/contracts/app.schema.ts`, `src/contracts/bridge.schema.ts`) & Quản trị trạng thái (`PROJECT_STATE.md`)
- [x] Trụ cột 2: Rào chắn chất lượng tự động 4 tầng (`verify.sh`)
- [x] Trụ cột 3: Cầu nối tự hàn gắn Gemini ⇄ Antigravity (`src/bridge/file-manager.ts`, `src/bridge/gemini-agent.ts`, `src/bridge/console-reporter.ts`, `src/bridge/auto-loop.ts`)
- [x] Trụ cột 4: Giao thức bàn giao (`HANDOFF.json`), UI khởi đầu chuẩn GDPT (`src/app/page.tsx`) & Kiểm tra thị giác (`scripts/visual-check.ts`)
- [x] Tách biệt triệt để cache Webpack: build dùng `.next-verify` độc lập, dev dùng `.next`
- [x] [2026-10-17 23:00:00] Sprint 2: Mở rộng Data Contract GDPT 2018 (Lớp 1-12), độc quyền bộ sách "Kết nối tri thức với cuộc sống", API Gemini sinh giáo án chuẩn CV 5512/2345, giao diện Kế hoạch bài dạy & Slide 16:9 (`src/constants/curriculum.ts`, `src/contracts/app.schema.ts`, `src/components/form-admin-section.tsx`, `src/components/form-lesson-section.tsx`, `src/components/lesson-form.tsx`, `src/components/lesson-plan-document.tsx`, `src/components/slide-preview.tsx`, `src/components/lesson-result.tsx`, `src/app/api/lesson-plan/route.ts`, `src/app/page.tsx`)

## 5. In-Progress & Blockers
- **In-Progress**: Đang chạy `verify.sh` và `npm run visual` xác nhận toàn bộ hệ thống đạt chuẩn xanh.
- **Blockers**: Không có. Toàn bộ mã nguồn tuân thủ 0 any và <= 200 dòng.
