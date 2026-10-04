import { Track, MediaAsset } from '@/types/timeline';

export class AudioMixer {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGains = new Map<string, GainNode>();
  private mediaElements = new Map<string, HTMLMediaElement>();
  private sourceNodes = new Map<HTMLMediaElement, MediaElementAudioSourceNode>();
  private isMuted = false;
  private masterVolume = 1.0;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    } catch (err) {
      console.warn('Web Audio API is not supported or was blocked:', err);
    }
  }

  private ensureAudioContextRunning(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch((err) => {
        console.warn('Unable to resume AudioContext automatically:', err);
      });
    }
  }

  public getOrCreateMediaElement(asset: MediaAsset): HTMLMediaElement {
    let el = this.mediaElements.get(asset.id);
    if (!el && typeof window !== 'undefined') {
      if (asset.type === 'video') {
        const video = document.createElement('video');
        video.src = asset.url;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        el = video;
      } else {
        const audio = document.createElement('audio');
        audio.src = asset.url;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        el = audio;
      }
      this.mediaElements.set(asset.id, el);

      // Định tuyến âm thanh qua Web Audio API GainNode nếu AudioContext khả dụng
      if (this.audioCtx && this.masterGain && !this.sourceNodes.has(el)) {
        try {
          const source = this.audioCtx.createMediaElementSource(el);
          this.sourceNodes.set(el, source);
        } catch {
          // Bỏ qua nếu phần tử media đã được kết nối trước đó
        }
      }
    }
    return el!;
  }

  public updateTrackGain(trackId: string, volume: number, muted: boolean): void {
    if (!this.audioCtx || !this.masterGain) return;

    let trackGain = this.trackGains.get(trackId);
    if (!trackGain) {
      trackGain = this.audioCtx.createGain();
      trackGain.connect(this.masterGain);
      this.trackGains.set(trackId, trackGain);
    }

    const effectiveVolume = muted ? 0 : Math.max(0, Math.min(2.0, volume));
    trackGain.gain.setValueAtTime(effectiveVolume, this.audioCtx.currentTime);
  }

  public play(currentTime: number, tracks: Track[], assets: MediaAsset[]): void {
    this.ensureAudioContextRunning();

    for (const track of tracks) {
      if (track.locked || track.type === 'text' || track.type === 'image') continue;

      this.updateTrackGain(track.id, track.volume, track.muted);
      const trackGain = this.trackGains.get(track.id);

      for (const clip of track.clips) {
        if (clip.start <= currentTime && currentTime < clip.end) {
          const asset = assets.find((a) => a.id === clip.assetId);
          if (!asset) continue;

          const el = this.getOrCreateMediaElement(asset);
          if (!el) continue;

          const offsetInClip = currentTime - clip.start;
          const targetSourceTime = clip.sourceStart + offsetInClip;

          // Kết nối SourceNode vào TrackGainNode nếu chưa kết nối
          const sourceNode = this.sourceNodes.get(el);
          if (sourceNode && trackGain) {
            try {
              sourceNode.disconnect();
              sourceNode.connect(trackGain);
            } catch {
              // Bỏ qua lỗi kết nối lại
            }
          }

          if (Math.abs(el.currentTime - targetSourceTime) > 0.08) {
            el.currentTime = targetSourceTime;
          }

          el.muted = clip.muted || track.muted;
          el.volume = clip.muted ? 0 : Math.max(0, Math.min(1.0, clip.volume));

          el.play().catch(() => {
            // Autoplay policy của trình duyệt có thể hoãn
          });
        }
      }
    }
  }

  public pause(): void {
    this.mediaElements.forEach((el) => {
      if (!el.paused) {
        el.pause();
      }
    });
  }

  public seek(currentTime: number, tracks: Track[], assets: MediaAsset[], isPlaying: boolean): void {
    const activeAssetIds = new Set<string>();

    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.start <= currentTime && currentTime <= clip.end) {
          activeAssetIds.add(clip.assetId);
          const asset = assets.find((a) => a.id === clip.assetId);
          if (!asset) continue;

          const el = this.getOrCreateMediaElement(asset);
          if (!el) continue;

          const offsetInClip = currentTime - clip.start;
          const targetSourceTime = clip.sourceStart + offsetInClip;

          if (Math.abs(el.currentTime - targetSourceTime) > 0.05) {
            el.currentTime = targetSourceTime;
          }

          if (isPlaying && el.paused && !track.locked) {
            el.play().catch(() => {});
          }
        }
      }
    }

    // Tạm dừng các media element không còn nằm trong phạm vi phát
    this.mediaElements.forEach((el, assetId) => {
      if (!activeAssetIds.has(assetId) && !el.paused) {
        el.pause();
      }
    });
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1.0, vol));
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setMasterVolume(this.masterVolume);
    return this.isMuted;
  }

  public cleanup(): void {
    this.pause();
    this.mediaElements.forEach((el) => {
      el.src = '';
      el.load();
    });
    this.mediaElements.clear();
    this.sourceNodes.clear();
    this.trackGains.clear();

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
    this.audioCtx = null;
    this.masterGain = null;
  }
}
