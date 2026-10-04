import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Automated Browser QA - Antigravity Studio Video Editor', () => {
  const artifactDir = 'C:\\Users\\win 10 pro\\.gemini\\antigravity\\brain\\c2fbcf41-3a27-4b4c-b76e-0f4c9f1497d0';

  test('Tự động kiểm tra thực tế trên trình duyệt: Giao diện Studio, Đổi tỷ lệ 9:16, Modal Xuất Video và Điều hướng', async ({ page }) => {
    // 1. Cấu hình độ phân giải màn hình chuẩn Desktop HD
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Truy cập trực tiếp vào /studio
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    // Kiểm tra các thành phần giao diện chính
    await expect(page.locator('text=ANTIGRAVITY STUDIO')).toBeVisible();
    await expect(page.locator('text=WebCodecs 2026')).toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();
    await expect(page.locator('text=Video 1')).toBeVisible();
    await expect(page.locator('text=Audio 1')).toBeVisible();
    await expect(page.locator('text=Text 1')).toBeVisible();

    // Chụp ảnh tổng quan màn hình Studio
    const previewDir = path.resolve('.preview');
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }

    const overviewShot = path.join(previewDir, 'studio-editor-overview.png');
    await page.screenshot({ path: overviewShot, fullPage: true });

    // 3. Kiểm tra chuyển đổi tỷ lệ khung hình sang 9:16 (TikTok / Reels)
    const ratioSelect = page.locator('select').filter({ hasText: '16:9' }).first();
    if (await ratioSelect.isVisible()) {
      await ratioSelect.selectOption('9:16');
      await page.waitForTimeout(300);
      const ratio916Shot = path.join(previewDir, 'studio-aspect-9-16.png');
      await page.screenshot({ path: ratio916Shot, fullPage: true });
    }

    // 4. Mở Modal Xuất Video (Export Modal)
    const exportBtn = page.locator('button:has-text("Xuất Video (Export)")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Xác nhận Modal xuất hiện
    await expect(page.locator('text=Xuất Video Studio (Export)')).toBeVisible();
    await expect(page.locator('text=Độ Phân Giải')).toBeVisible();

    const exportModalShot = path.join(previewDir, 'studio-export-modal.png');
    await page.screenshot({ path: exportModalShot, fullPage: true });

    // Đóng Modal bằng nút X
    const closeBtn = page.locator('button:has(svg.lucide-x)');
    await closeBtn.click();
    await expect(page.locator('text=Xuất Video Studio (Export)')).not.toBeVisible();

    // 5. Kiểm tra điều hướng liên thông: Studio -> Giáo án -> Studio
    const backToLessonBtn = page.locator('a[title="Quay lại Soạn Giáo Án"]');
    await expect(backToLessonBtn).toBeVisible();
    await backToLessonBtn.click();
    await page.waitForURL('**/');
    await expect(page.locator('h1')).toContainText('AI PowerPoint Lesson Planner Pro');

    // Từ trang Giáo án bấm nút Studio Video để quay lại
    const goToStudioBtn = page.locator('a:has-text("Studio Video")');
    await expect(goToStudioBtn).toBeVisible();
    await goToStudioBtn.click();
    await page.waitForURL('**/studio');
    await expect(page.locator('text=ANTIGRAVITY STUDIO')).toBeVisible();

    // 6. Sao chép ảnh vào artifact directory để hiển thị trong chat
    if (fs.existsSync(artifactDir)) {
      if (fs.existsSync(overviewShot)) {
        fs.copyFileSync(overviewShot, path.join(artifactDir, 'studio-editor-overview.png'));
      }
      const ratio916Shot = path.join(previewDir, 'studio-aspect-9-16.png');
      if (fs.existsSync(ratio916Shot)) {
        fs.copyFileSync(ratio916Shot, path.join(artifactDir, 'studio-aspect-9-16.png'));
      }
      if (fs.existsSync(exportModalShot)) {
        fs.copyFileSync(exportModalShot, path.join(artifactDir, 'studio-export-modal.png'));
      }
    }
  });
});
