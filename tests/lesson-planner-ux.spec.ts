import { test, expect } from '@playwright/test';

test.describe('Lesson Planner UX Upgrade QA', () => {
  test('Kiểm tra khối Quick Templates, StepLoading và Trình soạn thảo Word', async ({ page }) => {
    // 1. Truy cập vào trang /lesson-planner
    await page.goto('/lesson-planner');

    // Kiểm tra khối Gợi ý nhanh
    const quickBar = page.locator('text=Gợi Ý Nhanh (Quick Templates)');
    await expect(quickBar).toBeVisible();

    // 2. Click vào template "Văn 11"
    const litTemplate = page.locator('button:has-text("Ngữ văn 11")');
    await expect(litTemplate).toBeVisible();
    await litTemplate.click();

    // Kiểm tra trường Chủ đề được điền tự động
    const topicInput = page.locator('input[placeholder*="Ví dụ: Định luật"]');
    await expect(topicInput).toHaveValue('Nghệ thuật xây dựng nhân vật và diễn biến tâm lý');

    // 3. Bấm tạo giáo án để kích hoạt hiệu ứng chờ StepLoading
    const generateBtn = page.locator('button:has-text("AI TẠO GIÁO ÁN")');
    await generateBtn.click();

    // Kiểm tra overlay chờ 3 bước xuất hiện
    const overlay = page.locator('text=AI Đang Khởi Tạo Kế Hoạch Bài Dạy');
    await expect(overlay).toBeVisible();
    await expect(page.locator('text=Phân tích chuẩn Bộ GD & Thang đo Bloom')).toBeVisible();

    // Chờ quá trình sinh hoàn tất
    await expect(overlay).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // 4. Kiểm tra 2 nút hành động lớn
    const downloadDocxBtn = page.locator('button:has-text("Tải Xuống File Word (.docx)")');
    const copyContentBtn = page.locator('button:has-text("Sao Chép Toàn Bộ Nội Dung")');
    await expect(downloadDocxBtn).toBeVisible();
    await expect(copyContentBtn).toBeVisible();

    // 5. Kiểm tra Trình soạn thảo văn bản trực tiếp (Editable Area)
    const editableArea = page.locator('textarea[placeholder*="Nội dung giáo án văn bản"]');
    await expect(editableArea).toBeVisible();
    const content = await editableArea.inputValue();
    expect(content).toContain('KẾ HOẠCH BÀI DẠY (GIÁO ÁN)');
    expect(content).toContain('NGHỆ THUẬT XÂY DỰNG NHÂN VẬT');

    // 6. Thử chỉnh sửa văn bản trực tiếp trong Editable Area
    await editableArea.fill(content + '\n[GHI CHÚ BỔ SUNG CỦA GIÁO VIÊN]');
    const updatedContent = await editableArea.inputValue();
    expect(updatedContent).toContain('[GHI CHÚ BỔ SUNG CỦA GIÁO VIÊN]');

    // 7. Thử bấm sao chép
    await copyContentBtn.click();
    await expect(page.locator('text=Đã Sao Chép Toàn Bộ Giáo Án!')).toBeVisible();
  });
});
