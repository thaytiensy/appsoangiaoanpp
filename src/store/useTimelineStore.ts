import { create } from 'zustand';
import { Clip, HistoryState, MediaAsset, TimelineState, Track, TrackType } from '@/types/timeline';
import { HistoryManager } from '@/core/commands/HistoryManager';
import { AddClipCommand, MoveClipCommand, RemoveClipCommand, SplitClipCommand } from '@/core/commands/Command';
import { ResizeClipCommand, TrimEdge } from '@/core/commands/ResizeClipCommand';
import { extractMediaMetadata, revokeObjectUrl } from '@/core/media/mediaUtils';

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

const historyManager = new HistoryManager(50);

const INITIAL_TRACKS: Track[] = [
  { id: 'track-v1', name: 'Video 1', type: 'video', order: 0, muted: false, locked: false, visible: true, volume: 1.0, clips: [] },
  { id: 'track-a1', name: 'Audio 1', type: 'audio', order: 1, muted: false, locked: false, visible: true, volume: 1.0, clips: [] },
  { id: 'track-t1', name: 'Text 1', type: 'text', order: 2, muted: false, locked: false, visible: true, volume: 1.0, clips: [] },
];

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  tracks: INITIAL_TRACKS,
  assets: [],
  playheadTime: 0,
  duration: 30,
  zoom: 60,
  selectedClipIds: [],
  selectedTrackId: null,
  isPlaying: false,
  fps: 30,
  isSnappingEnabled: true,
  historyState: historyManager.getHistoryState(),

  importMedia: async (file: File): Promise<Clip | null> => {
    const objectUrl = URL.createObjectURL(file);
    const meta = await extractMediaMetadata(file, objectUrl);
    const assetId = `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const asset: MediaAsset = {
      id: assetId,
      name: file.name,
      type: meta.type,
      url: objectUrl,
      duration: meta.duration,
      width: meta.width,
      height: meta.height,
      mimeType: file.type,
    };

    let state = get();
    let targetTrack = state.tracks.find((t) => t.type === meta.type && !t.locked);
    if (!targetTrack) {
      targetTrack = get().addTrack(meta.type);
      state = get();
    }

    const start = state.playheadTime;
    const end = start + meta.duration;

    const clip: Clip = {
      id: `clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      trackId: targetTrack.id,
      assetId: asset.id,
      name: file.name,
      type: meta.type,
      start,
      end,
      sourceStart: 0,
      sourceEnd: meta.duration,
      volume: 1.0,
      muted: false,
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
    };

    const addCommand = new AddClipCommand(clip);
    const nextTimeline = historyManager.execute(addCommand, {
      ...state,
      assets: [...state.assets, asset],
    });

    set({
      ...nextTimeline,
      historyState: historyManager.getHistoryState(),
    });

    return clip;
  },

  splitClipAtPlayhead: (targetTrackId?: string) => {
    const state = get();
    const time = state.playheadTime;

    let candidateClip: Clip | null = null;
    for (const track of state.tracks) {
      if (track.locked) continue;
      if (targetTrackId && track.id !== targetTrackId) continue;
      const match = track.clips.find((c) => c.start < time && time < c.end);
      if (match) {
        candidateClip = match;
        break;
      }
    }

    if (!candidateClip) return;

    const splitCmd = new SplitClipCommand(candidateClip.id, time);
    const nextState = historyManager.execute(splitCmd, state);
    set({
      ...nextState,
      historyState: historyManager.getHistoryState(),
    });
  },

  updateClipPosition: (clipId: string, newStart: number, newTrackId?: string) => {
    const state = get();
    const moveCmd = new MoveClipCommand(clipId, newStart, newTrackId);
    const nextState = historyManager.execute(moveCmd, state);
    set({
      ...nextState,
      historyState: historyManager.getHistoryState(),
    });
  },

  resizeClip: (clipId: string, edge: TrimEdge, newTime: number) => {
    const state = get();
    const resizeCmd = new ResizeClipCommand(clipId, edge, newTime);
    const nextState = historyManager.execute(resizeCmd, state);
    set({
      ...nextState,
      historyState: historyManager.getHistoryState(),
    });
  },

  removeClip: (clipId: string) => {
    const state = get();
    const removeCmd = new RemoveClipCommand(clipId);
    const nextState = historyManager.execute(removeCmd, state);
    set({
      ...nextState,
      historyState: historyManager.getHistoryState(),
    });
  },

  deleteSelectedClips: () => {
    const state = get();
    if (state.selectedClipIds.length === 0) return;

    let nextTimeline: TimelineState = {
      tracks: state.tracks,
      assets: state.assets,
      playheadTime: state.playheadTime,
      duration: state.duration,
      zoom: state.zoom,
      selectedClipIds: state.selectedClipIds,
      selectedTrackId: state.selectedTrackId,
      isPlaying: state.isPlaying,
      fps: state.fps,
    };

    for (const clipId of state.selectedClipIds) {
      const removeCmd = new RemoveClipCommand(clipId);
      nextTimeline = historyManager.execute(removeCmd, nextTimeline);
    }

    set({
      ...nextTimeline,
      selectedClipIds: [],
      historyState: historyManager.getHistoryState(),
    });
  },

  addTrack: (type: TrackType, name?: string): Track => {
    const state = get();
    const count = state.tracks.filter((t) => t.type === type).length + 1;
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const newTrack: Track = {
      id: `track-${type[0]}-${Date.now()}`,
      name: name || `${typeLabel} ${count}`,
      type,
      order: state.tracks.length,
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      clips: [],
    };

    set({ tracks: [...state.tracks, newTrack] });
    return newTrack;
  },

  removeTrack: (trackId: string) => {
    const state = get();
    set({
      tracks: state.tracks.filter((t) => t.id !== trackId),
      selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId,
    });
  },

  toggleTrackMute: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    }));
  },

  toggleTrackLock: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    }));
  },

  toggleTrackVisibility: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t)),
    }));
  },

  setTrackVolume: (trackId: string, volume: number) => {
    const clamped = Math.max(0, Math.min(2.0, volume));
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, volume: clamped } : t)),
    }));
  },

  setPlayheadTime: (time: number) => {
    const state = get();
    const clamped = Math.max(0, Math.min(time, state.duration));
    set({ playheadTime: clamped });
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  setZoom: (zoom: number) => {
    const clamped = Math.max(10, Math.min(zoom, 300));
    set({ zoom: clamped });
  },

  toggleSnapping: () => set((state) => ({ isSnappingEnabled: !state.isSnappingEnabled })),

  selectClip: (clipId: string, multiSelect = false) => {
    set((state) => ({
      selectedClipIds: multiSelect
        ? state.selectedClipIds.includes(clipId)
          ? state.selectedClipIds.filter((id) => id !== clipId)
          : [...state.selectedClipIds, clipId]
        : [clipId],
    }));
  },

  selectAllClips: () => {
    const state = get();
    const allIds: string[] = [];
    for (const track of state.tracks) {
      for (const clip of track.clips) {
        allIds.push(clip.id);
      }
    }
    set({ selectedClipIds: allIds });
  },

  deselectAllClips: () => set({ selectedClipIds: [] }),

  undo: () => {
    const state = get();
    const reverted = historyManager.undo(state);
    if (reverted) {
      set({
        ...reverted,
        historyState: historyManager.getHistoryState(),
      });
    }
  },

  redo: () => {
    const state = get();
    const reapplied = historyManager.redo(state);
    if (reapplied) {
      set({
        ...reapplied,
        historyState: historyManager.getHistoryState(),
      });
    }
  },

  cleanupMedia: () => {
    const state = get();
    for (const asset of state.assets) {
      revokeObjectUrl(asset.url);
    }
    historyManager.clear();
    set({
      assets: [],
      tracks: INITIAL_TRACKS.map((t) => ({ ...t, clips: [] })),
      selectedClipIds: [],
      playheadTime: 0,
      historyState: historyManager.getHistoryState(),
    });
  },
}));
