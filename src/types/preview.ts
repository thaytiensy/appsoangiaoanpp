export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface Resolution {
  width: number;
  height: number;
  label: string;
}

export const ASPECT_RATIO_CONFIGS: Record<AspectRatio, Resolution> = {
  '16:9': { width: 1920, height: 1080, label: 'Ngang (16:9) - YouTube/HD' },
  '9:16': { width: 1080, height: 1920, label: 'Dọc (9:16) - TikTok/Reels' },
  '1:1': { width: 1080, height: 1080, label: 'Vuông (1:1) - Instagram' },
};

export interface RenderLayerOptions {
  aspectRatio: AspectRatio;
  canvasWidth: number;
  canvasHeight: number;
}
