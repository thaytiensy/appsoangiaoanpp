import { AspectRatio } from './preview';
import { TimelineState } from './timeline';

export type ExportResolution = '720p' | '1080p' | '4K';
export type ExportFormat = 'webm' | 'mp4';

export interface ResolutionDimension {
  width: number;
  height: number;
}

export const EXPORT_RESOLUTIONS: Record<ExportResolution, Record<AspectRatio, ResolutionDimension>> = {
  '720p': {
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '1:1': { width: 720, height: 720 },
  },
  '1080p': {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
  },
  '4K': {
    '16:9': { width: 3840, height: 2160 },
    '9:16': { width: 2160, height: 3840 },
    '1:1': { width: 2160, height: 2160 },
  },
};

export interface ExportConfig {
  resolution: ExportResolution;
  aspectRatio: AspectRatio;
  fps: number;
  bitrate: number;
  format: ExportFormat;
}

export type ExportStatus = 'idle' | 'rendering' | 'muxing' | 'completed' | 'error' | 'cancelled';

export interface ExportProgress {
  status: ExportStatus;
  percent: number;
  currentFrame: number;
  totalFrames: number;
  elapsedSeconds: number;
  etaSeconds: number;
  error?: string;
  blobUrl?: string;
  fileSizeBytes?: number;
}

export interface ExportWorkerRequest {
  type: 'START_EXPORT';
  timeline: TimelineState;
  config: ExportConfig;
}

export interface ExportWorkerCancelRequest {
  type: 'CANCEL_EXPORT';
}

export interface ExportWorkerProgressMessage {
  type: 'PROGRESS';
  progress: ExportProgress;
}

export interface ExportWorkerCompleteMessage {
  type: 'COMPLETE';
  blob: Blob;
  totalFrames: number;
  durationSeconds: number;
}

export interface ExportWorkerErrorMessage {
  type: 'ERROR';
  error: string;
}

export type ExportWorkerResponse =
  | ExportWorkerProgressMessage
  | ExportWorkerCompleteMessage
  | ExportWorkerErrorMessage;
