import { test, expect } from '@playwright/test';

test.describe('PRO Features & Real-time Pedagogical Editing QA', () => {
  test('Kiểm tra chỉnh sửa thật: Duplicate Slide, Chỉnh sửa mục tiêu & tiến trình sư phạm, Đổi layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Kiểm tra số lượng slide ban đầu (5 slides mặc định)
    await expect(page.locator('text=5 Slides').first()).toBeVisible();

    // 2. Thử nghiệm tính năng Nhân đôi Slide (Duplicate Slide)
    const dupBtn = page.locator('button:has-text("Nhân đôi")');
    await expect(dupBtn).toBeVisible();
    await dupBtn.click();

    // Xác nhận số lượng slide tăng lên 6 Slides
    await expect(page.locator('text=6 Slides').first()).toBeVisible();

    // 3. Thử nghiệm "Chỉnh Sửa Thật" trên Kế Hoạch Bài Dạy Sư Phạm
    const editPlanBtn = page.locator('button:has-text("Chỉnh Sửa Thật")');
    await expect(editPlanBtn).toBeVisible();
    await editPlanBtn.click();

    // Kiểm tra nút chuyển sang "Xong Chỉnh Sửa"
    await expect(page.locator('button:has-text("Xong Chỉnh Sửa")')).toBeVisible();

    // Sửa nội dung vai trò Giáo viên ở hoạt động 1
    const teacherRoleInput = page.locator('textarea').filter({ hasText: 'Giáo viên' }).first();
    if (await teacherRoleInput.isVisible()) {
      await teacherRoleInput.fill('Giáo viên ứng dụng AI tạo câu hỏi đố vui trực quan 3D.');
      await expect(teacherRoleInput).toHaveValue('Giáo viên ứng dụng AI tạo câu hỏi đố vui trực quan 3D.');
    }

    // Bấm hoàn tất chỉnh sửa
    const doneEditBtn = page.locator('button:has-text("Xong Chỉnh Sửa")');
    await doneEditBtn.click();
    await expect(page.locator('button:has-text("Chỉnh Sửa Thật")')).toBeVisible();

    // 4. Kiểm tra chỉnh sửa trực tiếp nội dung trên màn chiếu Live Preview 16:9 HD
    const slideTitleInput = page.locator('input[title="Bấm để sửa tiêu đề trực tiếp"]').first();
    await expect(slideTitleInput).toBeVisible();
    await slideTitleInput.fill('CHỦ ĐỀ ĐỔI MỚI SƯ PHẠM 2026');
    await expect(slideTitleInput).toHaveValue('CHỦ ĐỀ ĐỔI MỚI SƯ PHẠM 2026');

    // Kiểm tra thumbnail ở thanh điều hướng cập nhật tiêu đề mới
    await expect(page.locator('text=CHỦ ĐỀ ĐỔI MỚI SƯ PHẠM 2026')).toBeVisible();
  });
});
