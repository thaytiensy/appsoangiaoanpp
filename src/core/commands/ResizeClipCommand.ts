import { Clip, TimelineState, Track } from '@/types/timeline';
import { Command } from './Command';

export type TrimEdge = 'start' | 'end';

function recalculateDuration(tracks: Track[]): number {
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

export class ResizeClipCommand implements Command {
  readonly id: string;
  readonly name = 'Resize / Trim Clip';
  private clipId: string;
  private edge: TrimEdge;
  private newTime: number;

  private prevClip: Clip | null = null;
  private trackId: string | null = null;

  constructor(clipId: string, edge: TrimEdge, newTime: number) {
    this.id = `resize-clip-${clipId}-${Date.now()}`;
    this.clipId = clipId;
    this.edge = edge;
    this.newTime = newTime;
  }

  execute(state: TimelineState): TimelineState {
    let targetClip: Clip | null = null;
    let foundTrackId: string | null = null;

    for (const track of state.tracks) {
      const match = track.clips.find((c) => c.id === this.clipId);
      if (match) {
        targetClip = match;
        foundTrackId = track.id;
        break;
      }
    }

    if (!targetClip || !foundTrackId) return state;

    this.prevClip = { ...targetClip, transform: { ...targetClip.transform } };
    this.trackId = foundTrackId;

    const minDuration = 0.1;
    let updatedClip: Clip;

    if (this.edge === 'start') {
      const maxAllowedStart = targetClip.end - minDuration;
      const minAllowedStart = Math.max(0, targetClip.start - targetClip.sourceStart);
      const clampedStart = Math.max(minAllowedStart, Math.min(this.newTime, maxAllowedStart));
      const delta = clampedStart - targetClip.start;
      const updatedSourceStart = Math.max(0, targetClip.sourceStart + delta);

      updatedClip = {
        ...targetClip,
        start: clampedStart,
        sourceStart: updatedSourceStart,
        transform: { ...targetClip.transform },
      };
    } else {
      const minAllowedEnd = targetClip.start + minDuration;
      const asset = state.assets.find((a) => a.id === targetClip.assetId);
      const maxAssetDuration = asset ? asset.duration : Infinity;
      const maxAvailableLength = maxAssetDuration - targetClip.sourceStart;
      const maxAllowedEnd = targetClip.start + maxAvailableLength;

      const clampedEnd = Math.max(minAllowedEnd, Math.min(this.newTime, maxAllowedEnd));
      const delta = clampedEnd - targetClip.end;
      const updatedSourceEnd = targetClip.sourceEnd + delta;

      updatedClip = {
        ...targetClip,
        end: clampedEnd,
        sourceEnd: updatedSourceEnd,
        transform: { ...targetClip.transform },
      };
    }

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== foundTrackId) return track;
      const filtered = track.clips.filter((c) => c.id !== this.clipId);
      const sorted = [...filtered, updatedClip].sort((a, b) => a.start - b.start);
      return { ...track, clips: sorted };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [this.clipId],
    };
  }

  undo(state: TimelineState): TimelineState {
    if (!this.prevClip || !this.trackId) return state;

    const original = this.prevClip;
    const targetTrackId = this.trackId;

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== targetTrackId) return track;
      const filtered = track.clips.filter((c) => c.id !== original.id);
      const sorted = [...filtered, original].sort((a, b) => a.start - b.start);
      return { ...track, clips: sorted };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [original.id],
    };
  }
}
