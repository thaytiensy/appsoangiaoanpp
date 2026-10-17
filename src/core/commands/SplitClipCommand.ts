import { Clip, TimelineState } from '@/types/timeline';
import { Command } from './Command';
import { recalculateDuration } from './commandUtils';

export class SplitClipCommand implements Command {
  readonly id: string;
  readonly name = 'Split Clip';
  private clipId: string;
  private splitTime: number;

  private originalClip: Clip | null = null;
  private createdSecondClipId: string | null = null;

  constructor(clipId: string, splitTime: number) {
    this.id = `split-clip-${clipId}-${Date.now()}`;
    this.clipId = clipId;
    this.splitTime = splitTime;
  }

  execute(state: TimelineState): TimelineState {
    let targetClip: Clip | null = null;
    let trackId: string | null = null;

    for (const track of state.tracks) {
      const match = track.clips.find((c) => c.id === this.clipId);
      if (match) {
        targetClip = match;
        trackId = track.id;
        break;
      }
    }

    if (!targetClip || !trackId) return state;
    if (this.splitTime <= targetClip.start || this.splitTime >= targetClip.end) {
      return state;
    }

    this.originalClip = { ...targetClip, transform: { ...targetClip.transform } };
    const offset = this.splitTime - targetClip.start;
    const splitSourcePoint = targetClip.sourceStart + offset;
    const secondClipId = `clip-${targetClip.assetId}-${Date.now()}`;
    this.createdSecondClipId = secondClipId;

    const firstClip: Clip = {
      ...targetClip,
      end: this.splitTime,
      sourceEnd: splitSourcePoint,
      transform: { ...targetClip.transform },
    };

    const secondClip: Clip = {
      ...targetClip,
      id: secondClipId,
      name: `${targetClip.name} (Part 2)`,
      start: this.splitTime,
      sourceStart: splitSourcePoint,
      transform: { ...targetClip.transform },
    };

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== trackId) return track;
      const remainingClips = track.clips.filter((c) => c.id !== this.clipId);
      const newClips = [...remainingClips, firstClip, secondClip].sort((a, b) => a.start - b.start);
      return { ...track, clips: newClips };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [secondClip.id],
    };
  }

  undo(state: TimelineState): TimelineState {
    if (!this.originalClip || !this.createdSecondClipId) return state;

    const trackId = this.originalClip.trackId;
    const restoredClip = this.originalClip;
    const secondId = this.createdSecondClipId;

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== trackId) return track;
      const cleaned = track.clips.filter((c) => c.id !== restoredClip.id && c.id !== secondId);
      return {
        ...track,
        clips: [...cleaned, restoredClip].sort((a, b) => a.start - b.start),
      };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [restoredClip.id],
    };
  }
}
