import { Clip, HistoryState, TimelineState, Track, TrackType } from '@/types/timeline';
import { TrimEdge } from '@/core/commands/ResizeClipCommand';

export interface TimelineStore extends TimelineState {
  historyState: HistoryState;
  isSnappingEnabled: boolean;

  // Media & Clip Actions
  importMedia: (file: File) => Promise<Clip | null>;
  splitClipAtPlayhead: (targetTrackId?: string) => void;
  updateClipPosition: (clipId: string, newStart: number, newTrackId?: string) => void;
  resizeClip: (clipId: string, edge: TrimEdge, newTime: number) => void;
  removeClip: (clipId: string) => void;
  deleteSelectedClips: () => void;

  // Track Management
  addTrack: (type: TrackType, name?: string) => Track;
  removeTrack: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackVisibility: (trackId: string) => void;
  setTrackVolume: (trackId: string, volume: number) => void;

  // Playhead & Playback
  setPlayheadTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setZoom: (zoom: number) => void;
  toggleSnapping: () => void;

  // Selection
  selectClip: (clipId: string, multiSelect?: boolean) => void;
  selectAllClips: () => void;
  deselectAllClips: () => void;

  // History Actions
  undo: () => void;
  redo: () => void;

  // Memory & Cleanup
  cleanupMedia: () => void;
}

export const INITIAL_TRACKS: Track[] = [
  { id: 'track-v1', name: 'Video 1', type: 'video', order: 0, muted: false, locked: false, visible: true, volume: 1.0, clips: [] },
  { id: 'track-a1', name: 'Audio 1', type: 'audio', order: 1, muted: false, locked: false, visible: true, volume: 1.0, clips: [] },
  { id: 'track-t1', name: 'Text 1', type: 'text', order: 2, muted: false, locked: false, visible: true, volume: 1.0, clips: [] },
];
