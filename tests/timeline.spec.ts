import { test, expect } from '@playwright/test';
import { calculateSnapping } from '../src/core/timeline/snapping';
import { Track, Clip, TimelineState } from '../src/types/timeline';
import { AddClipCommand, MoveClipCommand, SplitClipCommand, RemoveClipCommand } from '../src/core/commands/Command';
import { ResizeClipCommand } from '../src/core/commands/ResizeClipCommand';
import { HistoryManager } from '../src/core/commands/HistoryManager';

test.describe('Timeline Engine & Snapping Algorithms', () => {
  const dummyClip: Clip = {
    id: 'c1',
    trackId: 't1',
    assetId: 'a1',
    name: 'Sample Video',
    type: 'video',
    start: 2,
    end: 8,
    sourceStart: 0,
    sourceEnd: 6,
    volume: 1,
    muted: false,
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
  };

  const dummyTrack: Track = {
    id: 't1',
    name: 'Track 1',
    type: 'video',
    order: 0,
    muted: false,
    locked: false,
    visible: true,
    volume: 1,
    clips: [dummyClip],
  };

  test('calculateSnapping nên hút chính xác vào Playhead khi gần Playhead', () => {
    const playheadTime = 10;
    const zoom = 50; // threshold = 10 / 50 = 0.2s
    const candidateStart = 9.9; // cách playhead 0.1s -> nằm trong threshold

    const result = calculateSnapping(candidateStart, 4, [dummyTrack], playheadTime, zoom);
    expect(result.hasSnapped).toBe(true);
    expect(result.snappedTime).toBe(10);
    expect(result.snapType).toBe('playhead');
  });

  test('calculateSnapping nên hút đuôi clip vào đầu clip khác', () => {
    // Clip target bắt đầu tại 2s. Clip đang kéo có duration 3s, candidateStart = -1.1s -> đuôi = 1.9s
    // Đuôi 1.9s cách điểm 2s là 0.1s -> hút đuôi vào 2s -> start mới = 2 - 3 = -1 => clamp 0
    const zoom = 50;
    const result = calculateSnapping(1.9, 5, [dummyTrack], 0, zoom);
    expect(result.hasSnapped).toBe(true);
    expect(result.snappedTime).toBe(2);
  });

  test('SplitClipCommand chia đôi clip chuẩn xác và hỗ trợ Undo/Redo', () => {
    const history = new HistoryManager(10);
    const initial: TimelineState = {
      tracks: [dummyTrack],
      assets: [],
      playheadTime: 5,
      duration: 30,
      zoom: 50,
      selectedClipIds: [],
      selectedTrackId: null,
      isPlaying: false,
      fps: 30,
    };

    const splitCmd = new SplitClipCommand('c1', 5);
    const splitState = history.execute(splitCmd, initial);

    const trackClips = splitState.tracks[0].clips;
    expect(trackClips.length).toBe(2);
    expect(trackClips[0].start).toBe(2);
    expect(trackClips[0].end).toBe(5);
    expect(trackClips[1].start).toBe(5);
    expect(trackClips[1].end).toBe(8);

    // Undo
    const reverted = history.undo(splitState);
    expect(reverted).not.toBeNull();
    expect(reverted!.tracks[0].clips.length).toBe(1);
    expect(reverted!.tracks[0].clips[0].end).toBe(8);
  });

  test('ResizeClipCommand kéo Trim đầu đuôi có giới hạn', () => {
    const initial: TimelineState = {
      tracks: [dummyTrack],
      assets: [{ id: 'a1', name: 'v.mp4', type: 'video', url: 'blob:1', duration: 10, mimeType: 'video/mp4' }],
      playheadTime: 0,
      duration: 30,
      zoom: 50,
      selectedClipIds: [],
      selectedTrackId: null,
      isPlaying: false,
      fps: 30,
    };

    // Trim đầu clip từ 2s thành 3s
    const trimStart = new ResizeClipCommand('c1', 'start', 3);
    const stateTrimmed = trimStart.execute(initial);
    expect(stateTrimmed.tracks[0].clips[0].start).toBe(3);
    expect(stateTrimmed.tracks[0].clips[0].sourceStart).toBe(1);

    // Undo
    const undone = trimStart.undo(stateTrimmed);
    expect(undone.tracks[0].clips[0].start).toBe(2);
  });
});
