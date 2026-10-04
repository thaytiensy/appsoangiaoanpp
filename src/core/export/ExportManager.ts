import { TimelineState } from '@/types/timeline';
import { ExportConfig, ExportProgress } from '@/types/export';
import { processExportInWorker } from '@/workers/export.worker';

export class ExportManager {
  private isCancelled = false;
  private currentBlobUrl: string | null = null;

  public static isWebCodecsSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof VideoEncoder !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
  }

  public async startExport(
    timeline: TimelineState,
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<Blob> {
    this.isCancelled = false;
    this.cleanupBlobUrl();

    if (!ExportManager.isWebCodecsSupported()) {
      const errMsg =
        'Trình duyệt của bạn chưa hỗ trợ đầy đủ WebCodecs API (VideoEncoder / OffscreenCanvas). Vui lòng sử dụng Chrome, Edge hoặc Cốc Cốc phiên bản mới nhất.';
      onProgress({
        status: 'error',
        percent: 0,
        currentFrame: 0,
        totalFrames: 0,
        elapsedSeconds: 0,
        etaSeconds: 0,
        error: errMsg,
      });
      throw new Error(errMsg);
    }

    const startTime = performance.now();
    const fps = config.fps || 30;
    const totalFrames = Math.ceil(timeline.duration * fps);

    return new Promise<Blob>((resolve, reject) => {
      onProgress({
        status: 'rendering',
        percent: 0,
        currentFrame: 0,
        totalFrames,
        elapsedSeconds: 0,
        etaSeconds: 0,
      });

      processExportInWorker(
        { type: 'START_EXPORT', timeline, config },
        (percent, currentFrame, totalFramesCount, etaSeconds) => {
          if (this.isCancelled) return;
          const elapsed = (performance.now() - startTime) / 1000;
          onProgress({
            status: percent >= 100 ? 'muxing' : 'rendering',
            percent,
            currentFrame,
            totalFrames: totalFramesCount,
            elapsedSeconds: Math.round(elapsed),
            etaSeconds,
          });
        },
        (blob) => {
          if (this.isCancelled) {
            reject(new Error('Tiến trình xuất video đã bị hủy.'));
            return;
          }

          const blobUrl = URL.createObjectURL(blob);
          this.currentBlobUrl = blobUrl;
          const totalElapsed = (performance.now() - startTime) / 1000;

          onProgress({
            status: 'completed',
            percent: 100,
            currentFrame: totalFrames,
            totalFrames,
            elapsedSeconds: Math.round(totalElapsed),
            etaSeconds: 0,
            blobUrl,
            fileSizeBytes: blob.size,
          });

          resolve(blob);
        },
        (errorMsg) => {
          onProgress({
            status: 'error',
            percent: 0,
            currentFrame: 0,
            totalFrames,
            elapsedSeconds: 0,
            etaSeconds: 0,
            error: errorMsg,
          });
          reject(new Error(errorMsg));
        },
        () => this.isCancelled
      ).catch((err) => {
        reject(err);
      });
    });
  }

  public cancelExport(): void {
    this.isCancelled = true;
    this.cleanupBlobUrl();
  }

  public cleanupBlobUrl(): void {
    if (this.currentBlobUrl && typeof window !== 'undefined') {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
