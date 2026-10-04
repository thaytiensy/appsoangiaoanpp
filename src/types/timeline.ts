export type TrackType = 'video' | 'audio' | 'text' | 'image';

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: TrackType;
  url: string;
  duration: number;
  width?: number;
  height?: number;
  sampleRate?: number;
  channels?: number;
  mimeType: string;
}

export interface Clip {
  id: string;
  trackId: string;
  assetId: string;
  name: string;
  type: TrackType;
  start: number;
  end: number;
  sourceStart: number;
  sourceEnd: number;
  volume: number;
  muted: boolean;
  transform: Transform;
  textConfig?: {
    content: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
    fontFamily: string;
  };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  order: number;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  volume: number;
  clips: Clip[];
}

export interface TimelineState {
  tracks: Track[];
  assets: MediaAsset[];
  playheadTime: number;
  duration: number;
  zoom: number;
  selectedClipIds: string[];
  selectedTrackId: string | null;
  isPlaying: boolean;
  fps: number;
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
}
