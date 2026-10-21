# PROJECT_STATE: Gemini ⇄ Antigravity Autonomous Loop & Lesson Planner

## 1. Project Overview & Scope
- **Hệ thống**: Hệ thống AI Soạn Giáo Án & Slide PowerPoint Chuẩn Bộ GD kết hợp Cầu nối Tự động hóa Khép kín Hai chiều (Gemini ⇄ Antigravity Autonomous Loop).
- **Mục tiêu**: Tự động hóa chu trình Phát triển ➔ Kiểm định 4 tầng Rào chắn ➔ Tự sửa lỗi (Self-Healing Loop) ➔ Bàn giao nghiệm thu tự động.
- **Kiến trúc**: Clean Slate 4 Trụ cột V3.0 (Data Contract First, Automated Guardrails, Autonomous Bridge, Visual Verification).

## 2. Approved Libraries & Tools
- **Bridge & AI Loop**: `@google/generative-ai`, `zod`, `@playwright/test`, `dotenv`, `tsx`
- **Frontend & App Core**: `next` (15.1.7 / 15.5.27), `react` (19.0.0), `react-dom`, `typescript` (5.7.3), `lucide-react`, `pptxgenjs`, `jszip`
- **Styling**: `tailwindcss` (4.0.6)

## 3. Data Contracts Locked
- `src/contracts/user.schema.ts`:
  - `UserRoleSchema`: `'admin' | 'teacher'`
  - `UserSchema`: `{ id, name, email, avatar, school, subject, role, lessonPlansCreated, lastActive }`
  - `AuthSessionSchema`: `{ user, isAuthenticated }`
- `src/constants/curriculum.ts`:
  - Phân loại 3 cấp học (Tiểu học Lớp 1-5, THCS Lớp 6-9, THPT Lớp 10-12).
  - 100% môn học GDPT 2018 đầy đủ theo quy định Bộ GD&ĐT.
  - Khóa bộ sách giáo khoa duy nhất: "Kết nối tri thức với cuộc sống".
- `src/contracts/app.schema.ts`:
  - `LessonInputSchema`: Thông tin hành chính + Cấu hình bài dạy (Lớp 1-12, Môn học, Tiết PPCT, Thời lượng, Tên bài, Ghi chú).
  - `ObjectivesSchema`: Kiến thức, Năng lực chung, Năng lực đặc thù, Phẩm chất.
  - `MaterialsSchema`: Thiết bị dạy học của Giáo viên và Học sinh.
  - `PedagogicalActivitySchema`: 4 hoạt động CV 5512/2345 (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
  - `SlideItemSchema`: Cấu trúc slide 16:9 (slideNumber, title, bulletPoints, visualNote, speakerNotes).
  - `LessonPlanOutputSchema`: Trọn bộ giáo án và slide tích hợp.
- `src/contracts/bridge.schema.ts`:
  - `FileActionSchema`: `{ path, content, action: "create" | "update" | "delete" }`
  - `GeminiResponseSchema`: `{ explanation, files, next_step }`
  - `HandoffReportSchema`: `{ status, task, attempt, files_modified, errors, next_step }`

## 4. Completed Modules
- [x] Trụ cột 1: Khóa Data Contracts (`src/contracts/app.schema.ts`, `src/contracts/user.schema.ts`, `src/contracts/bridge.schema.ts`) & Quản trị trạng thái (`PROJECT_STATE.md`)
- [x] Trụ cột 2: Rào chắn chất lượng tự động 4 tầng (`verify.sh`)
- [x] Trụ cột 3: Cầu nối tự hàn gắn Gemini ⇄ Antigravity (`src/bridge/file-manager.ts`, `src/bridge/gemini-agent.ts`, `src/bridge/console-reporter.ts`, `src/bridge/auto-loop.ts`)
- [x] Trụ cột 4: Giao thức bàn giao (`HANDOFF.json`), UI khởi đầu chuẩn GDPT (`src/app/page.tsx`) & Kiểm tra thị giác (`scripts/visual-check.ts`)
- [x] Tách biệt triệt để cache Webpack: build dùng `.next-verify` độc lập, dev dùng `.next`
- [x] Sprint 2: Mở rộng Data Contract GDPT 2018 (Lớp 1-12), độc quyền bộ sách "Kết nối tri thức với cuộc sống", API sinh giáo án chuẩn CV 5512/2345, giao diện Kế hoạch bài dạy & Slide 16:9
- [x] Đăng nhập Gmail & Quyền Admin xem bảng điều khiển tổng hợp người dùng (`src/contracts/user.schema.ts`, `src/services/user-service.ts`, `src/components/auth/user-profile-button.tsx`, `src/components/auth/admin-dashboard-modal.tsx`)
- [x] Sprint Tải Giáo Án Word ➔ Tự động bóc tách tạo Slide PowerPoint 16:9:
  - Bóc tách file `.docx` tự động (`src/services/word-parser.ts`, `src/services/word-to-plan.ts`)
  - Kiểm tra chất lượng & lọc sạch trùng lặp slide (`src/services/quality-audit.ts`)
  - Xuất file `.pptx` thật 16:9 (`src/services/pptx-exporter.ts`, `src/components/lesson-result.tsx`)
  - Modal tải file Word kéo thả tiện lợi (`src/components/lesson/word-upload-modal.tsx`)
  - Đồng bộ 1-click lên GitHub repo `thaytiensy/appsoangiaoanpp` & tự động kích hoạt CI/CD Vercel (`src/app/api/deploy/push/route.ts`, `src/components/deploy/cloud-deploy-modal.tsx`, `vercel.json`)
  - Kiểm định 4 tầng `verify.sh` toàn diện đạt 100% chuẩn xanh & commit an toàn lên GitHub origin/master.

## 5. In-Progress & Blockers
- **In-Progress**: Đã hoàn thành toàn diện tính năng tải file Word, lọc tạo slide PowerPoint, lọc trùng lặp và đồng bộ GitHub/Vercel.
- **Blockers**: Không có. Toàn bộ mã nguồn tuân thủ 0 any và <= 200 dòng/file.
