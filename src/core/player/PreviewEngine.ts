import { TimelineState, Track, Clip, MediaAsset } from '@/types/timeline';
import { AspectRatio, ASPECT_RATIO_CONFIGS } from '@/types/preview';
import { AudioMixer } from './AudioMixer';

export class PreviewEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private audioMixer: AudioMixer;
  private imageCache = new Map<string, HTMLImageElement>();

  private animationFrameId: number | null = null;
  private lastFrameTimestamp = 0;
  private aspectRatio: AspectRatio = '16:9';
  private isLooping = false;
  private onTimeUpdateCallback?: (time: number) => void;
  private onPlaybackEndCallback?: () => void;

  constructor(audioMixer: AudioMixer) {
    this.audioMixer = audioMixer;
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.updateCanvasResolution();
  }

  public setAspectRatio(ratio: AspectRatio): void {
    this.aspectRatio = ratio;
    this.updateCanvasResolution();
  }

  public getAspectRatio(): AspectRatio {
    return this.aspectRatio;
  }

  public setLooping(loop: boolean): void {
    this.isLooping = loop;
  }

  public getLooping(): boolean {
    return this.isLooping;
  }

  public setOnTimeUpdate(cb: (time: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public setOnPlaybackEnd(cb: () => void): void {
    this.onPlaybackEndCallback = cb;
  }

  private updateCanvasResolution(): void {
    if (!this.canvas) return;
    const config = ASPECT_RATIO_CONFIGS[this.aspectRatio];
    this.canvas.width = config.width;
    this.canvas.height = config.height;
  }

  public startPlayback(
    state: TimelineState,
    onFrameUpdate: (nextTime: number) => void
  ): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.audioMixer.play(state.playheadTime, state.tracks, state.assets);
    this.lastFrameTimestamp = performance.now();

    const loop = (currentTimestamp: number) => {
      const deltaSeconds = (currentTimestamp - this.lastFrameTimestamp) / 1000;
      this.lastFrameTimestamp = currentTimestamp;

      let nextTime = state.playheadTime + deltaSeconds;

      if (nextTime >= state.duration) {
        if (this.isLooping) {
          nextTime = 0;
          this.audioMixer.seek(0, state.tracks, state.assets, true);
        } else {
          nextTime = state.duration;
          this.stopPlayback();
          if (this.onPlaybackEndCallback) this.onPlaybackEndCallback();
          onFrameUpdate(nextTime);
          this.renderFrame(nextTime, state.tracks, state.assets);
          return;
        }
      }

      state.playheadTime = nextTime;
      onFrameUpdate(nextTime);
      this.renderFrame(nextTime, state.tracks, state.assets);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopPlayback(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.audioMixer.pause();
  }

  public seek(time: number, tracks: Track[], assets: MediaAsset[], isPlaying: boolean): void {
    this.audioMixer.seek(time, tracks, assets, isPlaying);
    this.renderFrame(time, tracks, assets);
  }

  public renderFrame(currentTime: number, tracks: Track[], assets: MediaAsset[]): void {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 1. Xóa khung hình với nền tối chuẩn Studio
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 2. Sắp xếp thứ tự track từ dưới lên trên (thứ tự vẽ layer)
    const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

    for (const track of sortedTracks) {
      if (!track.visible) continue;

      for (const clip of track.clips) {
        if (clip.start <= currentTime && currentTime <= clip.end) {
          this.renderClip(ctx, clip, currentTime, assets, width, height);
        }
      }
    }
  }

  private renderClip(
    ctx: CanvasRenderingContext2D,
    clip: Clip,
    currentTime: number,
    assets: MediaAsset[],
    canvasW: number,
    canvasH: number
  ): void {
    const asset = assets.find((a) => a.id === clip.assetId);
    const { x, y, scale, rotation, opacity } = clip.transform;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.translate(canvasW / 2 + x, canvasH / 2 + y);
    if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
    if (scale !== 1.0) ctx.scale(scale, scale);

    if (clip.type === 'video' && asset) {
      const mediaEl = this.audioMixer.getOrCreateMediaElement(asset) as HTMLVideoElement;
      if (mediaEl && mediaEl.readyState >= 2) {
        const vw = mediaEl.videoWidth || canvasW;
        const vh = mediaEl.videoHeight || canvasH;
        ctx.drawImage(mediaEl, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
      }
    } else if (clip.type === 'image' && asset) {
      let img = this.imageCache.get(asset.id);
      if (!img) {
        img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = asset.url;
        this.imageCache.set(asset.id, img);
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

  public cleanup(): void {
    this.stopPlayback();
    this.imageCache.clear();
    this.canvas = null;
    this.ctx = null;
  }
}
