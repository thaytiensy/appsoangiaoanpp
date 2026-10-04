import { ExportWorkerRequest } from '@/types/export';
import { EXPORT_RESOLUTIONS } from '@/types/export';
import { WebMMuxer } from '@/core/export/webmMuxer';

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

  // Kiểm tra hỗ trợ WebCodecs VideoEncoder
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

  // Khởi tạo OffscreenCanvas cho headless render
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
        // Bỏ qua lỗi khi hủy
      }
      return;
    }

    if (encodeError) {
      onError(`Lỗi mã hóa khung hình: ${encodeError}`);
      return;
    }

    const currentTime = frameIndex / fps;
    const timestampMicros = Math.round(currentTime * 1_000_000);

    // 1. Render Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 2. Render từng layer track
    for (const track of sortedTracks) {
      if (!track.visible) continue;

      for (const clip of track.clips) {
        if (clip.start <= currentTime && currentTime <= clip.end) {
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
            // Render khung đồ họa nền tượng trưng cho Video/Image
            ctx.fillStyle = clip.type === 'video' ? '#4f46e5' : '#0284c7';
            ctx.fillRect(-width * 0.4, -height * 0.4, width * 0.8, height * 0.8);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(clip.name, 0, 0);
          }

          ctx.restore();
        }
      }
    }

    // 3. Tạo VideoFrame từ OffscreenCanvas
    const videoFrame = new VideoFrame(offscreen, { timestamp: timestampMicros });
    const isKeyframe = frameIndex % (fps * 2) === 0;

    encoder.encode(videoFrame, { keyFrame: isKeyframe });

    // 4. BẮT BUỘC: Giải phóng VideoFrame lập tức để chống tràn RAM
    videoFrame.close();

    // 5. Cập nhật tiến trình & ETA
    const elapsed = (performance.now() - startTime) / 1000;
    const progressPercent = Math.min(99, Math.round(((frameIndex + 1) / totalFrames) * 100));
    const eta = frameIndex > 0 ? (elapsed / frameIndex) * (totalFrames - frameIndex) : 0;

    onProgress(progressPercent, frameIndex + 1, totalFrames, Math.max(0, Math.ceil(eta)));

    // Nhường chu kỳ CPU định kỳ cho hàng đợi sự kiện
    if (frameIndex % 15 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // 6. Xả hàng đợi mã hóa (Flush) và đóng gói Muxer
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

// Xử lý thông điệp nếu chạy trong ngữ cảnh Dedicated Worker
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
          self.postMessage({
            type: 'COMPLETE',
            blob,
          });
        },
        (error) => {
          self.postMessage({
            type: 'ERROR',
            error,
          });
        },
        () => isCancelled
      );
    }
  };
}
