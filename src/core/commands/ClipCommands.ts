import { Clip, TimelineState } from '@/types/timeline';
import { Command } from './Command';
import { recalculateDuration } from './commandUtils';

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
