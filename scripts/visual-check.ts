import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensurePreviewDir(): void {
  const previewDir = path.resolve(process.cwd(), '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
}

test.describe('Visual Verification (Home Page, Gmail Share & White Slide)', () => {
  test.beforeAll(() => {
    ensurePreviewDir();
  });

  test('Chụp ảnh màn hình Desktop Header Mới (Đã bỏ 2 nút & Thêm Chia sẻ Gmail)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Hệ thống AI Soạn Giáo Án');
    await expect(page.locator('button:has-text("Chia sẻ miễn phí qua Gmail")')).toBeVisible();

    await page.screenshot({
      path: '.preview/desktop-latest.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Modal Chia Sẻ Qua Gmail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Chia sẻ miễn phí qua Gmail")');
    await page.waitForSelector('text=Chia Sẻ Giáo Án & Slide Qua Gmail');

    await page.screenshot({
      path: '.preview/gmail-share-modal.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Slide Trình Chiếu Nền Trắng & Hình Ảnh Minh Họa AI', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Bấm mẫu soạn nhanh Toán học 6
    const templateBtn = page.locator('button:has-text("Toán học 6")').first();
    await templateBtn.click();

    // Bấm bắt đầu soạn
    const submitBtn = page.locator('button:has-text("Bắt Đầu Soạn Giáo Án")').first();
    await submitBtn.click();

    // Chờ tab chuyển sang Slide xuất hiện
    const slideTab = page.locator('button:has-text("Dàn ý Slide PowerPoint (16:9)")');
    await slideTab.waitFor({ state: 'visible', timeout: 20000 });
    await slideTab.click();

    await page.waitForSelector('text=Tỷ lệ 16:9 Trình Chiếu Nền Trắng', { timeout: 10000 });

    // Đợi ảnh minh họa load
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: '.preview/white-slide-with-image.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Hệ thống AI Soạn Giáo Án');

    await page.screenshot({
      path: '.preview/mobile-latest.png',
      fullPage: true,
    });
  });
});
