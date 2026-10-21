import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensurePreviewDir(): void {
  const previewDir = path.resolve(process.cwd(), '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
}

test.describe('Visual Verification Clean Slate (Home Page & Modals)', () => {
  test.beforeAll(() => {
    ensurePreviewDir();
  });

  test('Chụp ảnh màn hình Desktop Clean Slate (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Hệ thống AI Soạn Giáo Án');

    await page.screenshot({
      path: '.preview/desktop-latest.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Modal Tải Word (.docx)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("Tải file Word")');
    await page.waitForSelector('text=Tải Giáo Án Word Lọc Slide PowerPoint');

    await page.screenshot({
      path: '.preview/word-modal.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Modal Đồng Bộ GitHub & Vercel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.click('button:has-text("GitHub & Vercel")');
    await page.waitForSelector('text=Đưa Lên GitHub & Vercel');

    await page.screenshot({
      path: '.preview/deploy-modal.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Mobile Clean Slate (375x667)', async ({ page }) => {
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
