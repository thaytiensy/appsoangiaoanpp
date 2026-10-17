import { Track } from '@/types/timeline';

export function recalculateDuration(tracks: Track[]): number {
  let maxEnd = 0;
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (clip.end > maxEnd) {
        maxEnd = clip.end;
      }
    }
  }
  return Math.max(30, Math.ceil(maxEnd));
}
