import { test, expect } from '@playwright/test';
import { AudioMixer } from '../src/core/player/AudioMixer';
import { PreviewEngine } from '../src/core/player/PreviewEngine';
import { Track, MediaAsset, Clip } from '../src/types/timeline';

test.describe('Real-time Audio/Video Comps & Preview Player Engine', () => {
  const dummyAsset: MediaAsset = {
    id: 'asset-video-1',
    name: 'Sample Video.mp4',
    type: 'video',
    url: 'blob:http://localhost/sample-video',
    duration: 15,
    width: 1920,
    height: 1080,
    mimeType: 'video/mp4',
  };

  const dummyClip: Clip = {
    id: 'clip-1',
    trackId: 'track-v1',
    assetId: dummyAsset.id,
    name: 'Sample Video Clip',
    type: 'video',
    start: 0,
    end: 10,
    sourceStart: 0,
    sourceEnd: 10,
    volume: 1.0,
    muted: false,
    transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
  };

  const dummyTrack: Track = {
    id: 'track-v1',
    name: 'Video 1',
    type: 'video',
    order: 0,
    muted: false,
    locked: false,
    visible: true,
    volume: 1.0,
    clips: [dummyClip],
  };

  test('AudioMixer khởi tạo và quản lý âm lượng / GainNode chính xác', () => {
    const mixer = new AudioMixer();

    mixer.setMasterVolume(0.75);
    mixer.updateTrackGain('track-v1', 0.8, false);

    const isMuted = mixer.toggleMute();
    expect(isMuted).toBe(true);

    const isUnmuted = mixer.toggleMute();
    expect(isUnmuted).toBe(false);

    mixer.cleanup();
  });

  test('PreviewEngine hỗ trợ thiết lập tỷ lệ khung hình và chế độ lặp', () => {
    const mixer = new AudioMixer();
    const engine = new PreviewEngine(mixer);

    expect(engine.getAspectRatio()).toBe('16:9');
    expect(engine.getLooping()).toBe(false);

    engine.setAspectRatio('9:16');
    expect(engine.getAspectRatio()).toBe('9:16');

    engine.setAspectRatio('1:1');
    expect(engine.getAspectRatio()).toBe('1:1');

    engine.setLooping(true);
    expect(engine.getLooping()).toBe(true);

    mixer.cleanup();
    engine.cleanup();
  });

  test('PreviewEngine seek và điều hướng frame an toàn', () => {
    const mixer = new AudioMixer();
    const engine = new PreviewEngine(mixer);

    expect(() => {
      engine.seek(5.0, [dummyTrack], [dummyAsset], false);
      engine.renderFrame(5.0, [dummyTrack], [dummyAsset]);
    }).not.toThrow();

    mixer.cleanup();
    engine.cleanup();
  });
});
