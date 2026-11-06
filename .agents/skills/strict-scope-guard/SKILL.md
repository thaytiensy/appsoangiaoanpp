---
name: strict-scope-guard
description: >-
  Enforces strict adherence to user-requested changes only. Absolutely prohibits modifying,
  refactoring, or deleting any unrelated files, features, or components in the codebase.
  Requires inspecting existing code, maintaining zero regression, and confirming 0 build errors.
---

# KỸ NĂNG: BẢO VỆ PHẠM VI NGHIÊM NGẶT & CHỐNG HỒI QUY (STRICT SCOPE GUARD)

> [!IMPORTANT]
> **TÔN CHỈ BẤT BIẾN:**
> "Chỉ sửa đúng những tệp tin và tính năng được người dùng yêu cầu cụ thể. Tuyệt đối không đụng chạm, sửa đổi, tái cấu trúc hoặc xóa bất kỳ tệp tin, tính năng hay đoạn mã nào đã hoạt động chính xác."

---

## 1. Mục Đích & Bối Cảnh Sử Dụng
Kỹ năng này bắt buộc kích hoạt trong mọi phiên làm việc khi người dùng đưa ra yêu cầu chỉnh sửa, nâng cấp hoặc sửa lỗi phần mềm. Mục tiêu là triệt tiêu hoàn toàn rủi ro:
* Sửa lan sang các component khác làm mất chức năng cũ (drawing board, slide editor, audio, rubric, games...).
* Mất mã nguồn, gãy prop/callback giữa các module.
* Tự ý "làm sạch" hay "tối ưu hóa" những file không được phép can thiệp.

---

## 2. Quy Trình Thực Thi 5 Bước Bắt Buộc

### Bước 1: Khoanh Vùng Phạm Vi Cực Hạn (Scope Boundary Definition)
* Đọc kỹ yêu cầu người dùng, liệt kê danh sách **DUY NHẤT** các tệp và chức năng được phép can thiệp.
* Mọi tệp nằm ngoài danh sách này mặc định ở chế độ **CHỈ ĐỌC (READ-ONLY)**.

### Bước 2: Khảo Sát Hiện Trường Trước Khi Sửa (Pre-modification Audit)
* Luôn đọc nội dung thực tế của tệp cần sửa bằng công cụ đọc tệp.
* Xác định chính xác các dòng mã bị lỗi hoặc cần bổ sung.
* Không đoán mò cấu trúc tệp.

### Bước 3: Can Thiệp Tối Thiểu (Minimal Surgical Edit)
* Thực hiện chỉnh sửa chính xác tại vị trí cần thiết.
* Giữ nguyên 100% các biến, hàm, prop, callback, state và comment giải thích hiện có.
* Tuyệt đối không xóa bỏ tính năng cũ để thay thế bằng tính năng mới trừ khi người dùng yêu cầu rõ ràng.

### Bước 4: Kiểm Soát Tính Toàn Vẹn (Integrity Verification)
* Xác nhận mọi lệnh `import` và `export` vẫn còn đầy đủ, không bị thiếu module.
* Đảm bảo tính năng mới tích hợp liền mạch với hệ thống mà không gây xung đột.
* Bảo mật: Không làm lộ mật khẩu, tài khoản admin hay thông tin nhạy cảm ra ngoài giao diện công khai.

### Bước 5: Kiểm Định Biên Dịch Thực Tế (Zero-Error Build Verification)
* Luôn thực hiện chạy lệnh biên dịch dự án (`npm run build`).
* Xác nhận quá trình đóng gói hoàn tất với **0 lỗi (0 errors)**.
* Nếu phát sinh lỗi, phải khắc phục ngay trước khi kết thúc lượt phản hồi.

---

## 3. Bản Kiểm Tra (Checklist Chống Thất Thoát Mã Nguồn)
Trước khi bàn giao kết quả cho người dùng, trợ lý phải tự trả lời "CÓ" cho tất cả các câu sau:
1. [ ] Tôi chỉ chạm vào đúng những tệp được người dùng yêu cầu?
2. [ ] Các tệp khác hoàn toàn được bảo toàn nguyên vẹn?
3. [ ] Các tính năng cốt lõi (Bảng vẽ, Soạn slide, Trợ giảng, Giọng đọc, Âm thanh) không bị gãy vỡ?
4. [ ] Lệnh `npm run build` đã chạy thành công với 0 lỗi?
5. [ ] Mọi thông tin quản trị nhạy cảm được bảo mật tuyệt đối không hiển thị lộ thiên?
