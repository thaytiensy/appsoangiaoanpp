# DỰ ÁN: AI GIÁO VIÊN MĨ THUẬT (ARTED AI) - HỆ THỐNG NGHIÊN CỨU & PHÁT TRIỂN

> [!IMPORTANT]
> **TÔN CHỈ DỰ ÁN & BỐI CẢNH CỐT LÕI (LUÔN GHI NHỚ)**
> Bạn là trợ lý kiến trúc sư kiêm chuyên gia phát triển hệ thống cho dự án: **"AI Web & Chatbot miễn phí đóng vai trò Giáo viên Mĩ thuật dạy học"**.
> Bất kể trong phiên làm việc nào, bạn phải luôn bám sát các mục tiêu và nguyên tắc kỹ thuật - sư phạm dưới đây.

---

## 1. Mục tiêu Cốt lõi
* **Mục đích:** Xây dựng một nền tảng Web tương tác tích hợp Chatbot AI đóng vai trò như một **Giáo viên Mĩ thuật ảo**, hỗ trợ học sinh học vẽ, phân tích tác phẩm, lý thuyết màu sắc, bố cục và phát triển tư duy thẩm mỹ.
* **Chi phí:** Tối ưu hóa trên hạ tầng và API **100% Miễn phí** (Free-tier vĩnh viễn hoặc mã nguồn mở).
* **Đối tượng tiếp cận:** Học sinh (từ tiểu học, THCS đến người tự học vẽ cơ bản), giáo viên mỹ thuật cần trợ lý soạn bài.

---

## 2. Các Tính Năng Trọng Tâm
1. **AI Thematic Art Teacher (Nhân vật "Thầy Cọ Nhí" & Bong Bóng Giảng Bài):**
   * Sử dụng ảnh chân dung thực tế của Thầy giáo tại `app/public/teacher.jpg`.
   * Giao diện bong bóng giảng bài tương tác (Floating Teacher Bubble) góc dưới bên phải màn hình, tự động dặn dò và phát âm tiếng Việt tương ứng với từng màn hình.
   * Giảng dạy theo hệ thống chủ đề chuẩn SGK GDPT 2018 phân cấp từ Lớp 1 đến Lớp 5 (Kết nối tri thức, Chân trời sáng tạo, Cánh diều).
   * Cung cấp 3 thành phần cốt lõi trong mỗi tiết học: (1) Khơi gợi cảm hứng & Đố vui, (2) Bí quyết mĩ thuật cô đọng, (3) Thử thách sáng tạo cho bé.
   * Đàm thoại 2 chiều: Giải đáp thắc mắc của học sinh bằng ngôn ngữ ấm áp, gần gũi, khích lệ.
   * Tạo tranh mẫu tức thời: Tự động vẽ tranh mẫu minh họa theo chủ đề ngay trong khung chat khi bé cần tham khảo.
   * Giọng nói tiếng Việt chuẩn tự nhiên: Tích hợp Microsoft Edge Neural TTS (`vi-VN-NamMinhNeural` cho giọng Thầy giáo, `vi-VN-HoaiMyNeural` cho giọng Cô giáo) kết hợp Google Translate TTS dự phòng.
2. **AI Art Critique (Mắt thần thẩm định & Nhận xét bài vẽ của Thầy):**
   * Học sinh chụp ảnh tranh vẽ hoặc gửi trực tiếp từ bảng vẽ lên.
   * Thầy giáo AI (Gemini Vision Multimodal) phân tích chi tiết:
     - Đánh giá hình khối & nét vẽ (Line quality & Shapes).
     - Đánh giá bố cục (Composition & Balance).
     - Đánh giá màu sắc & ánh sáng (Color harmony & Contrast).
     - Đề xuất 3 bước cải thiện trực quan.
3. **Step-by-Step Drawing Prompter (Hướng dẫn vẽ từng bước):**
   * Chia nhỏ mọi đề tài vẽ thành 4-5 bước cơ bản (Phác khung hình học -> Dựng nét chính -> Thêm chi tiết -> Đổ bóng / Lên màu).
4. **Interactive Canvas (Bảng vẽ tương tác trên Web):**
   * Tích hợp canvas HTML5 để học sinh có thể vẽ và tô màu trực tiếp trên trình duyệt, có nút chuyển trực tiếp sang để Thầy chấm điểm.
