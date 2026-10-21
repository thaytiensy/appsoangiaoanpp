import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensurePreviewDir(): void {
  const previewDir = path.resolve(process.cwd(), '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
}

test.describe('Visual Verification (Clean White Inputs, Word Upload Card & 8 Slides)', () => {
  test.beforeAll(() => {
    ensurePreviewDir();
  });

  test('Kiểm tra Form ô trắng sạch & Ô Tải file Word mẫu tạo Slide', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Kiểm tra ô Tải file Word mẫu xuất hiện
    await expect(page.locator('text=Tải File Giáo Án Word Mẫu (.docx) Tạo Slide')).toBeVisible();

    // Kiểm tra các ô nhập liệu là ô trắng (không bị gán sẵn dữ liệu mẫu)
    const schoolVal = await page.inputValue('#school-name');
    expect(schoolVal).toBe('');

    // Kiểm tra tài khoản admin chuotbachchise@gmail.com
    await expect(page.locator('text=chuotbachchise@gmail.com')).toBeVisible();

    await page.screenshot({
      path: '.preview/white-inputs-and-word-upload.png',
      fullPage: true,
    });
  });

  test('Kiểm tra Slide sinh ra chi tiết (Slide 1 Chào mừng & Slide 8 Cảm ơn)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Nhập đầy đủ thông tin vào form (để không bị chặn bởi HTML5 required)
    await page.fill('#school-name', 'Trường PTDTBTTH Lê Quý Đôn');
    await page.fill('#faculty-name', 'Tổ khối 2');
    await page.fill('#teacher-name', 'Thầy Đỗ Tiến Sỹ');
    await page.selectOption('#grade-select', '5');
    await page.fill('#topic-name', 'Gia đình');

    // Bấm soạn
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=CÔNG VĂN 2345', { timeout: 15000 });

    // Mở Tab Slide
    await page.click('button:has-text("Dàn ý Slide PowerPoint (16:9)")');
    await page.waitForSelector('text=CHÀO MỪNG QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH', { timeout: 10000 });

    // Kiểm tra tổng số 8 slide
    await expect(page.locator('text=Slide 1 / 8')).toBeVisible();

    // Chuyển sang slide cuối (Slide 8)
    const lastSlideBtn = page.locator('button:has-text("Slide 8")');
    await lastSlideBtn.click();
    await page.waitForSelector('text=CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ VÀ CÁC EM!', { timeout: 5000 });

    await page.waitForTimeout(1000);

    // Chụp ảnh Slide 8 Lời cảm ơn
    await page.screenshot({
      path: '.preview/slide-thank-you.png',
      fullPage: true,
    });
  });
});
