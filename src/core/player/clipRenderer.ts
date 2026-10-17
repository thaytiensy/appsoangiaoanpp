import { Clip, MediaAsset } from '@/types/timeline';
import { AudioMixer } from './AudioMixer';

export function renderClipToCanvas(
  ctx: CanvasRenderingContext2D,
  clip: Clip,
  currentTime: number,
  assets: MediaAsset[],
  canvasW: number,
  canvasH: number,
  audioMixer: AudioMixer,
  imageCache: Map<string, HTMLImageElement>
): void {
  const asset = assets.find((a) => a.id === clip.assetId);
  const { x, y, scale, rotation, opacity } = clip.transform;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.translate(canvasW / 2 + x, canvasH / 2 + y);
  if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
  if (scale !== 1.0) ctx.scale(scale, scale);

  if (clip.type === 'video' && asset) {
    const mediaEl = audioMixer.getOrCreateMediaElement(asset) as HTMLVideoElement;
    if (mediaEl && mediaEl.readyState >= 2) {
      ctx.drawImage(mediaEl, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
    }
  } else if (clip.type === 'image' && asset) {
    let img = imageCache.get(asset.id);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = asset.url;
      imageCache.set(asset.id, img);
    }
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
    }
  } else if (clip.type === 'text') {
    const config = clip.textConfig || {
      content: clip.name,
      fontSize: 72,
      color: '#ffffff',
      fontFamily: 'sans-serif',
    };

    ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (config.backgroundColor) {
      const textMetrics = ctx.measureText(config.content);
      const textW = textMetrics.width + 40;
      const textH = config.fontSize * 1.4;
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(-textW / 2, -textH / 2, textW, textH);
    }

    ctx.fillStyle = config.color;
    ctx.fillText(config.content, 0, 0);
  }

  ctx.restore();
}
