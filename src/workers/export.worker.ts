import { ExportWorkerRequest, EXPORT_RESOLUTIONS } from '@/types/export';
import { WebMMuxer } from '@/core/export/webmMuxer';
import { drawWorkerFrameClip } from './workerCanvasRenderer';

export async function processExportInWorker(
  request: ExportWorkerRequest,
  onProgress: (percent: number, currentFrame: number, totalFrames: number, etaSeconds: number) => void,
  onComplete: (blob: Blob) => void,
  onError: (errorMsg: string) => void,
  checkCancelled: () => boolean
): Promise<void> {
  const { timeline, config } = request;
  const resolution = EXPORT_RESOLUTIONS[config.resolution][config.aspectRatio];
  const { width, height } = resolution;
  const fps = config.fps || 30;
  const duration = Math.max(0.5, timeline.duration);
  const totalFrames = Math.ceil(duration * fps);

  const muxer = new WebMMuxer({
    width,
    height,
    codec: 'V_VP8',
    durationSeconds: duration,
  });

  if (typeof VideoEncoder === 'undefined') {
    onError('Trình duyệt hiện tại không hỗ trợ WebCodecs VideoEncoder API.');
    return;
  }

  let encodeError: string | null = null;
  const encoder = new VideoEncoder({
    output: (chunk) => {
      const chunkData = new Uint8Array(chunk.byteLength);
      chunk.copyTo(chunkData);
      muxer.addVideoChunk(chunkData, chunk.timestamp, chunk.type === 'key');
    },
    error: (e) => {
      encodeError = e.message;
    },
  });

  try {
    encoder.configure({
      codec: 'vp8',
      width,
      height,
      bitrate: config.bitrate || 4_000_000,
      framerate: fps,
    });
  } catch (err) {
    onError(`Lỗi cấu hình VideoEncoder: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext('2d');
  if (!ctx) {
    onError('Không thể khởi tạo 2D context trên OffscreenCanvas.');
    return;
  }

  const startTime = performance.now();
  const sortedTracks = [...timeline.tracks].sort((a, b) => a.order - b.order);

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (checkCancelled()) {
      try {
        encoder.close();
      } catch {
        // Ignore on cancel
      }
      return;
    }

    if (encodeError) {
      onError(`Lỗi mã hóa khung hình: ${encodeError}`);
      return;
    }

    const currentTime = frameIndex / fps;
    const timestampMicros = Math.round(currentTime * 1_000_000);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    for (const track of sortedTracks) {
      if (!track.visible) continue;
      for (const clip of track.clips) {
        if (clip.start <= currentTime && currentTime <= clip.end) {
          drawWorkerFrameClip(ctx, clip, width, height);
        }
      }
    }

    const videoFrame = new VideoFrame(offscreen, { timestamp: timestampMicros });
    const isKeyframe = frameIndex % (fps * 2) === 0;
    encoder.encode(videoFrame, { keyFrame: isKeyframe });
    videoFrame.close();

    const elapsed = (performance.now() - startTime) / 1000;
    const progressPercent = Math.min(99, Math.round(((frameIndex + 1) / totalFrames) * 100));
    const eta = frameIndex > 0 ? (elapsed / frameIndex) * (totalFrames - frameIndex) : 0;
    onProgress(progressPercent, frameIndex + 1, totalFrames, Math.max(0, Math.ceil(eta)));

    if (frameIndex % 15 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  try {
    await encoder.flush();
    encoder.close();
    const webmBytes = muxer.finalize();
    const finalBlob = new Blob([webmBytes.buffer as ArrayBuffer], { type: 'video/webm' });
    onProgress(100, totalFrames, totalFrames, 0);
    onComplete(finalBlob);
  } catch (err) {
    onError(`Lỗi khi đóng gói video: ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (typeof self !== 'undefined' && typeof window === 'undefined') {
  let isCancelled = false;

  self.onmessage = async (e: MessageEvent) => {
    if (e.data.type === 'CANCEL_EXPORT') {
      isCancelled = true;
      return;
    }

    if (e.data.type === 'START_EXPORT') {
      isCancelled = false;
      await processExportInWorker(
        e.data,
        (percent, currentFrame, totalFrames, etaSeconds) => {
          self.postMessage({
            type: 'PROGRESS',
            progress: {
              status: 'rendering',
              percent,
              currentFrame,
              totalFrames,
              elapsedSeconds: 0,
              etaSeconds,
            },
          });
        },
        (blob) => {
          self.postMessage({ type: 'COMPLETE', blob });
        },
        (error) => {
          self.postMessage({ type: 'ERROR', error });
        },
        () => isCancelled
      );
    }
  };
}
