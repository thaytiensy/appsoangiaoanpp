import { Clip } from '@/types/timeline';

export function drawWorkerFrameClip(
  ctx: OffscreenCanvasRenderingContext2D,
  clip: Clip,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, clip.transform.opacity));
  ctx.translate(width / 2 + clip.transform.x, height / 2 + clip.transform.y);
  if (clip.transform.rotation !== 0) {
    ctx.rotate((clip.transform.rotation * Math.PI) / 180);
  }
  if (clip.transform.scale !== 1.0) {
    ctx.scale(clip.transform.scale, clip.transform.scale);
  }

  if (clip.type === 'text') {
    const cfg = clip.textConfig || {
      content: clip.name,
      fontSize: 64,
      color: '#ffffff',
      fontFamily: 'sans-serif',
    };
    ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (cfg.backgroundColor) {
      const metrics = ctx.measureText(cfg.content);
      ctx.fillStyle = cfg.backgroundColor;
      ctx.fillRect(-metrics.width / 2 - 20, -cfg.fontSize / 2 - 10, metrics.width + 40, cfg.fontSize + 20);
    }

    ctx.fillStyle = cfg.color;
    ctx.fillText(cfg.content, 0, 0);
  } else {
    ctx.fillStyle = clip.type === 'video' ? '#4f46e5' : '#0284c7';
    ctx.fillRect(-width * 0.4, -height * 0.4, width * 0.8, height * 0.8);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(clip.name, 0, 0);
  }

  ctx.restore();
}