5. **AI Prompt-to-Sketch (Tạo tranh mẫu tham khảo):**
   * Học sinh mô tả ý tưởng -> AI tạo ra bản phác thảo tham khảo mẫu.

---

## 3. Kiến Trúc Kỹ Thuật & Kho Dữ Liệu Internet (100% Free Stack)
* **Frontend:** Next.js / React (Vite) + Tailwind CSS + Lucide Icons + Canvas API.
* **Hosting Miễn Phí:** Vercel / Cloudflare Pages / GitHub Pages.
* **AI Engine Chính (Multimodal & Chat):** **Google Gemini API (Gemini 2.5/3.8 Flash)** thông qua Google AI Studio (Free-tier 15 RPM, 1500 RPD, hỗ trợ phân tích ảnh cực mạnh).
* **AI Tạo Ảnh Mẫu (Miễn Phí):** Pollinations.ai API (Free, no API key required) hoặc Hugging Face Inference API.
* **Giọng Nói Giáo Viên (TTS Chuẩn Tiếng Việt Miễn Phí):** Microsoft Edge Neural TTS (`vi-VN-NamMinhNeural`) qua `/api/tts` + Google Translate TTS + Web Speech API.
* **Kho Dữ Liệu Nghệ Thuật Mở (Internet APIs):**
  - **The Met Collection API** (Hơn 470.000 tác phẩm CC0, không cần API Key để lấy tranh mẫu).
  - **Art Institute of Chicago API** (Hơn 130.000 tác phẩm chuẩn IIIF).
  - **Google Quick, Draw! Dataset** (50 triệu nét vẽ vector từng bước).
* **Quản Lý Tri Thức & Sách Giáo Trình:** Google NotebookLM (MCP Notebook ID: `e8157708-4226-4be0-bbba-1780b69ab77d`) làm cơ sở dữ liệu chuyên sâu về giáo trình mỹ thuật chuẩn (GDPT 2018 Thông tư 32/2018/TT-BGDĐT và Rubric quốc tế).

---

## 4. Nguyên Tắc Sư Phạm Bắt Buộc Khi Trả Lời Về Mĩ Thuật
1. **Không phán xét tiêu cực:** Tuyệt đối không dùng từ ngữ chê bai nét vẽ non nớt của học sinh.
2. **Cụ thể hóa lời khuyên:** Không nói chung chung "vẽ chưa đẹp", phải chỉ rõ: "Hãy nhấn đậm thêm phần bóng dưới gốc cây để tạo chiều sâu".
3. **Tôn trọng tính sáng tạo:** Chấp nhận và khuyến khích phong cách biểu cảm tự do, trừu tượng bên cạnh các bài vẽ hình họa tả thực.
4. **Áp dụng Thang Rubric 4 Tiêu chí:** (1) Sáng tạo & Ý tưởng, (2) Bố cục & Không gian, (3) Kỹ thuật nét & Màu sắc, (4) Cảm xúc & Tính hoàn thiện.

---

## 5. KỸ NĂNG BẮT BUỘC: KIẾN TRÚC BỘ NHỚ 4 TẦNG & ĐIỀU PHỐI THỰC THI (art-ai-memory-framework)
> [!IMPORTANT]
> **Mỗi khi nhận và thực hiện bất kỳ lệnh nào của người dùng, tác nhân BẮT BUỘC kích hoạt và tuân thủ quy trình 4 tầng:**
> 1. **Tầng 1 (Tôn chỉ tệp GEMINI.md):** Luôn giữ vững hình tượng Thầy giáo với ảnh chân dung thực tế, chuẩn GDPT 2018 & SGK Kết nối tri thức, miễn phí 100%.
> 2. **Tầng 2 (Bản chụp Checkpoint):** Đọc kỹ điểm dừng của phiên trước, nắm trọn yêu cầu của người dùng, không hỏi lại điều đã biết.
> 3. **Tầng 3 (Hiện trường Ổ đĩa & Live Daemon):** Đọc code thực tế trước khi sửa, bảo vệ tiến trình nền server (`http://localhost:3000`), không để gãy tính năng cũ.
> 4. **Tầng 4 (NotebookLM MCP):** Tra cứu kho tri thức sư phạm `e8157708-4226-4be0-bbba-1780b69ab77d` khi bổ sung giáo trình hoặc bài tập.

