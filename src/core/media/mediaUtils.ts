import { TrackType } from '@/types/timeline';

export interface ExtractedMetadata {
  duration: number;
  width?: number;
  height?: number;
  type: TrackType;
}

export function detectTrackType(file: File): TrackType {
  const mime = file.type.toLowerCase();
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('image/')) return 'image';
  if (mime.includes('text') || file.name.endsWith('.srt') || file.name.endsWith('.vtt')) return 'text';
  return 'video';
}

export function extractMediaMetadata(file: File, objectUrl: string): Promise<ExtractedMetadata> {
  const type = detectTrackType(file);

  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ duration: 5, type });
      return;
    }

    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        video.src = '';
        video.remove();
      };

      video.onloadedmetadata = () => {
        const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 5;
        const width = video.videoWidth || 1920;
        const height = video.videoHeight || 1080;
        cleanup();
        resolve({ duration, width, height, type: 'video' });
      };

      video.onerror = () => {
        cleanup();
        resolve({ duration: 5, width: 1920, height: 1080, type: 'video' });
      };

      video.src = objectUrl;
      return;
    }

    if (type === 'audio') {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      const cleanup = () => {
        audio.src = '';
        audio.remove();
      };

      audio.onloadedmetadata = () => {
        const duration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 5;
        cleanup();
        resolve({ duration, type: 'audio' });
      };

      audio.onerror = () => {
        cleanup();
        resolve({ duration: 5, type: 'audio' });
      };

      audio.src = objectUrl;
      return;
    }

    if (type === 'image') {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 1920;
        const height = img.naturalHeight || 1080;
        resolve({ duration: 5, width, height, type: 'image' });
      };
      img.onerror = () => {
        resolve({ duration: 5, width: 1920, height: 1080, type: 'image' });
      };
      img.src = objectUrl;
      return;
    }

    resolve({ duration: 5, type: 'text' });
  });
}

export function revokeObjectUrl(url: string): void {
  if (typeof window !== 'undefined' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
