import { Track } from '@/types/timeline';

export interface SnapTarget {
  time: number;
  type: 'start' | 'end' | 'playhead' | 'zero';
  label: string;
}

export interface SnapResult {
  snappedTime: number;
  hasSnapped: boolean;
  activeSnapPoint?: number;
  snapType?: SnapTarget['type'];
}

export function collectSnapTargets(
  tracks: Track[],
  playheadTime: number,
  ignoreClipId?: string
): SnapTarget[] {
  const targets: SnapTarget[] = [
    { time: 0, type: 'zero', label: 'Timeline Start (0s)' },
    { time: playheadTime, type: 'playhead', label: 'Playhead Position' },
  ];

  for (const track of tracks) {
    if (track.locked) continue;
    for (const clip of track.clips) {
      if (ignoreClipId && clip.id === ignoreClipId) continue;
      targets.push({
        time: clip.start,
        type: 'start',
        label: `Start of ${clip.name}`,
      });
      targets.push({
        time: clip.end,
        type: 'end',
        label: `End of ${clip.name}`,
      });
    }
  }

  return targets;
}

export function calculateSnapping(
  candidateStart: number,
  clipDuration: number,
  tracks: Track[],
  playheadTime: number,
  zoom: number,
  ignoreClipId?: string,
  thresholdPixels = 10
): SnapResult {
  const thresholdSeconds = thresholdPixels / Math.max(10, zoom);
  const targets = collectSnapTargets(tracks, playheadTime, ignoreClipId);

  let bestDiff = Infinity;
  let snappedStart = candidateStart;
  let hasSnapped = false;
  let activePoint: number | undefined;
  let activeType: SnapTarget['type'] | undefined;

  const candidateEnd = candidateStart + clipDuration;

  for (const target of targets) {
    // 1. Kiểm tra Snap cho điểm đầu clip (candidateStart -> target.time)
    const diffStart = Math.abs(candidateStart - target.time);
    if (diffStart <= thresholdSeconds && diffStart < bestDiff) {
      bestDiff = diffStart;
      snappedStart = target.time;
      hasSnapped = true;
      activePoint = target.time;
      activeType = target.type;
    }

    // 2. Kiểm tra Snap cho điểm đuôi clip (candidateEnd -> target.time => start = target.time - clipDuration)
    const diffEnd = Math.abs(candidateEnd - target.time);
    if (diffEnd <= thresholdSeconds && diffEnd < bestDiff) {
      bestDiff = diffEnd;
      snappedStart = Math.max(0, target.time - clipDuration);
      hasSnapped = true;
      activePoint = target.time;
      activeType = target.type;
    }
  }

  return {
    snappedTime: Math.max(0, snappedStart),
    hasSnapped,
    activeSnapPoint: activePoint,
    snapType: activeType,
  };
}
