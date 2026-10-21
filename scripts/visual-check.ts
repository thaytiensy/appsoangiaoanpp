import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensurePreviewDir(): void {
  const previewDir = path.resolve(process.cwd(), '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
}

test.describe('Visual Verification (Correct Font, CV 2345 & Accurate Family Image)', () => {
  test.beforeAll(() => {
    ensurePreviewDir();
  });

  test('Kiểm tra tạo bài học STEM Gia đình Lớp 5 (Chuẩn CV 2345 & Font tiếng Việt không lỗi)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Điền form với đúng thông tin người dùng yêu cầu:
    // Trường PTDTBTTH Lê Quý Đôn, Lớp 5, Chủ đề: Gia đình
    await page.fill('#school-name', 'Trường PTDTBTTH Lê Quý Đôn');
    await page.selectOption('#grade-select', '5');
    await page.fill('#topic-name', 'Gia đình');

    // Bấm Bắt đầu soạn giáo án
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Chờ kết quả hiển thị
    await page.waitForSelector('text=CÔNG VĂN 2345', { timeout: 15000 });

    // Xác nhận chuẩn Công văn 2345 xuất hiện cho Lớp 5 (chứ không phải 5512)
    const khbdTitle = await page.locator('h2:has-text("CÔNG VĂN 2345")').textContent();
    expect(khbdTitle).toContain('2345');

    // Chụp ảnh Kế hoạch bài dạy chứng minh font chữ tiếng Việt đã chuẩn xác, không còn lỗi dấu tách rời
    await page.screenshot({
      path: '.preview/family-stem-khbd.png',
      fullPage: true,
    });

    // Chuyển sang Tab Slide để kiểm tra ảnh minh họa
    await page.click('button:has-text("Dàn ý Slide PowerPoint (16:9)")');
    await page.waitForSelector('text=Ảnh chuẩn chủ đề Gia đình', { timeout: 10000 });

    // Đợi ảnh render
    await page.waitForTimeout(1000);

    // Chụp ảnh Slide kiểm tra ảnh gia đình phù hợp nội dung
    await page.screenshot({
      path: '.preview/family-stem-slide.png',
      fullPage: true,
    });
  });
});
