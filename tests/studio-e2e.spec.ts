import { test, expect } from '@playwright/test';
import { useTimelineStore } from '../src/store/useTimelineStore';
import { PreviewEngine } from '../src/core/player/PreviewEngine';
import { AudioMixer } from '../src/core/player/AudioMixer';
import { WebMMuxer } from '../src/core/export/webmMuxer';
import { EXPORT_RESOLUTIONS } from '../src/types/export';
import { AddClipCommand, SplitClipCommand } from '../src/core/commands/Command';
import { HistoryManager } from '../src/core/commands/HistoryManager';
import { Clip, TimelineState, Track } from '../src/types/timeline';

test.describe('Liên thông toàn diện Studio Engine (Timeline -> Preview -> Audio -> Export)', () => {
  test('Quy trình khép kín: Thêm Clip -> Cắt (Split) -> Hòa âm Audio -> Preview Engine -> Đóng gói WebM', () => {
    // 1. TIMELINE & COMMAND PATTERN
    const history = new HistoryManager(20);
    const initialClip: Clip = {
      id: 'clip-e2e-1',
      trackId: 'track-v1',
      assetId: 'asset-1',
      name: 'Sample Footage.mp4',
      type: 'video',
      start: 0,
      end: 10,
      sourceStart: 0,
      sourceEnd: 10,
      volume: 1,
      muted: false,
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    };

    const initialTrack: Track = {
      id: 'track-v1',
      name: 'Video 1',
      type: 'video',
      order: 0,
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      clips: [],
    };

    let state: TimelineState = {
      tracks: [initialTrack],
      assets: [],
      playheadTime: 0,
      duration: 30,
      zoom: 60,
      selectedClipIds: [],
      selectedTrackId: null,
      isPlaying: false,
      fps: 30,
    };

    // Thực thi AddClipCommand
    const addCmd = new AddClipCommand(initialClip);
    state = history.execute(addCmd, state);
    expect(state.tracks[0].clips.length).toBe(1);
    expect(history.canUndo()).toBe(true);

    // Thực thi SplitClipCommand tại giây thứ 4
    const splitCmd = new SplitClipCommand('clip-e2e-1', 4.0);
    state = history.execute(splitCmd, state);
    expect(state.tracks[0].clips.length).toBe(2);
    expect(state.tracks[0].clips[0].end).toBe(4.0);
    expect(state.tracks[0].clips[1].start).toBe(4.0);

    // Kiểm tra Undo Split
    state = history.undo(state)!;
    expect(state.tracks[0].clips.length).toBe(1);

    // Kiểm tra Redo Split
    state = history.redo(state)!;
    expect(state.tracks[0].clips.length).toBe(2);

    // 2. AUDIO MIXER ENGINE
    const audioMixer = new AudioMixer();
    audioMixer.setMasterVolume(0.8);
    audioMixer.updateTrackGain('track-v1', 0.9, false);
    const isMuted = audioMixer.toggleMute();
    expect(isMuted).toBe(true);
    audioMixer.toggleMute(); // unmute

    // 3. PREVIEW ENGINE
    const previewEngine = new PreviewEngine(audioMixer);
    previewEngine.setAspectRatio('9:16');
    expect(previewEngine.getAspectRatio()).toBe('9:16');
    previewEngine.setAspectRatio('16:9');
    expect(previewEngine.getAspectRatio()).toBe('16:9');

    // 4. EXPORT PIPELINE & WEBM MUXING
    const resolution = EXPORT_RESOLUTIONS['1080p']['16:9'];
    const muxer = new WebMMuxer({
      width: resolution.width,
      height: resolution.height,
      codec: 'V_VP8',
      durationSeconds: 10.0,
    });

    const dummyKeyframe = new Uint8Array([0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x80, 0x07, 0x38, 0x04]);
    const dummyInterframe = new Uint8Array([0x32, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x80, 0x07, 0x38, 0x04]);
    muxer.addVideoChunk(dummyKeyframe, 0, true);
    muxer.addVideoChunk(dummyInterframe, 33333, false);

    const exportedBytes = muxer.finalize();
    expect(exportedBytes.byteLength).toBeGreaterThan(60);
    expect(exportedBytes[0]).toBe(0x1a);
    expect(exportedBytes[1]).toBe(0x45);
    expect(exportedBytes[2]).toBe(0xdf);
    expect(exportedBytes[3]).toBe(0xa3);

    // Cleanup resources
    audioMixer.cleanup();
    previewEngine.cleanup();
  });

  test('Giao diện Studio /studio render đầy đủ các thành phần UI cốt lõi', async ({ page }) => {
    await page.goto('/studio');

    // Header Studio
    await expect(page.locator('text=ANTIGRAVITY STUDIO')).toBeVisible();
    await expect(page.locator('text=WebCodecs 2026')).toBeVisible();

    // Nút Xuất Video
    const exportBtn = page.locator('button:has-text("Xuất Video (Export)")');
    await expect(exportBtn).toBeVisible();

    // Màn Preview Canvas & Playback Controls
    await expect(page.locator('canvas').first()).toBeVisible();

    // Multi-track Timeline & Ruler
    await expect(page.locator('text=Video 1')).toBeVisible();
    await expect(page.locator('text=Audio 1')).toBeVisible();

    // Mở Modal Xuất Video
    await exportBtn.click();
    await expect(page.locator('text=Xuất Video Studio (Export)')).toBeVisible();
    await expect(page.locator('text=Độ Phân Giải')).toBeVisible();

    // Đóng Modal bằng nút X
    const closeBtn = page.locator('button:has(svg.lucide-x)');
    await closeBtn.click();
    await expect(page.locator('text=Xuất Video Studio (Export)')).not.toBeVisible();
  });
});
