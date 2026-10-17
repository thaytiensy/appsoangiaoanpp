import { Clip, TimelineState } from '@/types/timeline';
import { Command } from './Command';
import { recalculateDuration } from './commandUtils';

export class MoveClipCommand implements Command {
  readonly id: string;
  readonly name = 'Move Clip';
  private clipId: string;
  private newStart: number;
  private newTrackId?: string;

  private prevTrackId: string | null = null;
  private prevStart: number | null = null;
  private prevEnd: number | null = null;
  private movedClipEnd: number | null = null;

  constructor(clipId: string, newStart: number, newTrackId?: string) {
    this.id = `move-clip-${clipId}-${Date.now()}`;
    this.clipId = clipId;
    this.newStart = Math.max(0, newStart);
    this.newTrackId = newTrackId;
  }

  execute(state: TimelineState): TimelineState {
    let sourceClip: Clip | null = null;
    let sourceTrackId: string | null = null;

    for (const track of state.tracks) {
      const match = track.clips.find((c) => c.id === this.clipId);
      if (match) {
        sourceClip = match;
        sourceTrackId = track.id;
        break;
      }
    }

    if (!sourceClip || !sourceTrackId) return state;

    this.prevTrackId = sourceTrackId;
    this.prevStart = sourceClip.start;
    this.prevEnd = sourceClip.end;

    const clipDuration = sourceClip.end - sourceClip.start;
    const targetStart = this.newStart;
    const targetEnd = targetStart + clipDuration;
    const targetTrackId = this.newTrackId || sourceTrackId;
    this.movedClipEnd = targetEnd;

    const updatedClip: Clip = {
      ...sourceClip,
      trackId: targetTrackId,
      start: targetStart,
      end: targetEnd,
      transform: { ...sourceClip.transform },
    };

    const updatedTracks = state.tracks.map((track) => {
      if (sourceTrackId === targetTrackId) {
        if (track.id !== sourceTrackId) return track;
        const filtered = track.clips.filter((c) => c.id !== this.clipId);
        return {
          ...track,
          clips: [...filtered, updatedClip].sort((a, b) => a.start - b.start),
        };
      }

      if (track.id === sourceTrackId) {
        return {
          ...track,
          clips: track.clips.filter((c) => c.id !== this.clipId),
        };
      }

      if (track.id === targetTrackId) {
        return {
          ...track,
          clips: [...track.clips, updatedClip].sort((a, b) => a.start - b.start),
        };
      }

      return track;
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [this.clipId],
    };
  }

  undo(state: TimelineState): TimelineState {
    if (this.prevTrackId === null || this.prevStart === null || this.prevEnd === null) {
      return state;
    }

    const currentTrackId = this.newTrackId || this.prevTrackId;
    let currentClip: Clip | null = null;

    for (const track of state.tracks) {
      const match = track.clips.find((c) => c.id === this.clipId);
      if (match) {
        currentClip = match;
        break;
      }
    }

    if (!currentClip) return state;

    const revertedClip: Clip = {
      ...currentClip,
      trackId: this.prevTrackId,
      start: this.prevStart,
      end: this.prevEnd,
      transform: { ...currentClip.transform },
    };

    const updatedTracks = state.tracks.map((track) => {
      if (this.prevTrackId === currentTrackId) {
        if (track.id !== this.prevTrackId) return track;
        const filtered = track.clips.filter((c) => c.id !== this.clipId);
        return {
          ...track,
          clips: [...filtered, revertedClip].sort((a, b) => a.start - b.start),
        };
      }

      if (track.id === currentTrackId) {
        return {
          ...track,
          clips: track.clips.filter((c) => c.id !== this.clipId),
        };
      }

      if (track.id === this.prevTrackId) {
        return {
          ...track,
          clips: [...track.clips, revertedClip].sort((a, b) => a.start - b.start),
        };
      }

      return track;
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [this.clipId],
    };
  }
}
