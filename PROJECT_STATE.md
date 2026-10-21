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
- `src/contracts/share.schema.ts`:
  - `SharedUserSchema`: `{ id, email, role: 'viewer' | 'editor', sharedAt, lessonId, lessonTitle }`
  - `ShareRequestSchema`: `{ email, role, lessonId, lessonTitle }`
- `src/constants/curriculum.ts`:
  - Phân loại 3 cấp học (Tiểu học Lớp 1-5, THCS Lớp 6-9, THPT Lớp 10-12).
  - 100% môn học GDPT 2018 đầy đủ theo quy định Bộ GD&ĐT.
  - Khóa bộ sách giáo khoa duy nhất: "Kết nối tri thức với cuộc sống".
- `src/constants/ai-models.ts`:
  - Danh mục 5 Động cơ AI: Google Gemini 2.5 Flash, OpenAI ChatGPT (GPT-4o), Anthropic Claude 3.5 Sonnet, DeepSeek V3 / R1 Reasoner, AI Sư Phạm Tích Hợp (Offline).
- `src/contracts/app.schema.ts`:
  - `AIProviderSchema`: `'gemini' | 'openai' | 'claude' | 'deepseek' | 'builtin'`
  - `LessonInputSchema`: Mở rộng thêm `aiProvider`, `aiModel`, `apiKey` (tùy chọn).
  - `LessonPlanOutputSchema`: Thêm `generatedBy` hiển thị nhãn mô hình AI đã soạn bài.
- `src/contracts/bridge.schema.ts`:
  - `FileActionSchema`: `{ path, content, action: "create" | "update" | "delete" }`
  - `GeminiResponseSchema`: `{ explanation, files, next_step }`
  - `HandoffReportSchema`: `{ status, task, attempt, files_modified, errors, next_step }`

## 4. Completed Modules
- [x] Trụ cột 1: Khóa Data Contracts & Quản trị trạng thái (`PROJECT_STATE.md`)
- [x] Trụ cột 2: Rào chắn chất lượng tự động 4 tầng (`verify.sh`)
- [x] Trụ cột 3: Cầu nối tự hàn gắn Gemini ⇄ Antigravity (`src/bridge/`)
- [x] Trụ cột 4: Giao thức bàn giao (`HANDOFF.json`), UI khởi đầu chuẩn GDPT & Kiểm tra thị giác
- [x] Tách biệt triệt để cache Webpack: build dùng `.next-verify` độc lập, dev dùng `.next`
- [x] Sprint Đăng nhập Gmail & Quyền Admin:
  - Tên admin: `admin`, Gmail admin: `chuotbachchise@gmail.com`
  - Quản trị viên theo dõi toàn bộ danh sách giáo viên & kế hoạch bài dạy đã tạo.
- [x] Sprint Làm sạch Form nhập liệu (Ô trắng) & Cấu trúc 8 Slide chi tiết (Slide 1 Chào mừng & Slide 8 Cảm ơn).
- [x] Sprint Tải File Word Mẫu (.docx) tạo Slide tự động.
- [x] **Sprint Tích Hợp Đa Động Cơ AI (Multi-AI Engine Architecture)**:
  - Bổ sung `src/constants/ai-models.ts` định nghĩa 5 mô hình:
    1. ⚡ **Google Gemini 2.5 Flash**: Khuyên dùng, phản hồi siêu tốc, tối ưu CV 5512/2345.
    2. 🧠 **OpenAI ChatGPT (GPT-4o)**: Sáng tạo cao, mở rộng hoạt động phong phú.
    3. 🎭 **Anthropic Claude 3.5 Sonnet**: Văn phong sư phạm mẫu mực, tinh tế.
    4. 🚀 **DeepSeek V3 / R1 Reasoner**: Tư duy logic sâu sắc, tối ưu Toán học & STEM.
    5. 🛡️ **AI Sư Phạm Tích Hợp (Offline)**: 100% miễn phí, chạy độc lập không cần API key.
  - Xây dựng component `src/components/ai/form-ai-section.tsx` hiển thị trực quan các thẻ AI kèm thông tin nổi bật và ô tùy chọn khóa API cá nhân.
  - Xây dựng bộ định tuyến `src/services/ai-router.ts` điều phối linh hoạt giữa các AI hoặc tự động fallback an toàn sang Động cơ Sư phạm Tích hợp.
  - Hiển thị huy hiệu Động cơ AI đã sử dụng trên thanh công cụ của `LessonResult`.
  - Kiểm định 4 tầng `verify.sh` thành công 100%, commit & push GitHub `origin/master`.

## 5. In-Progress & Blockers
- **In-Progress**: Đã hoàn thành 100% tất cả các yêu cầu.
- **Blockers**: Không có. Toàn bộ mã nguồn tuân thủ 0 any và <= 200 dòng/file.
