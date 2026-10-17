import { create } from 'zustand';
import { Clip, TimelineState, Track, TrackType } from '@/types/timeline';
import { HistoryManager } from '@/core/commands/HistoryManager';
import { RemoveClipCommand } from '@/core/commands/Command';
import { TrimEdge } from '@/core/commands/ResizeClipCommand';
import { revokeObjectUrl } from '@/core/media/mediaUtils';
import { TimelineStore, INITIAL_TRACKS } from './timelineStoreTypes';
import {
  dispatchImportMedia,
  dispatchSplitClip,
  dispatchMoveClip,
  dispatchResizeClip,
} from './timelineClipDispatch';

export type { TimelineStore };
export { INITIAL_TRACKS };

const historyManager = new HistoryManager(50);

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
    const res = await dispatchImportMedia(file, get, historyManager, (type) => get().addTrack(type));
    if (!res) return null;
    set({ ...res.nextState, historyState: historyManager.getHistoryState() });
    return res.clip;
  },

  splitClipAtPlayhead: (targetTrackId?: string) => {
    const nextState = dispatchSplitClip(get(), historyManager, targetTrackId);
    if (nextState) {
      set({ ...nextState, historyState: historyManager.getHistoryState() });
    }
  },

  updateClipPosition: (clipId: string, newStart: number, newTrackId?: string) => {
    const nextState = dispatchMoveClip(get(), historyManager, clipId, newStart, newTrackId);
    set({ ...nextState, historyState: historyManager.getHistoryState() });
  },

  resizeClip: (clipId: string, edge: TrimEdge, newTime: number) => {
    const nextState = dispatchResizeClip(get(), historyManager, clipId, edge, newTime);
    set({ ...nextState, historyState: historyManager.getHistoryState() });
  },

  removeClip: (clipId: string) => {
    const removeCmd = new RemoveClipCommand(clipId);
    const nextState = historyManager.execute(removeCmd, get());
    set({ ...nextState, historyState: historyManager.getHistoryState() });
  },

  deleteSelectedClips: () => {
    const state = get();
    if (state.selectedClipIds.length === 0) return;

    let nextTimeline: TimelineState = { ...state };
    for (const clipId of state.selectedClipIds) {
      nextTimeline = historyManager.execute(new RemoveClipCommand(clipId), nextTimeline);
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
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
      selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId,
    }));
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
    const clamped = Math.max(0, Math.min(time, get().duration));
    set({ playheadTime: clamped });
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  setZoom: (zoom: number) => {
    set({ zoom: Math.max(10, Math.min(zoom, 300)) });
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
    const allIds = get().tracks.flatMap((t) => t.clips.map((c) => c.id));
    set({ selectedClipIds: allIds });
  },

  deselectAllClips: () => set({ selectedClipIds: [] }),

  undo: () => {
    const reverted = historyManager.undo(get());
    if (reverted) {
      set({ ...reverted, historyState: historyManager.getHistoryState() });
    }
  },

  redo: () => {
    const reapplied = historyManager.redo(get());
    if (reapplied) {
      set({ ...reapplied, historyState: historyManager.getHistoryState() });
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
