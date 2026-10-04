import { test, expect } from '@playwright/test';
import { WebMMuxer } from '../src/core/export/webmMuxer';
import { ExportManager } from '../src/core/export/ExportManager';
import { EXPORT_RESOLUTIONS, ExportResolution } from '../src/types/export';
import { AspectRatio } from '../src/types/preview';

test.describe('Headless Export Pipeline & WebM Muxer', () => {
  test('WebMMuxer đóng gói chuẩn EBML header và DocType webm', () => {
    const muxer = new WebMMuxer({
      width: 1280,
      height: 720,
      codec: 'V_VP8',
      durationSeconds: 2.0,
    });

    // Giả lập 2 chunk video mã hóa VP8
    const dummyChunk1 = new Uint8Array([0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a]);
    const dummyChunk2 = new Uint8Array([0x32, 0x01, 0x00, 0x9d, 0x01, 0x2a]);

    muxer.addVideoChunk(dummyChunk1, 0, true);
    muxer.addVideoChunk(dummyChunk2, 33333, false);

    const binary = muxer.finalize();
    expect(binary.length).toBeGreaterThan(50);

    // Kiểm tra Magic Bytes EBML: 0x1A, 0x45, 0xDF, 0xA3
    expect(binary[0]).toBe(0x1a);
    expect(binary[1]).toBe(0x45);
    expect(binary[2]).toBe(0xdf);
    expect(binary[3]).toBe(0xa3);

    // Kiểm tra chuỗi 'webm' trong header
    const text = new TextDecoder().decode(binary.slice(0, 50));
    expect(text).toContain('webm');
  });

  test('EXPORT_RESOLUTIONS chứa đầy đủ kích thước hợp lệ cho các tỷ lệ khung hình', () => {
    const resolutions: ExportResolution[] = ['720p', '1080p', '4K'];
    const ratios: AspectRatio[] = ['16:9', '9:16', '1:1'];

    for (const res of resolutions) {
      for (const ratio of ratios) {
        const dim = EXPORT_RESOLUTIONS[res][ratio];
        expect(dim.width).toBeGreaterThan(0);
        expect(dim.height).toBeGreaterThan(0);

        if (ratio === '16:9') {
          expect(dim.width).toBeGreaterThan(dim.height);
        } else if (ratio === '9:16') {
          expect(dim.height).toBeGreaterThan(dim.width);
        } else {
          expect(dim.width).toBe(dim.height);
        }
      }
    }
  });

  test('ExportManager quản lý dọn dẹp URL và hủy tiến trình an toàn', () => {
    const manager = new ExportManager();
    expect(() => {
      manager.cancelExport();
      manager.cleanupBlobUrl();
    }).not.toThrow();
  });
});