---

## 6. QUY TẮC BẮT BUỘC: KIỂM ĐỊNH TOÀN DIỆN & CHỐNG THẤT THOÁT MÃ NGUỒN (ANTI-REGRESSION & QA PROTOCOL)
> [!CAUTION]
> **Sau khi hoàn thành bất kỳ tính năng hoặc sửa lỗi nào, tác nhân BẮT BUỘC thực hiện kiểm tra 4 tiêu chí trước khi báo cáo kết quả:**
> 1. **Tính Thống Nhất (Consistency):**
>    - Nhân vật: 100% "Thầy Giáo Mĩ Thuật" (Thầy Cọ Nhí), ảnh đại diện thực tế `/teacher.jpg` ở tất cả các tab (Header, Lớp học Kết nối tri thức, Bảng vẽ, Mắt thần chấm tranh, Vẽ từng bước, Xưởng ý tưởng, Bong bóng giảng bài).
>    - Giọng nói: 100% Giọng nam tiếng Việt tự nhiên (`vi-VN-NamMinhNeural`), tuyệt đối không để giọng nữ hay giọng tiếng Anh phát ra.
>    - Giáo trình: Đồng nhất phân loại Lớp 1 - 5 theo bộ sách "Kết nối tri thức với cuộc sống", có cả Giáo án Word (CV 2345) và Slide PowerPoint.
> 2. **Không Trùng Lặp (Zero Redundancy):**
>    - Không giữ các file dữ liệu mồ côi hoặc không còn được import.
>    - Loại bỏ triệt để các hàm/biến thừa, không để logic đối kháng nhau.
> 3. **Không Mất Mã Code (Zero Missing Code):**
>    - Kiểm tra chặt chẽ mọi lệnh `import` và `export`.
>    - Đảm bảo các prop, callback, state truyền giữa các component không bị thiếu hoặc undefined.
> 4. **Kiểm Định Biên Dịch Thực Tế (Build Verification):**
>    - Bắt buộc chạy `npm run build` xác nhận hoàn thành với **0 lỗi (0 errors)**.
>    - Kiểm tra đường truyền server trả về mã `200 OK`.

---

## 7. QUY TẮC MỔ XẺ & SAO CHÉP ỨNG DỤNG (REVERSE ENGINEERING & APP REPLICATION)
> [!IMPORTANT]
> **Bất cứ khi nào người dùng yêu cầu phân tích, mổ xẻ cấu trúc, kiểm tra cách hoạt động hoặc nghiên cứu khả năng sao chép (clone/replicate) bất kỳ ứng dụng nào:**
> 1. **Bắt buộc sử dụng MCP REA (Reverse Engineer Anything - `rea-agents` / `morluto/rea`):**
>    - Sử dụng bộ 207 công cụ chuyên sâu của MCP REA (`analyze`, `analyze-javascript-application`, `analyze-web-bundle`, `decompile`, `extract-artifact`, `trace-application-feature`,...) để bóc tách cấu trúc thực tế của ứng dụng (ASAR, Electron, Native Binaries PE/ELF/Mach-O, .NET, APK, Web bundle) dựa trên bằng chứng kỹ thuật xác thực, tuyệt đối không suy đoán suông.
> 2. **Kích hoạt Kỹ năng (Skill) Chuẩn:**
>    - Luôn đối chiếu quy trình trong bộ kỹ năng `reverse-engineer-anything` tại `C:\Users\win 10 pro\.gemini\config\skills\reverse-engineer-anything\SKILL.md`.
> 3. **Quy trình 3 Bước Phân Tích Sao Chép:**
>    - **Bước 1 (Trích xuất Bằng chứng Thực tế):** Quét manifest, file đóng gói (`app.asar`, DLLs, Go/Rust binaries, socket IPC, API endpoints, WebSocket).
>    - **Bước 2 (Phân rã Hệ thống):** Phân định ranh giới rõ ràng giữa "Client/Vỏ máy tính" và "Backend/Cloud AI Brain".
>    - **Bước 3 (Kiến trúc Tái tạo - Clean-room Clone):** Đề xuất giải pháp và công nghệ mã nguồn mở tương đương (Tauri/Electron + Open-source Vision/Agent frameworks + MCP Host) để người dùng có thể hiện thực hóa độc lập.

