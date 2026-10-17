import { test, expect } from '@playwright/test';

test('Trang chủ hiển thị đúng tiêu đề Clean Slate', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Hệ thống AI Soạn Giáo Án');
});
