import { test, expect } from '@playwright/test';

test.describe('Visual & Functional Verification', () => {
  test('Kiểm tra giao diện AI PowerPoint Lesson Planner Pro và Live Preview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');

    // 1. Kiểm tra tiêu đề và hotline hỗ trợ
    await expect(page.locator('h1')).toContainText('AI PowerPoint Lesson Planner Pro');
    await expect(page.getByText('0353205414').first()).toBeVisible();

    // 2. Kiểm tra tài khoản mặc định Thầy Đỗ Tiến Sỹ (ADMIN)
    await expect(page.getByText('Thầy Đỗ Tiến Sỹ').first()).toBeVisible();
    await expect(page.getByText('ADMIN').first()).toBeVisible();

    // 3. Kiểm tra các khối giao diện chuẩn GDPT và Live Preview 16:9
    await expect(page.getByText('Thông Tin Bài Dạy Chuẩn GDPT')).toBeVisible();
    await expect(page.getByText('Live Preview 16:9 HD')).toBeVisible();

    // 4. Chụp ảnh màn hình kiểm thử thị giác
    await page.screenshot({
      path: '.preview/desktop-visual-check.png',
      fullPage: true,
    });
  });
});
