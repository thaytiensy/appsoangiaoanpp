import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensurePreviewDir(): void {
  const previewDir = path.resolve(process.cwd(), '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
}

test.describe('Visual Verification (Home & Automation Dashboard)', () => {
  test.beforeAll(() => {
    ensurePreviewDir();
  });

  test('Chụp ảnh màn hình Desktop Dashboard Automation (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/automation');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Dashboard Tự động hóa Web');

    await page.screenshot({
      path: '.preview/automation-desktop.png',
      fullPage: true,
    });
    await page.screenshot({
      path: '.preview/desktop-latest.png',
      fullPage: true,
    });
  });

  test('Chụp ảnh màn hình Mobile Dashboard Automation (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/automation');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Dashboard Tự động hóa Web');

    await page.screenshot({
      path: '.preview/automation-mobile.png',
      fullPage: true,
    });
    await page.screenshot({
      path: '.preview/mobile-latest.png',
      fullPage: true,
    });
  });
});
