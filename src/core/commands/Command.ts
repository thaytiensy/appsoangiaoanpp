import { Clip, TimelineState, Track } from '@/types/timeline';

export interface Command {
  readonly id: string;
  readonly name: string;
  execute(state: TimelineState): TimelineState;
  undo(state: TimelineState): TimelineState;
}

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

export class AddClipCommand implements Command {
  readonly id: string;
  readonly name = 'Add Clip';
  private clip: Clip;

  constructor(clip: Clip) {
    this.id = `add-clip-${clip.id}-${Date.now()}`;
    this.clip = { ...clip, transform: { ...clip.transform } };
  }

  execute(state: TimelineState): TimelineState {
    const targetTrack = state.tracks.find((t) => t.id === this.clip.trackId);
    if (!targetTrack) return state;

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== this.clip.trackId) return track;
      const updatedClips = [...track.clips, this.clip].sort((a, b) => a.start - b.start);
      return { ...track, clips: updatedClips };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [this.clip.id],
    };
  }

  undo(state: TimelineState): TimelineState {
    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== this.clip.trackId) return track;
      return {
        ...track,
        clips: track.clips.filter((c) => c.id !== this.clip.id),
      };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: state.selectedClipIds.filter((id) => id !== this.clip.id),
    };
  }
}

export class RemoveClipCommand implements Command {
  readonly id: string;
  readonly name = 'Remove Clip';
  private clipId: string;
  private removedClip: Clip | null = null;
  private originalTrackId: string | null = null;

  constructor(clipId: string) {
    this.id = `remove-clip-${clipId}-${Date.now()}`;
    this.clipId = clipId;
  }

  execute(state: TimelineState): TimelineState {
    let foundClip: Clip | null = null;
    let trackId: string | null = null;

    for (const track of state.tracks) {
      const match = track.clips.find((c) => c.id === this.clipId);
      if (match) {
        foundClip = { ...match, transform: { ...match.transform } };
        trackId = track.id;
        break;
      }
    }

    if (!foundClip || !trackId) return state;

    this.removedClip = foundClip;
    this.originalTrackId = trackId;

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== trackId) return track;
      return {
        ...track,
        clips: track.clips.filter((c) => c.id !== this.clipId),
      };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: state.selectedClipIds.filter((id) => id !== this.clipId),
    };
  }

  undo(state: TimelineState): TimelineState {
    if (!this.removedClip || !this.originalTrackId) return state;

    const clipToRestore = this.removedClip;
    const targetTrackId = this.originalTrackId;

    const updatedTracks = state.tracks.map((track) => {
      if (track.id !== targetTrackId) return track;
      const updatedClips = [...track.clips, clipToRestore].sort((a, b) => a.start - b.start);
      return { ...track, clips: updatedClips };
    });

    return {
      ...state,
      tracks: updatedTracks,
      duration: recalculateDuration(updatedTracks),
      selectedClipIds: [clipToRestore.id],
    };
  }
}

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
