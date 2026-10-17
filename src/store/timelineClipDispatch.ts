import { Clip, MediaAsset, TimelineState, Track, TrackType } from '@/types/timeline';
import { HistoryManager } from '@/core/commands/HistoryManager';
import { AddClipCommand, MoveClipCommand, RemoveClipCommand, SplitClipCommand } from '@/core/commands/Command';
import { ResizeClipCommand, TrimEdge } from '@/core/commands/ResizeClipCommand';
import { extractMediaMetadata } from '@/core/media/mediaUtils';

export async function dispatchImportMedia(
  file: File,
  getState: () => TimelineState,
  historyManager: HistoryManager,
  addTrack: (type: TrackType) => Track
): Promise<{ clip: Clip; nextState: TimelineState; asset: MediaAsset } | null> {
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

  let state = getState();
  let targetTrack = state.tracks.find((t) => t.type === meta.type && !t.locked);
  if (!targetTrack) {
    targetTrack = addTrack(meta.type);
    state = getState();
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

  return { clip, nextState: nextTimeline, asset };
}

export function dispatchSplitClip(
  state: TimelineState,
  historyManager: HistoryManager,
  targetTrackId?: string
): TimelineState | null {
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

  if (!candidateClip) return null;
  const splitCmd = new SplitClipCommand(candidateClip.id, time);
  return historyManager.execute(splitCmd, state);
}

export function dispatchMoveClip(
  state: TimelineState,
  historyManager: HistoryManager,
  clipId: string,
  newStart: number,
  newTrackId?: string
): TimelineState {
  const moveCmd = new MoveClipCommand(clipId, newStart, newTrackId);
  return historyManager.execute(moveCmd, state);
}

export function dispatchResizeClip(
  state: TimelineState,
  historyManager: HistoryManager,
  clipId: string,
  edge: TrimEdge,
  newTime: number
): TimelineState {
  const resizeCmd = new ResizeClipCommand(clipId, edge, newTime);
  return historyManager.execute(resizeCmd, state);
}