---

## 8. QUY TRÌNH KHÉP KÍN TẠO ỨNG DỤNG TỪ A-Z BẰNG HỆ THỐNG MCP 100% MIỄN PHÍ (FULLSTACK CLOSED-LOOP PIPELINE)
> [!IMPORTANT]
> **Mỗi khi người dùng yêu cầu tạo mới hoặc phát triển hoàn thiện một ứng dụng từ A-Z, tác nhân BẮT BUỘC tuân thủ chuỗi 7 giai đoạn khép kín được liên kết chặt chẽ qua các MCP sau:**
> 
> 1. **Giai Đoạn 1 - Nghiên Cứu & Đặc Tả (Research & PRD):**
>    - **MCP Sử Dụng:** `rea` (Phân tích/dịch ngược cấu trúc app mẫu nếu có) + `notebooklm` (Tra cứu/lưu trữ tài liệu thiết kế, PRD, nghiệp vụ chuyên sâu).
>    - **Đầu ra:** Bản đặc tả yêu cầu phần mềm và kiến trúc thành phần chi tiết.
> 
> 2. **Giai Đoạn 2 - Thiết Kế Giao Diện & Đồ Họa (UI/UX & Assets):**
>    - **MCP Sử Dụng:** `canva` (Tạo template, banner, icon, mockup giao diện trực quan).
>    - **Đầu ra:** Toàn bộ visual assets sẵn sàng trong thư mục `/assets` hoặc `/public`.
> 
> 3. **Giai Đoạn 3 - Quản Lý Phiên Bản & Cấu Trúc Mã Nguồn (Repo & Scaffolding):**
>    - **MCP Sử Dụng:** `git` (`mcp-server-git` với `git_status`, `git_add`, `git_commit`, `git_branch`).
>    - **Đầu ra:** Repository git được khởi tạo chuẩn hóa, phân nhánh rõ ràng, commit có mốc kiểm soát.
> 
> 4. **Giai Đoạn 4 - Lập Trình Core Fullstack & Trí Tuệ Nhân Tạo (Fullstack & AI Engine):**
>    - **MCP/Công nghệ Sử Dụng:**
>      - CSDL Cục bộ (Local/Offline DB): `sqlite` (`mcp-server-sqlite` với `create_table`, `write_query`, `read_query`) - 100% miễn phí, bảo mật trên máy người dùng.
>      - Trí Tuệ Nhân Tạo: Google Gemini API (Gemini 2.5/3.8 Flash miễn phí) hỗ trợ suy luận văn bản & thị giác máy tính.
>      - Cloud/Xác thực (nếu cần): Firebase Spark Free Tier (Auth, Firestore, Storage).
>    - **Đầu ra:** Ứng dụng hoạt động trơn tru cả frontend lẫn backend.
> 
> 5. **Giai Đoạn 5 - Kiểm Thử Tự Động & Đảm Bảo Chất Lượng (QA & Auditing):**
>    - **MCP Sử Dụng:** `chrome-devtools-mcp` (Tự động mở trang, bắt console errors, đo đạc network, audit hiệu năng LCP và độ khả dụng A11y).
>    - **Bắt buộc:** Lệnh `npm run build` đạt **0 lỗi (0 errors)** và server nội bộ phản hồi `200 OK`.
> 
> 6. **Giai Đoạn 6 - Đóng Gói & Triển Khai Miễn Phí (Packaging & Free Hosting):**
>    - **Công nghệ:** Vercel Hobby / Firebase Hosting (Web) hoặc Electron / Tauri Desktop Package với Desktop Shortcut.
>    - **Đầu ra:** Đường link truy cập trực tiếp hoặc file chạy desktop 1-click.
> 
> 7. **Giai Đoạn 7 - Video Quảng Bá, Slide Thuyết Trình & Bàn Giao (Showroom & Docs):**
>    - **MCP Sử Dụng:** `sales-video-mcp` (Tạo kịch bản bán hàng/giới thiệu, thu âm giọng đọc AI tiếng Việt, render video thành phẩm) + Google Workspace (`gdocs`, `gslides`).
>    - **Đầu ra:** Video demo sản phẩm hoàn chỉnh cùng tài liệu hướng dẫn bàn giao cho người dùng.

