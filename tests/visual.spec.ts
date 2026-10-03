import { test } from '@playwright/test';

const viewports = [
  { name: 'mobile-preview', width: 375, height: 812 },
  { name: 'desktop-workspace', width: 1440, height: 900 }
];

for (const vp of viewports) {
  test(`Capture UI preview - ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `.preview/${vp.name}.png`,
      fullPage: true
    });
  });
}
