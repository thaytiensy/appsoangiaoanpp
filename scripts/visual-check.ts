import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensurePreviewDir(): void {
  const previewDir = path.resolve(process.cwd(), '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
}

test.describe('Visual Verification (Clean White Inputs, Multi-AI Selector & 8 Slides)', () => {
  test.beforeAll(() => {
    ensurePreviewDir();
  });

  test('Kiểm tra Form ô trắng sạch & Bộ chọn Đa Động cơ AI (Gemini, ChatGPT, Claude, DeepSeek)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('text=Tải File Giáo Án Word Mẫu (.docx) Tạo Slide')).toBeVisible();

    const schoolVal = await page.inputValue('#school-name');
    expect(schoolVal).toBe('');

    await expect(page.locator('text=chuotbachchise@gmail.com')).toBeVisible();

    await expect(page.locator('text=3. Lựa chọn Động cơ AI Soạn Bài & Thiết Kế Slide')).toBeVisible();
    await expect(page.locator('text=Google Gemini 2.5 Flash')).toBeVisible();
    await expect(page.locator('text=OpenAI ChatGPT (GPT-4o)')).toBeVisible();
    await expect(page.locator('text=Anthropic Claude 3.5 Sonnet')).toBeVisible();
    await expect(page.locator('text=DeepSeek V3 / R1 Reasoner')).toBeVisible();
    await expect(page.locator('text=AI Sư Phạm Tích Hợp (Offline)')).toBeVisible();

    await page.click('button:has-text("DeepSeek V3")');

    await page.screenshot({
      path: '.preview/multi-ai-selector.png',
      fullPage: true,
    });
  });

  test('Kiểm tra Soạn bài & Slide sinh ra chi tiết (Slide 1 Chào mừng & Slide 8 Cảm ơn)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('#school-name', 'Trường Tiểu học Chu Văn An');
    await page.fill('#faculty-name', 'Tổ khối 2');
    await page.fill('#teacher-name', 'Cô Nguyễn Thị Mai');
    await page.selectOption('#grade-select', '5');
    await page.fill('#topic-name', 'Gia đình');

    await page.click('button:has-text("ChatGPT-4o")');

    await page.click('button[type="submit"]');
    await page.waitForSelector('text=CÔNG VĂN 2345', { timeout: 15000 });

    await expect(page.locator('text=OpenAI ChatGPT (GPT-4o)')).toBeVisible();

    await page.click('button:has-text("Dàn ý Slide PowerPoint (16:9)")');
    await page.waitForSelector('text=CHÀO MỪNG QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH', { timeout: 10000 });

    await expect(page.locator('text=Slide 1 / 8')).toBeVisible();

    const lastSlideBtn = page.locator('button:has-text("Slide 8")');
    await lastSlideBtn.click();
    await page.waitForSelector('text=CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ VÀ CÁC EM!', { timeout: 5000 });

    await page.waitForTimeout(500);

    await page.screenshot({
      path: '.preview/slide-thank-you.png',
      fullPage: true,
    });
  });
});
